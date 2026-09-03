const express = require("express");

const {
  requestOtp,
  verifyOtp,
} = require("../controllers/abha.controller");

const router = express.Router();


// Aadhaar → OTP
router.post(
  "/request-otp",
  requestOtp
);


// OTP → ABHA
router.post(
  "/verify-otp",
  verifyOtp
);


module.exports = router;