// const express = require("express");
// const cors = require("cors");

// const paymentRoutes = require("./routes/phonepeRoutes");
// const abhaRoutes = require("./routes/abha.route");

// const app = express();

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
//   "https://abha-frontend.vercel.app"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests such as Postman/server-to-server
//       if (!origin) {
//         return callback(null, true);
//       }

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error(`CORS blocked origin: ${origin}`));
//     },

//     methods: [
//       "GET",
//       "POST",
//       "PUT",
//       "PATCH",
//       "DELETE",
//       "OPTIONS",
//     ],

//     credentials: true,
//   })
// );

// app.use(express.json());

// // =====================================
// // ROOT
// // =====================================

// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "PhonePe Payment Gateway Backend Running",
//   });
// });

// // =====================================
// // PAYMENT ROUTES
// // =====================================

// app.use("/api/v1/payment", paymentRoutes);

// app.use("/api/v2/abha", abhaRoutes);

// module.exports = app;


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

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

// 1. Enable CORS for all incoming requests
app.use(cors(corsOptions));

// 2. Explicitly handle Preflight OPTIONS for all routes
app.options("*", cors(corsOptions));

// 3. Manual Fallback Header Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

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
// PAYMENT & ABHA ROUTES
// =====================================

app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v2/abha", abhaRoutes);

module.exports = app;