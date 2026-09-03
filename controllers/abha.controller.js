const {
  getSession,
  getPublicCertificate,
  requestAadhaarOtp,
  enrollByAadhaar,
} = require("../services/abdm.service");

const {
  encryptWithAbdmPublicKey,
} = require("../utils/encryption");

// =====================================================
// REQUEST AADHAAR OTP
// =====================================================

const requestOtp = async (req, res) => {
  try {
    const { aadhaar } = req.body;

    // -------------------------------------------------
    // 1. Validate Aadhaar
    // -------------------------------------------------

    if (!aadhaar) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number is required",
      });
    }

    if (!/^\d{12}$/.test(String(aadhaar))) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must contain exactly 12 digits",
      });
    }

    // -------------------------------------------------
    // 2. Get ABDM Session
    // -------------------------------------------------

    const session = await getSession();

    if (!session || !session.accessToken) {
      return res.status(500).json({
        success: false,
        message: "Unable to obtain ABDM access token",
      });
    }

    const accessToken = session.accessToken;

    // -------------------------------------------------
    // 3. Get ABDM Public Certificate
    // -------------------------------------------------

    const certificate = await getPublicCertificate(accessToken);

    if (!certificate || !certificate.publicKey) {
      return res.status(500).json({
        success: false,
        message: "Unable to obtain ABDM public key",
      });
    }

    // -------------------------------------------------
    // 4. Encrypt Aadhaar
    // -------------------------------------------------

    const encryptedAadhaar = encryptWithAbdmPublicKey(
      String(aadhaar),
      certificate.publicKey
    );

    // -------------------------------------------------
    // 5. Request Aadhaar OTP from ABDM
    // -------------------------------------------------

    const otpResponse = await requestAadhaarOtp({
      accessToken,
      encryptedAadhaar,
    });

    // -------------------------------------------------
    // 6. Return only required information
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      txnId:
        otpResponse?.txnId ||
        otpResponse?.transactionId ||
        null,

      message:
        otpResponse?.message ||
        "OTP sent successfully",
    });
  } catch (error) {
    console.error(
      "Request Aadhaar OTP Error:",
      error.response?.data || error.message
    );

    const statusCode =
      error.response?.status || 500;

    return res.status(statusCode).json({
      success: false,

      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to send Aadhaar OTP",

      error:
        process.env.NODE_ENV === "development"
          ? error.response?.data || null
          : null,
    });
  }
};

// =====================================================
// VERIFY OTP / ENROLL BY AADHAAR
// =====================================================

const verifyOtp = async (req, res) => {
  try {
    const {
      txnId,
      otp,
      mobile,
    } = req.body;

    // -------------------------------------------------
    // 1. Validate Transaction ID
    // -------------------------------------------------

    if (!txnId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // -------------------------------------------------
    // 2. Validate OTP
    // -------------------------------------------------

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "OTP must contain exactly 6 digits",
      });
    }

    // -------------------------------------------------
    // 3. Validate Mobile
    // -------------------------------------------------

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    if (!/^[6-9]\d{9}$/.test(String(mobile))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10 digit mobile number",
      });
    }

    // -------------------------------------------------
    // 4. Get ABDM Session
    // -------------------------------------------------

    const session = await getSession();

    if (!session || !session.accessToken) {
      return res.status(500).json({
        success: false,
        message: "Unable to obtain ABDM access token",
      });
    }

    const accessToken = session.accessToken;

    // -------------------------------------------------
    // 5. Get ABDM Public Certificate
    // -------------------------------------------------

    const certificate =
      await getPublicCertificate(accessToken);

    if (!certificate || !certificate.publicKey) {
      return res.status(500).json({
        success: false,
        message: "Unable to obtain ABDM public key",
      });
    }

    // -------------------------------------------------
    // 6. Encrypt OTP
    // -------------------------------------------------

    const encryptedOtp =
      encryptWithAbdmPublicKey(
        String(otp),
        certificate.publicKey
      );

    // -------------------------------------------------
    // 7. Verify OTP / Enroll using Aadhaar
    // -------------------------------------------------

    const response = await enrollByAadhaar({
      accessToken,
      txnId,
      encryptedOtp,
      mobile,
    });

    // -------------------------------------------------
    // 8. Extract ABHA Profile
    // -------------------------------------------------

    const profile = response?.ABHAProfile;

    // -------------------------------------------------
    // 9. Prepare Response
    // -------------------------------------------------

    const result = {
      success: true,

      message:
        response?.message ||
        "OTP verified successfully",

      txnId:
        response?.txnId ||
        txnId,

      isNew:
        response?.isNew ?? null,

      ABHAProfile: profile
        ? {
            preferredAddress:
              profile.preferredAddress || null,

            firstName:
              profile.firstName || null,

            middleName:
              profile.middleName || null,

            lastName:
              profile.lastName || null,

            dob:
              profile.dob || null,

            gender:
              profile.gender || null,

            mobile:
              profile.mobile || null,

            mobileVerified:
              profile.mobileVerified ?? null,

            phrAddress:
              profile.phrAddress || null,

            address:
              profile.address || null,

            districtCode:
              profile.districtCode || null,

            stateCode:
              profile.stateCode || null,

            pinCode:
              profile.pinCode || null,

            stateName:
              profile.stateName || null,

            districtName:
              profile.districtName || null,

            ABHANumber:
              profile.ABHANumber || null,

            abhaStatus:
              profile.abhaStatus || null,
          }
        : null,
    };

    // -------------------------------------------------
    // 10. Send Response to React
    // -------------------------------------------------

    return res.status(200).json(result);

  } catch (error) {

    console.error(
      "Verify OTP Error:",
      error.response?.data || error.message
    );

    const statusCode =
      error.response?.status || 500;

    return res.status(statusCode).json({
      success: false,

      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to verify OTP",

      error:
        process.env.NODE_ENV === "development"
          ? error.response?.data || null
          : null,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  requestOtp,
  verifyOtp,
};