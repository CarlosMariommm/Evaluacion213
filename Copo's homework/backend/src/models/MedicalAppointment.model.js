import mongoose from 'mongoose';

const medicalAppointmentSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalSpecialty', required: true },
    appointmentDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'], default: 'Pendiente' },
    observations: { type: String }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.model('MedicalAppointment', medicalAppointmentSchema);
