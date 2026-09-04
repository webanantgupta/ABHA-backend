const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/phonepeRoutes");
const abhaRoutes = require("./routes/abha.route");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://abha-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    credentials: true,
  })
);

app.use(express.json());

// =====================================
// ROOT
// =====================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PhonePe Payment Gateway Backend Running",
  });
});

// =====================================
// PAYMENT ROUTES
// =====================================

app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v2/abha", abhaRoutes);

module.exports = app;