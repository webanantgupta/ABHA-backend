const jwt = require("jsonwebtoken");


const authenticate = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    "Authorization token required"
            });
        }


        const [type, token] =
            authHeader.split(" ");


        if (
            type !== "Bearer" ||
            !token
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization format"
            });
        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Attach JWT information
        // to request

        req.user = decoded;


        next();


    } catch (error) {

        console.error(
            "AUTH ERROR:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired token"
        });
    }
};


// ==========================================
// ROLE AUTHORIZATION
// ==========================================

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized"
            });
        }


        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied"
            });
        }


        next();
    };
};


module.exports = {
    authenticate,
    authorizeRoles
};