const express = require("express");
const router = express.Router();
const homeController = require('../controllers/home');
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/", homeController.getIndex);

router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login'
  })
})

router.get('/dashboard', ensureAuth, (req, res) => {
  console.log(req.user)
  res.render('dashboard')
})

module.exports = router;
