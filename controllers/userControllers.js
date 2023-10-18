const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const { generateToken } = require("../auth/jwtToken");
const bcrypt = require("bcrypt");

const signUpUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json("User already exists");
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });
  if (newUser) {
    res.status(201).json("Registration Successful");
  } else {
    res.status(400);
    throw new Error("Failed to Create New User");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userLogin = await User.findOne({ email });

  if (userLogin) {
    const isMatch = await bcrypt.compare(password, userLogin.password);
    if (isMatch) {
      const token = await generateToken(userLogin._id);
      console.log(token);
      return res.status(201).json({
        _id: userLogin._id,
        jwt: token,
        maxAge: 25892000000
      })
    } else {
      res.status(400).json("Invalid Credentials");
    }
  } else {
    res.status(400).json("User Not Found");
  }
});

const authUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.find({ _id });
    if(user!==null) {
      res.status(200).json("User Found");
    }
    else {
      res.status(400).json("User Not Found");
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = { signUpUser, loginUser, authUser };
