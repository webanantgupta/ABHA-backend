const phonepeService =
    require("../services/phonepeService");

const paymentModel =
    require("../models/paymentModel");


// =====================================
// CREATE PAYMENT
// =====================================

const createPayment = async (req, res) => {

    try {

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
        // SAVE PAYMENT
        // =====================================

        await paymentModel.createPayment({

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


        const response =
            await phonepeService.getOrderStatus(
                merchantOrderId
            );


        return res.status(200).json({

            success: true,

            data: response

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


module.exports = {

    createPayment,

    checkPaymentStatus

};