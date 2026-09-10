const express = require("express");
const {
    authenticate
} = require("../middleware/auth.middleware");
const {
    register,
    login, getMe
} = require("../controllers/auth.controller");

const router = express.Router();


router.post(
    "/register",
    register
);


router.post(
    "/login",
    login
);
router.get(
    "/me",
    authenticate,
    getMe
);


module.exports = router;