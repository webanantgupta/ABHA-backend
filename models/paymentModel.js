const db = require("../config/db");

const paymentModel = {

    // =====================================
    // CREATE PAYMENT
    // =====================================

    createPayment: async (paymentData, client = db) => {

        const sql = `
            INSERT INTO payments
            (
                user_id,
                merchant_order_id,
                phonepe_order_id,
                amount,
                status,
                response_data
            )
            VALUES
            ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [

            paymentData.user_id,

            paymentData.merchant_order_id,

            paymentData.phonepe_order_id || null,

            paymentData.amount,

            paymentData.status || "PENDING",

            paymentData.response_data || null

        ];

        const result =
            await client.query(
                sql,
                values
            );

        return result.rows[0];
    },


    // =====================================
    // FIND PAYMENT
    // =====================================

    findByMerchantOrderId: async (
        merchantOrderId,
        client = db
    ) => {

        const sql = `
            SELECT *
            FROM payments
            WHERE merchant_order_id = $1
            LIMIT 1
        `;

        const result =
            await client.query(
                sql,
                [merchantOrderId]
            );

        return result.rows[0] || null;
    },


    // =====================================
    // UPDATE PAYMENT
    // =====================================

    updatePayment: async (
        merchantOrderId,
        paymentData,
        client = db
    ) => {

        const sql = `
            UPDATE payments

            SET
                phonepe_order_id = $1,
                status = $2,
                response_data = $3,
                updated_at = CURRENT_TIMESTAMP

            WHERE merchant_order_id = $4

            RETURNING *
        `;

        const values = [

            paymentData.phonepe_order_id || null,

            paymentData.status,

            paymentData.response_data || null,

            merchantOrderId

        ];

        const result =
            await client.query(
                sql,
                values
            );

        return result.rows[0] || null;
    },


    // =====================================
    // PAYMENT HISTORY
    // =====================================

    findPaymentsByUserId: async (
        userId,
        client = db
    ) => {

        const sql = `
            SELECT
                id,
                merchant_order_id,
                phonepe_order_id,
                amount,
                status,
                response_data,
                created_at,
                updated_at
            FROM payments
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;

        const result =
            await client.query(
                sql,
                [userId]
            );

        return result.rows;
    }

};

module.exports = paymentModel;