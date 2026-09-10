const express = require("express");

const paymentController =
    require("../controllers/phonepeController");

const {
    authenticate
} = require("../middleware/auth.middleware");

const router = express.Router();


// =====================================
// CREATE PAYMENT
// =====================================

router.post(
    "/create",
    authenticate,
    paymentController.createPayment
);


// =====================================
// CHECK PAYMENT STATUS
// =====================================

router.get(
    "/status/:merchantOrderId",
    authenticate,
    paymentController.checkPaymentStatus
);


// =====================================
// PAYMENT HISTORY
// =====================================

router.get(
    "/history",
    authenticate,
    paymentController.getPaymentHistory
);


module.exports = router;