const crypto = require("crypto");


// =====================================================
// Create Public Key
// =====================================================

const createPublicKey = (publicKeyBase64) => {

  if (!publicKeyBase64) {
    throw new Error(
      "ABDM public key is required"
    );
  }

  const publicKeyDer =
    Buffer.from(
      publicKeyBase64,
      "base64"
    );

  return crypto.createPublicKey({

    key: publicKeyDer,

    format: "der",

    type: "spki",
  });
};


// =====================================================
// Encrypt Value Using ABDM Public Key
// =====================================================

const encryptWithAbdmPublicKey = (
  value,
  publicKeyBase64
) => {

  if (
    value === undefined ||
    value === null
  ) {
    throw new Error(
      "Value to encrypt is required"
    );
  }

  const publicKey =
    createPublicKey(
      publicKeyBase64
    );

  const encrypted =
    crypto.publicEncrypt(

      {
        key: publicKey,

        padding:
          crypto.constants
            .RSA_PKCS1_OAEP_PADDING,

        oaepHash: "sha1",
      },

      Buffer.from(
        String(value),
        "utf8"
      )
    );

  return encrypted.toString(
    "base64"
  );
};


module.exports = {

  createPublicKey,

  encryptWithAbdmPublicKey,
};