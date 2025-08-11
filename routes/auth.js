const express = require('express');
const passport = require('passport')
const router = express.Router();

// Authenticate with Google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

// Google auth callback
router.get(
  '/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard')
  }
);

// Logout user
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;