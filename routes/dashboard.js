// Route for /dashboard
const express = require('express');
const router = express.Router();
const dashboardController = require("../controllers/dashboard");

// @desc    Dashboard
// @route   GET /dashboard
router.get('/', dashboardController.getDashboard);

module.exports = router;