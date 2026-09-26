const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.route");
const paymentRoutes = require("./routes/phonepeRoutes");
const abhaRoutes = require("./routes/abha.route");
const appointmentRoutes = require("./routes/appointment.route");

const app = express();

// =====================================
// CORS
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://abha-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman/server-to-server requests
 console.log("CORS ORIGIN:", origin);

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("CORS BLOCKED:", origin);

      return callback(null, false);
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,

    optionsSuccessStatus: 204,
  })
);

// =====================================
// BODY PARSER
// =====================================

app.use(express.json());

// =====================================
// TEST ROUTE
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ABDM Hospital Backend Running",
  });
});

// =====================================
// AUTH
// =====================================

app.use("/api/v1/auth", authRoutes);

// =====================================
// PAYMENT
// =====================================

app.use("/api/v1/payment", paymentRoutes);

// =====================================
// ABHA
// =====================================

app.use("/api/v2/abha", abhaRoutes);

// =====================================
// APPOINTMENT
// =====================================

app.use("/api/v3/appointment", appointmentRoutes);

// =====================================
// ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.message,
  });
});

// =====================================
// EXPORT
// =====================================

module.exports = app;