const express = require("express");
const {  getAllAppointments,
getAppointmentById,createAppointment, updateAppointment,deleteAppointment,} = require("../controllers/appointment.controller");



const router = express.Router();

// Get all appointments
router.get("/getall", getAllAppointments);

// Get appointment by ID
router.get("/getbyid/:id", getAppointmentById);

// Create appointment
router.post("/create", createAppointment);

// Update appointment
router.patch("/update/:id", updateAppointment);

// Delete appointment
router.delete("/deletebyid/:id", deleteAppointment);

module.exports = router;