const express = require("express");
const router = new express.Router();
const { signUpUser, loginUser, authUser } = require("../controllers/userControllers");
 
router.post("/signup", signUpUser);
router.post("/login", loginUser);
// router.get("/:id", authUser);

module.exports = router;
