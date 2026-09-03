const phonePeClient =
    require("../config/phonepe");

const {
    StandardCheckoutPayRequest
} = require("@phonepe-pg/pg-sdk-node");

const {
    randomUUID
} = require("crypto");


// =====================================
// CREATE PAYMENT
// =====================================

const createPayment = async ({
    amount,
    redirectUrl
}) => {

    if (
        amount === undefined ||
        amount === null ||
        Number(amount) <= 0
    ) {
        throw new Error(
            "Invalid payment amount"
        );
    }


    if (!redirectUrl) {

        throw new Error(
            "Redirect URL is required"
        );
    }


    const merchantOrderId =
        `ORDER_${randomUUID()}`;


    const request =
        StandardCheckoutPayRequest
            .builder()

            .merchantOrderId(
                merchantOrderId
            )

            .amount(
                Number(amount)
            )

            .redirectUrl(
                redirectUrl
            )

            .build();


    console.log(
        "Creating PhonePe order:",
        merchantOrderId
    );


    const response =
        await phonePeClient.pay(
            request
        );


    console.log(
        "PhonePe response:",
        response
    );


    return {

        merchantOrderId,

        response

    };
};


// =====================================
// CHECK ORDER STATUS
// =====================================

const getOrderStatus = async (
    merchantOrderId
) => {

    if (!merchantOrderId) {

        throw new Error(
            "Merchant order ID is required"
        );
    }


    return await phonePeClient.getOrderStatus(
        merchantOrderId
    );
};


module.exports = {

    createPayment,

    getOrderStatus

};