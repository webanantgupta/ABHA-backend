const bcrypt = require("bcrypt");

const userModel =
    require("../models/user.model");

const {
    generateToken
} = require("../utils/jwt");


// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // ------------------------------
        // Validation
        // ------------------------------

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required"
            });
        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters"
            });
        }


        // ------------------------------
        // Check existing user
        // ------------------------------

        const existingUser =
            await userModel.findByEmail(
                email
            );


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already registered"
            });
        }


        // ------------------------------
        // Hash password
        // ------------------------------

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );


        // ------------------------------
        // Create user
        // ------------------------------

        const user =
            await userModel.create({

                name,

                email,

                passwordHash,

                // IMPORTANT:
                // Public registration
                // always creates patient

                role: "patient"
            });


        // ------------------------------
        // Generate JWT
        // ------------------------------

        const token =
            generateToken(user);


        // ------------------------------
        // Response
        // ------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Registration successful",

            token,

            user
        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Registration failed",
                error:error.message
        });
    }
};


// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ------------------------------
        // Validation
        // ------------------------------

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"
            });
        }


        // ------------------------------
        // Find user
        // ------------------------------

        const user =
            await userModel.findByEmail(
                email
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        // ------------------------------
        // Compare password
        // ------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"
            });
        }


        // ------------------------------
        // Generate JWT
        // ------------------------------

        const token =
            generateToken(user);


        // ------------------------------
        // Response
        // ------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role
            }
        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Login failed"
        });
    }
};

const getMe = async (req, res) => {

    try {

        // userId comes from JWT
        const userId = req.user.userId;

        // Find complete user from database
        const user = await userModel.findById(userId);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"
            });
        }

        return res.status(200).json({

            success: true,

            message: "Authenticated user",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error(
            "GET ME ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to get authenticated user"
        });
    }
};


module.exports = {
    register,
    login,
    getMe
};