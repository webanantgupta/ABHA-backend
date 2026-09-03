require("dotenv").config();

const {
    StandardCheckoutClient,
    Env,
    StandardCheckoutPayRequest
} = require("@phonepe-pg/pg-sdk-node");

const clientId =
    process.env.PHONEPE_CLIENT_ID;

const clientSecret =
    process.env.PHONEPE_CLIENT_SECRET;

const clientVersion =
    Number(process.env.PHONEPE_CLIENT_VERSION);


console.log("================================");
console.log("PHONEPE TEST");
console.log("================================");

console.log(
    "Client ID loaded:",
    !!clientId
);

console.log(
    "Client Secret loaded:",
    !!clientSecret
);

console.log(
    "Client Secret length:",
    clientSecret?.length
);

console.log(
    "Client Version:",
    clientVersion
);

console.log(
    "Environment:",
    process.env.PHONEPE_ENV
);


const client =
    StandardCheckoutClient.getInstance(
        clientId,
        clientSecret,
        clientVersion,
        Env.SANDBOX
    );


async function test() {

    try {

        const merchantOrderId =
            `TEST_${Date.now()}`;

        const request =
            StandardCheckoutPayRequest
                .builder()

                .merchantOrderId(
                    merchantOrderId
                )

                .amount(
                    5000
                )

                .redirectUrl(
                    "http://localhost:5173/payment/result"
                )

                .build();


        console.log(
            "\nCalling PhonePe..."
        );

        console.log(
            "Order:",
            merchantOrderId
        );


        const response =
            await client.pay(
                request
            );


        console.log(
            "\nSUCCESS"
        );

        console.log(
            response
        );


    } catch (error) {

        console.log(
            "\nPHONEPE ERROR"
        );

        console.log(
            "Name:",
            error.name
        );

        console.log(
            "Type:",
            error.type
        );

        console.log(
            "HTTP Status:",
            error.httpStatusCode
        );

        console.log(
            "Code:",
            error.code
        );

        console.log(
            "Message:",
            error.message
        );

        console.log(
            "Data:",
            error.data
        );

        console.log(
            "Full error:",
            error
        );

    }

}


test();