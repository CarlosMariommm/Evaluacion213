import mongoose from 'mongoose';

const medicalSpecialtySchema = new mongoose.Schema({
    specialtyName: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.model('MedicalSpecialty', medicalSpecialtySchema);
