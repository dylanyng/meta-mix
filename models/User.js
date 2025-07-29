// User schema, googleID, appleID, credits
// All boiler plate below
// const bcrypt = require("bcrypt"); // Removed bcrypt
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("User", UserSchema);