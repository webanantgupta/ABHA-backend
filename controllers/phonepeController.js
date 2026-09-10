const phonepeService =
    require("../services/phonepeService");

const paymentModel =
    require("../models/paymentModel");


// =====================================
// CREATE PAYMENT
// =====================================

const createPayment = async (req, res) => {

    try {

        // =====================================
        // GET LOGGED-IN USER FROM JWT
        // =====================================

        const userId = req.user.userId;

        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication required"

            });
        }


        const {
            amount
        } = req.body;


        // =====================================
        // VALIDATE AMOUNT
        // =====================================

        if (
            amount === undefined ||
            amount === null ||
            Number(amount) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid amount"

            });
        }


        const numericAmount =
            Number(amount);


        // =====================================
        // CONVERT RUPEES TO PAISE
        // =====================================

        const amountInPaise =
            Math.round(
                numericAmount * 100
            );


        // =====================================
        // PHONEPE REDIRECT URL
        // =====================================

        const redirectUrl =
            `${process.env.FRONTEND_URL}/payment/result`;


        console.log(
            "User ID:",
            userId
        );

        console.log(
            "Amount:",
            numericAmount
        );

        console.log(
            "Amount in paise:",
            amountInPaise
        );

        console.log(
            "Redirect URL:",
            redirectUrl
        );


        // =====================================
        // CREATE PHONEPE ORDER
        // =====================================

        const result =
            await phonepeService.createPayment({

                amount:
                    amountInPaise,

                redirectUrl

            });


        const merchantOrderId =
            result.merchantOrderId;


        const phonePeResponse =
            result.response;


        console.log(
            "Merchant Order ID:",
            merchantOrderId
        );

        console.log(
            "PhonePe Response:",
            phonePeResponse
        );


        // =====================================
        // SAVE PAYMENT IN DATABASE
        // =====================================
        // IMPORTANT:
        // user_id comes from JWT
        // NOT from frontend
        // =====================================

        await paymentModel.createPayment({

            user_id:
                userId,

            merchant_order_id:
                merchantOrderId,

            phonepe_order_id:
                phonePeResponse.orderId ||
                null,

            amount:
                amountInPaise,

            status:
                "PENDING",

            response_data:
                phonePeResponse

        });


        // =====================================
        // GET PHONEPE PAYMENT URL
        // =====================================

        const paymentUrl =
            phonePeResponse.redirectUrl;


        if (!paymentUrl) {

            console.error(
                "PhonePe payment URL missing:",
                phonePeResponse
            );

            return res.status(500).json({

                success: false,

                message:
                    "PhonePe payment URL was not received"

            });
        }


        // =====================================
        // SEND RESPONSE TO FRONTEND
        // =====================================

        return res.status(200).json({

            success: true,

            message:
                "Payment created successfully",

            merchantOrderId,

            paymentUrl

        });


    } catch (error) {

        console.error(
            "CREATE PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to create payment"

        });

    }

};


// =====================================
// CHECK PAYMENT STATUS
// =====================================

const checkPaymentStatus = async (
    req,
    res
) => {

    try {

        // =====================================
        // GET LOGGED-IN USER
        // =====================================

        const userId =
            req.user.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication required"

            });

        }


        const {
            merchantOrderId
        } = req.params;


        if (!merchantOrderId) {

            return res.status(400).json({

                success: false,

                message:
                    "Merchant order ID is required"

            });

        }


        // =====================================
        // FIND PAYMENT
        // =====================================
        // Make sure this payment belongs
        // to the logged-in user
        // =====================================

        const payment =
            await paymentModel.findByMerchantOrderId(
                merchantOrderId
            );


        if (!payment) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment not found"

            });

        }


        // =====================================
        // SECURITY CHECK
        // =====================================

        if (
            Number(payment.user_id) !==
            Number(userId)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to access this payment"

            });

        }


        // =====================================
        // GET STATUS FROM PHONEPE
        // =====================================

        const response =
            await phonepeService.getOrderStatus(
                merchantOrderId
            );


        // =====================================
        // GET PHONEPE STATUS
        // =====================================

        /*
            Depending on your PhonePe response,
            status may be inside response.state
            or another field.

            Example:

            {
                state: "COMPLETED"
            }

        */

        const phonePeStatus =
            response.state ||
            response.status ||
            "PENDING";


        // =====================================
        // CONVERT PHONEPE STATUS
        // =====================================

        let databaseStatus = "PENDING";


        if (
            phonePeStatus === "COMPLETED" ||
            phonePeStatus === "SUCCESS"
        ) {

            databaseStatus = "SUCCESS";

        } else if (
            phonePeStatus === "FAILED"
        ) {

            databaseStatus = "FAILED";

        }


        // =====================================
        // UPDATE PAYMENT IN DATABASE
        // =====================================

        const updatedPayment =
            await paymentModel.updatePayment(

                merchantOrderId,

                {

                    phonepe_order_id:
                        payment.phonepe_order_id,

                    status:
                        databaseStatus,

                    response_data:
                        response

                }

            );


        // =====================================
        // SEND RESPONSE
        // =====================================

        return res.status(200).json({

            success: true,

            data: {

                merchantOrderId,

                status:
                    databaseStatus,

                phonePeResponse:
                    response,

                payment:
                    updatedPayment

            }

        });


    } catch (error) {

        console.error(
            "CHECK PAYMENT STATUS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to check payment status"

        });

    }

};


// =====================================
// GET PAYMENT HISTORY
// =====================================

const getPaymentHistory = async (
    req,
    res
) => {

    try {

        // =====================================
        // GET USER ID FROM JWT
        // =====================================

        const userId =
            req.user.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication required"

            });

        }


        // =====================================
        // GET ONLY THIS USER'S PAYMENTS
        // =====================================

        const payments =
            await paymentModel.findPaymentsByUserId(
                userId
            );


        // =====================================
        // SEND PAYMENT HISTORY
        // =====================================

        return res.status(200).json({

            success: true,

            payments

        });


    } catch (error) {

        console.error(
            "GET PAYMENT HISTORY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch payment history"

        });

    }

};


// =====================================
// EXPORT
// =====================================

module.exports = {

    createPayment,

    checkPaymentStatus,

    getPaymentHistory

};