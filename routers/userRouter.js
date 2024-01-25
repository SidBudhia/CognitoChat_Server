const express = require("express");
const router = new express.Router();
const { signUpUser, loginUser } = require("../controllers/userControllers");
 
router.post("/signup", signUpUser);
router.post("/login", loginUser);

module.exports = router;
