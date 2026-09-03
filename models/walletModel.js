const pool = require("../config/db");


// =====================================
// GET WALLET
// =====================================

exports.getWallet = async (userId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM wallets
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};


// =====================================
// CREATE WALLET
// =====================================

exports.createWallet = async (userId) => {

    const result = await pool.query(
        `
        INSERT INTO wallets
        (
            user_id,
            balance
        )
        VALUES
        (
            $1,
            0
        )
        RETURNING *
        `,
        [userId]
    );

    return result.rows[0];
};


// =====================================
// CREDIT WALLET
// =====================================

exports.creditWallet = async (
    client,
    userId,
    amount,
    referenceId,
    description
) => {

    const walletResult =
        await client.query(
            `
            SELECT *
            FROM wallets
            WHERE user_id = $1
            FOR UPDATE
            `,
            [userId]
        );


    if (walletResult.rows.length === 0) {

        throw new Error(
            "Wallet not found"
        );

    }


    const wallet =
        walletResult.rows[0];


    const balanceBefore =
        Number(wallet.balance);


    const balanceAfter =
        balanceBefore + Number(amount);


    await client.query(
        `
        UPDATE wallets

        SET
            balance = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $2
        `,
        [
            balanceAfter,
            wallet.id
        ]
    );


    await client.query(
        `
        INSERT INTO wallet_transactions
        (
            wallet_id,
            type,
            amount,
            balance_before,
            balance_after,
            reference_type,
            reference_id,
            description
        )
        VALUES
        (
            $1,
            'CREDIT',
            $2,
            $3,
            $4,
            'PHONEPE',
            $5,
            $6
        )
        `,
        [
            wallet.id,
            amount,
            balanceBefore,
            balanceAfter,
            referenceId,
            description
        ]
    );


    return {
        balanceBefore,
        balanceAfter
    };
};


// =====================================
// DEBIT WALLET
// =====================================

exports.debitWallet = async (
    client,
    userId,
    amount,
    referenceId,
    description
) => {

    const walletResult =
        await client.query(
            `
            SELECT *
            FROM wallets
            WHERE user_id = $1
            FOR UPDATE
            `,
            [userId]
        );


    if (walletResult.rows.length === 0) {

        throw new Error(
            "Wallet not found"
        );

    }


    const wallet =
        walletResult.rows[0];


    const balanceBefore =
        Number(wallet.balance);


    if (
        balanceBefore < Number(amount)
    ) {

        throw new Error(
            "Insufficient wallet balance"
        );

    }


    const balanceAfter =
        balanceBefore - Number(amount);


    await client.query(
        `
        UPDATE wallets

        SET
            balance = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $2
        `,
        [
            balanceAfter,
            wallet.id
        ]
    );


    await client.query(
        `
        INSERT INTO wallet_transactions
        (
            wallet_id,
            type,
            amount,
            balance_before,
            balance_after,
            reference_type,
            reference_id,
            description
        )
        VALUES
        (
            $1,
            'DEBIT',
            $2,
            $3,
            $4,
            'ORDER',
            $5,
            $6
        )
        `,
        [
            wallet.id,
            amount,
            balanceBefore,
            balanceAfter,
            referenceId,
            description
        ]
    );


    return {
        balanceBefore,
        balanceAfter
    };
};