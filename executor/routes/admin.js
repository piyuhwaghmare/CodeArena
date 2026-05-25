const express = require('express');
const pool = require('../db');

const router = express.Router();

//Get all problems
router.get('/problems', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM problems ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

//Add new Problem
router.post('/problems', async (req, res) => {
    const { title, description, difficulty } = req.body;

    if (!title || !description || !difficulty) {
        return res.status(400).json({
            error: 'title, description and difficulty required'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO problems (title, description, difficulty)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [title, description, difficulty]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete problem
router.delete('/problems/:id', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM problems WHERE id = $1',
            [req.params.id]
        );
        res.json({ message: 'Problem deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all submissions
router.get('/submissions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                s.id, s.code, s.language, s.status,
                s.output, s.exec_time_ms, s.submitted_at,
                u.username, u.email,
                p.title as problem
             FROM submissions s
             LEFT JOIN users u ON s.user_id = u.id
             LEFT JOIN problems p ON s.problem_id = p.id
             ORDER BY s.submitted_at DESC
             LIMIT 100`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete submission
router.delete('/submissions/:id', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM submissions WHERE id = $1',
            [req.params.id]
        );
        res.json({ message: 'Submission deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
               u.id, u.username, u.email, u.role, u.created_at,
               COUNT(s.id) as total_submissions,
               COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as accepted
            FROM users u
            LEFT JOIN submissions s ON u.id = s.user_id
            WHERE u.role = 'user'                          -- ← filter here
            GROUP BY u.id
            ORDER BY u.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM users WHERE id = $1',
            [req.params.id]
        );
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [users, submissions, problems, accepted] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM submissions'),
            pool.query('SELECT COUNT(*) FROM problems'),
            pool.query(
                `SELECT COUNT(*) FROM submissions WHERE status = 'accepted'`
            )
        ]);

        res.json({
            totalUsers:       parseInt(users.rows[0].count),
            totalSubmissions: parseInt(submissions.rows[0].count),
            totalProblems:    parseInt(problems.rows[0].count),
            acceptedCount:    parseInt(accepted.rows[0].count),
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get test cases for a problem
router.get('/problems/:id/testcases', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM test_cases
             WHERE problem_id = $1
             ORDER BY id ASC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add test case to problem
router.post('/problems/:id/testcases', async (req, res) => {
    const { input, expected_output, is_hidden } = req.body;

    if (expected_output === undefined) {
        return res.status(400).json({
            error: 'expected_output is required'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO test_cases
                (problem_id, input, expected_output, is_hidden)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                req.params.id,
                input || '',
                expected_output,
                is_hidden || false
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete test case
router.delete('/testcases/:id', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM test_cases WHERE id = $1',
            [req.params.id]
        );
        res.json({ message: 'Test case deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;