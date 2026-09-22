const db = require("../config/db");

const appointmentModel = {

  // Get all appointments
  getAllAppointments: async () => {
    const result = await db.query(`
      SELECT * 
      FROM appointments
      ORDER BY appointment_id DESC
    `);

    return result.rows;
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const result = await db.query(
      `
      SELECT * 
      FROM appointments
      WHERE appointment_id = $1
      `,
      [id]
    );

    return result.rows;
  },

  // Create appointment
  createAppointment: async (data) => {
    const {
      patient_name,
      mrn,
      age,
      gender,
      phone,
      doctor_name,
      authorized_by,
      appointment_date,
      time_slot,
      priority,
      discount,
    } = data;

    const result = await db.query(
      `
      INSERT INTO appointments (
        patient_name,
        mrn,
        age,
        gender,
        phone,
        doctor_name,
        authorized_by,
        appointment_date,
        time_slot,
        priority,
        discount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        patient_name,
        mrn,
        age,
        gender,
        phone,
        doctor_name,
        authorized_by,
        appointment_date,
        time_slot,
        priority,
        discount,
      ]
    );

    return result.rows[0];
  },

  // Update appointment
//   updateAppointment: async (id, data) => {
//     const {
//       patient_name,
//       mrn,
//       age,
//       gender,
//       phone,
//       doctor_name,
//       authorized_by,
//       appointment_date,
//       time_slot,
//       priority,
//       discount,
//     } = data;

//     const result = await db.query(
//       `
//       UPDATE appointments
//       SET
//         patient_name = $1,
//         mrn = $2,
//         age = $3,
//         gender = $4,
//         phone = $5,
//         doctor_name = $6,
//         authorized_by = $7,
//         appointment_date = $8,
//         time_slot = $9,
//         priority = $10,
//         discount = $11,
//         updated_at = CURRENT_TIMESTAMP
//       WHERE appointment_id = $12
//       RETURNING *
//       `,
//       [
//         patient_name,
//         mrn,
//         age,
//         gender,
//         phone,
//         doctor_name,
//         authorized_by,
//         appointment_date,
//         time_slot,
//         priority,
//         discount,
//         id,
//       ]
//     );

//     return result.rows[0];
//   },

 updateAppointment: async (id, data) => {

    const allowedFields = [
      "patient_name",
      "mrn",
      "age",
      "gender",
      "phone",
      "doctor_name",
      "authorized_by",
      "appointment_date",
      "time_slot",
      "priority",
      "discount",
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${values.length + 1}`);
        values.push(data[field]);
      }
    }

    // No field was provided
    if (fields.length === 0) {
      return null;
    }

    // updated_at
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add appointment ID
    values.push(id);

    const query = `
      UPDATE appointments
      SET ${fields.join(", ")}
      WHERE appointment_id = $${values.length}
      RETURNING *
    `;

    const result = await db.query(query, values);

    return result.rows[0];
  },

  // Delete appointment
  deleteAppointment: async (id) => {
    const result = await db.query(
      `
      DELETE FROM appointments
      WHERE appointment_id = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  },

};

module.exports = appointmentModel;