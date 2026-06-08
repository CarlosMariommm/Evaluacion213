import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    medicineName: { type: String, required: true }
}, { _id: false });

const clinicalRecordSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    diagnosis: { type: String, required: true },
    medications: [medicationSchema],
    medicalNotes: { type: String }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.model('ClinicalRecord', clinicalRecordSchema);
