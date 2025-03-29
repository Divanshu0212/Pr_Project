const userModel = require("../../models/userModels");
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

async function userSignUpController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    const existingUsername = await userModel.findOne({ username });

    if (existingUser) {
      throw new Error("This email is already registered. Please log in or use a different email.");
    }
    if (existingUsername) {
      throw new Error("This username is taken. Please choose a different username.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const payload = {
      username,
      email,
      password: hashedPassword,
    };

    const userData = new userModel(payload);
    const savedUser = await userData.save();

    res.status(201).json({
      data: savedUser,
      success: true,
      error: false,
      message: "User created successfully!",
    });

  } catch (err) {
    res.status(400).json({
      message: err.message || "An unexpected error occurred.",
      error: true,
      success: false,
    });
  }
}

module.exports = userSignUpController;