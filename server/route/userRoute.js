const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const {
  registerUser,
  getAllUser,
  getUserLocation,
} = require("../controller/register");
router.route("/registerUser").post(registerUser);
router.route("/getUsers").post(getAllUser);
router.route("/getUserLocation").post(getUserLocation);
module.exports = router;
