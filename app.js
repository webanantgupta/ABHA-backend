const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.route");
const paymentRoutes = require("./routes/phonepeRoutes");
const abhaRoutes = require("./routes/abha.route");
const appointmentRoutes = require("./routes/appointment.route");

const app = express();

// =====================================
// CORS CONFIGURATION
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://abha-frontend.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without Origin
    // Example: Postman / server-to-server
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

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// =====================================
// BODY PARSER
// =====================================

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

// =====================================
// AUTH ROUTES
// =====================================

app.use("/api/v1/auth", authRoutes);

// =====================================
// ABHA ROUTES
// =====================================

app.use("/api/v2/abha", abhaRoutes);

// =====================================
// APPOINTMENT ROUTES
// =====================================

app.use("/api/v3/appointment", appointmentRoutes);

// =====================================
// EXPORT APP
// =====================================

module.exports = app;