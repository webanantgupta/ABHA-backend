const {
    StandardCheckoutClient,
    Env
} = require("@phonepe-pg/pg-sdk-node");


const clientId =
    process.env.PHONEPE_CLIENT_ID;

const clientSecret =
    process.env.PHONEPE_CLIENT_SECRET;

const clientVersion =
    Number(
        process.env.PHONEPE_CLIENT_VERSION
    );


const environment =
    process.env.PHONEPE_ENV === "PRODUCTION"
        ? Env.PRODUCTION
        : Env.SANDBOX;


if (!clientId) {

    throw new Error(
        "PHONEPE_CLIENT_ID is missing"
    );
}


if (!clientSecret) {

    throw new Error(
        "PHONEPE_CLIENT_SECRET is missing"
    );
}


if (!clientVersion) {

    throw new Error(
        "PHONEPE_CLIENT_VERSION is missing"
    );
}


const phonePeClient =
    StandardCheckoutClient.getInstance(

        clientId,

        clientSecret,

        clientVersion,

        environment

    );


module.exports =
    phonePeClient;