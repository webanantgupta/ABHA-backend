const appointmentModel = require("../models/appointmentModel");

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const result = await appointmentModel.getAllAppointments();

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      result,
    });
  } catch (error) {
    console.log("Get all appointments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await appointmentModel.getAppointmentById(id);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment fetched successfully",
      result,
    });
  } catch (error) {
    console.log("Get appointment by id error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
    });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const result = await appointmentModel.createAppointment(req.body);

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      result,
    });
  } catch (error) {
    console.log("Create appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await appointmentModel.updateAppointment(
      id,
      req.body
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      result,
    });
  } catch (error) {
    console.log("Update appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await appointmentModel.deleteAppointment(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      result,
    });
  } catch (error) {
    console.log("Delete appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};