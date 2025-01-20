const userModel = require("../../models/userModels");
const bcrypt = require('bcryptjs');

async function userSignUpController(req, res) {
    try {
        // Destructure the required fields from req.body
        const { username, email, password } = req.body;

        console.log(req.body); // Debugging: Check the incoming data

        // Validation
        if (!username || !email || !password) {
            throw new Error("All fields (username, email, and password) are required.");
        }

        // Check if email or username already exists
        const existingUser = await userModel.findOne({ email });
        const existingUsername = await userModel.findOne({ username });

        if (existingUser) {
            throw new Error("This email is already registered. Please log in or use a different email.");
        }
        if (existingUsername) {
            throw new Error("This username is taken. Please choose a different username.");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create payload
        const payload = {
            ...req.body,
            password: hashedPassword, // Use the hashed password
        };

        // Save the user to the database
        const userData = new userModel(payload);
        const savedUser = await userData.save();

        // Success response
        res.status(201).json({
            data: savedUser,
            success: true,
            error: false,
            message: "User created successfully!",
        });

    } catch (err) {
        // Error response
        res.status(400).json({
            message: err.message || "An unexpected error occurred.",
            error: true,
            success: false,
        });
    }
}

module.exports = userSignUpController;
