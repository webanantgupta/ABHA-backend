const axios = require("axios");
const crypto = require("crypto");

const ABDM_BASE_URL =
  process.env.ABDM_BASE_URL || "https://dev.abdm.gov.in";

const ABHA_BASE_URL =
  process.env.ABHA_BASE_URL ||
  "https://abhasbx.abdm.gov.in/abha/api";

const ABDM_CLIENT_ID = process.env.ABDM_CLIENT_ID;
const ABDM_CLIENT_SECRET = process.env.ABDM_CLIENT_SECRET;

const ABDM_SESSION_URL =
  process.env.ABDM_SESSION_URL ||
  `${ABDM_BASE_URL}/api/hiecm/gateway/v3/sessions`;

const ABDM_CERTIFICATE_URL =
  process.env.ABDM_CERTIFICATE_URL ||
  `${ABHA_BASE_URL}/v3/profile/public/certificate`;

const ABDM_AADHAAR_OTP_URL =
  process.env.ABDM_AADHAAR_OTP_URL ||
  `${ABHA_BASE_URL}/v3/enrollment/request/otp`;

const ABDM_AADHAAR_ENROLL_URL =
  process.env.ABDM_AADHAAR_ENROLL_URL ||
  `${ABHA_BASE_URL}/v3/enrollment/enrol/byAadhaar`;

const ABDM_CM_ID =
  process.env.ABDM_CM_ID || "sbx";

const ABDM_API_TIMEOUT =
  Number(process.env.ABDM_API_TIMEOUT) || 30000;


/**
 * Generate unique REQUEST-ID
 */
const generateRequestId = () => {
  return crypto.randomUUID();
};


/**
 * Generate ABDM request headers
 */
const getCommonHeaders = (accessToken = null) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",

    "REQUEST-ID": generateRequestId(),

    TIMESTAMP: new Date().toISOString(),

    "X-CM-ID": ABDM_CM_ID,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};


/**
 * Generic ABDM request
 */
const abdmRequest = async ({
  method,
  url,
  data,
  accessToken = null,
  headers = {},
}) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      timeout: ABDM_API_TIMEOUT,

      headers: {
        ...getCommonHeaders(accessToken),
        ...headers,
      },
    });

    return response.data;

  } catch (error) {

    console.error("=================================");
    console.error("ABDM REQUEST FAILED");
    console.error("URL:", url);
    console.error("METHOD:", method);
    console.error("STATUS:", error.response?.status);
    console.error(
      "DATA:",
      error.response?.data
    );
    console.error("=================================");

    throw error;
  }
};


/**
 * 1. Generate ABDM session
 */
const getSession = async () => {

  if (!ABDM_CLIENT_ID) {
    throw new Error(
      "ABDM_CLIENT_ID is missing in .env"
    );
  }

  if (!ABDM_CLIENT_SECRET) {
    throw new Error(
      "ABDM_CLIENT_SECRET is missing in .env"
    );
  }

  const response = await abdmRequest({
    method: "POST",

    url: ABDM_SESSION_URL,

    data: {
      clientId: ABDM_CLIENT_ID,

      clientSecret: ABDM_CLIENT_SECRET,

      grantType: "client_credentials",
    },

    headers: {
      // Session API doesn't need Bearer token
      Authorization: undefined,
    },
  });

  return response;
};


/**
 * 2. Get ABDM public certificate
 */
const getPublicCertificate = async (
  accessToken
) => {

  if (!accessToken) {
    throw new Error(
      "ABDM access token is required"
    );
  }

  const response = await abdmRequest({
    method: "GET",

    url: ABDM_CERTIFICATE_URL,

    accessToken,
  });

  return response;
};


/**
 * 3. Request Aadhaar OTP
 */
const requestAadhaarOtp = async ({
  accessToken,
  encryptedAadhaar,
}) => {

  if (!accessToken) {
    throw new Error(
      "ABDM access token is required"
    );
  }

  if (!encryptedAadhaar) {
    throw new Error(
      "Encrypted Aadhaar is required"
    );
  }

  const response = await abdmRequest({

    method: "POST",

    url: ABDM_AADHAAR_OTP_URL,

    accessToken,

    data: {

      scope: [
        "abha-enrol",
      ],

      loginHint: "aadhaar",

      loginId: encryptedAadhaar,

      otpSystem: "aadhaar",
    },
  });

  return response;
};


/**
 * 4. Enroll using Aadhaar OTP
 */
const enrollByAadhaar = async ({
  accessToken,
  txnId,
  encryptedOtp,
  mobile,
}) => {
  if (!accessToken) {
    throw new Error("ABDM access token is required");
  }

  if (!txnId) {
    throw new Error("Transaction ID is required");
  }

  if (!encryptedOtp) {
    throw new Error("Encrypted OTP is required");
  }

  if (!mobile) {
    throw new Error("Mobile number is required");
  }

  const response = await abdmRequest({
    method: "POST",

    url: process.env.ABDM_AADHAAR_ENROLL_URL,

    accessToken,

    data: {
      txnId,

      scope: [
        "abha-enrol"
      ],

      authData: {
        authMethods: [
          "otp"
        ],

        otp: {
          txnId,

          otpValue: encryptedOtp,

          mobile,
        },
      },

      consent: {
        code: "abha-enrollment",
        version: "1.4",
      },
    },
  });

  return response;
};


module.exports = {getSession,getPublicCertificate,requestAadhaarOtp,enrollByAadhaar,abdmRequest,};