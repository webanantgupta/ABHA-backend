const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/phonepeRoutes");
const abhaRoutes = require("./routes/abha.route")
    

const app =
    express();


app.use(
  cors({
    origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
})
);


app.use(
    express.json()
);


// =====================================
// ROOT
// =====================================

app.get( "/",(req, res) => {
    res.json({success: true,message:"PhonePe Payment Gateway Backend Running"});
    }
);


// =====================================
// PAYMENT ROUTES
// =====================================

app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v2/abha", abhaRoutes);

module.exports =
    app;