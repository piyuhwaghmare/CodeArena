const jwt = require('jsonwebtoken');
const { createClient } = require('redis');

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: 6379
    }
});

redisClient.connect();

const verifyToken = async (req, res, next) => {
   try {
      //Get token from cookie.
      const token = req.cookies.access_token;

      if(!token) {
        return res.status(401).json({ error: 'Access token missing' });
      }

      //Check Redis BlackList
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if(isBlacklisted) {
        return res.status(401).json({ error: 'Token is blacklisted' });
      }

      //verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();

   } catch (err) {
       if(err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
       }

       return res.status(401).json({ error: 'Invalid token' });
   }
};

module.exports = { verifyToken, redisClient };