const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const pool = require('../db');
const { redisClient } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

//Zod Schemas
const registerSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(100)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

//Rate Limiter for Auth Routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many attempts. Try again in 15 minutes.' }
});

//Helper - To generate tokens
function generateTokens(user) {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

//Helper - Set Cookies
function setTokenCookies(res, accessToken, refreshToken) {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

//REGISTRATION PROCESS
router.post('/register', async(req, res) => {
    try {
        //Zod Validation
        const validated = registerSchema.parse(req.body);

        // Check if EITHER username OR email exists
        const existing = await pool.query(
         `SELECT username, email FROM users WHERE username = $1 OR email = $2`,
            [validated.username, validated.email]
        );

        if (existing.rows.length > 0) {
            const duplicate = existing.rows[0];
            if (duplicate.username === validated.username) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
            if (duplicate.email === validated.email) {
                return res.status(400).json({ error: 'Email is already registered' });
           }
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 12);

        //save user
        const result = await pool.query(
           `INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, role`,
            [validated.username, validated.email, hashedPassword]
        );

        const user = result.rows[0];

        //Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
             [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        //set Cookies
        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        if(err.name === 'ZodError') {
            return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

//LOGIN PROCESS
router.post('/login', authLimiter, async(req, res) => {
    try {

        const validated = loginSchema.parse(req.body);

        //Find user
        const result = await pool.query(
            `SELECT * from users WHERE email = $1`,
            [validated.email]
        );
        
        if(result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(validated.password, user.password);

        if(!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        //Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        //save refresh token to DB
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
             [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        setTokenCookies(res, accessToken, refreshToken);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        if(err.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed'});
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

//REFRESH TOKEN
router.post('/refresh', async(req, res) => {
    try {

        const refreshToken = req.cookies.refresh_token;
        if(!refreshToken) {
            return res.status(401).json({ error: 'Refresh token missing' });
        }

        //verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        //check if token is in DB
        const stored = await pool.query(
            `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
            [refreshToken]
        );

        if(stored.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        //Get user
        const userResult = await pool.query(
           `SELECT id, email, role FROM users WHERE id = $1`,
           [decoded.id]
        );

        const user = userResult.rows[0];

        //Refresh Token Rotation
        await pool.query(
            `DELETE FROM refresh_tokens WHERE token = $1`,
            [refreshToken]
        );
         
        //Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        //save new refresh token into DB
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
             [user.id, newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        setTokenCookies(res, accessToken, newRefreshToken);

        res.json({ message: 'Token refreshed successfully' });

    } catch (err) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

//LOGOUT PROCESS
router.post('/logout', async(req, res) => {
    try {

        const accessToken = req.cookies.access_token;
        const refreshToken = req.cookies.refresh_token;
        
        //Blacklist Access Token in Redis
        if(accessToken) {
           try {
              const decoded = jwt.decode(accessToken);
              const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

              if(expiresIn > 0) {
                    await redisClient.setEx(
                        `blacklist:${accessToken}`,
                        expiresIn,
                        'blacklisted'
                    );
              } 
           } catch (e) {}
        }

        //Delete refresh token from DB
        if(refreshToken) {
            await pool.query(
                `DELETE FROM refresh_tokens WHERE token = $1`,
                [refreshToken]
            );
        }

        //clear cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        
        res.json({ message: 'Logged out successfully' });

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;