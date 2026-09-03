const express = require("express");

const paymentController =
    require("../controllers/phonepeController");


const router =
    express.Router();


// =====================================
// CREATE PAYMENT
// =====================================

router.post(
    "/create",
    paymentController.createPayment
);


// =====================================
// CHECK PAYMENT STATUS
// =====================================

router.get(
    "/status/:merchantOrderId",
    paymentController.checkPaymentStatus
);


// =====================================
// PHONEPE WEBHOOK
// =====================================

// router.post(
//     "/webhook",
//     paymentController.handleWebhook
// );


module.exports = router;