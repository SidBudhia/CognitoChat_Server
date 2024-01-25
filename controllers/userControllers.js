const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const { generateToken } = require("../auth/jwtToken");
const bcrypt = require("bcrypt");

const signUpUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json("Please Enter all the Fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json("User already exists");
    }

    const newUser = await User.create({
      name,
      email,
      password,
    });

    if (!newUser) {
      res.status(400).json("Failed to Create New User");
    }

    return res.status(201).json("Registration Successful");
  } catch (err) {
    console.error("Error Login user: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json("Please Enter all the Fields");
    }

    const userLogin = await User.findOne({ email });
    if (!userLogin) {
      return res.status(400).json("User Not Found");
    }

    const isMatch = bcrypt.compare(password, userLogin.password);
    if (!isMatch) {
      return res.status(400).json("Invalid Credentials");
    }

    const token = await generateToken(userLogin._id);
    // console.log(token);
    return res.status(201).json({
      _id: userLogin._id,
      jwt: token,
      maxAge: 25892000000,
    });
  } catch (err) {
    console.error("Error Login user: ", err);
    res.status(500).json("Internal server error");
  }
});

module.exports = { signUpUser, loginUser };
