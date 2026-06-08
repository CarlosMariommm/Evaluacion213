import mongoose from 'mongoose';

const phoneEmergencyContactSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    nameEmergencyContact: { type: String, required: true }
}, { _id: false });

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthDate: { type: Date, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    bloodType: { type: String, required: true },
    phoneEmergencyContacts: [phoneEmergencyContactSchema],
    profilePhoto: { type: String },
    isVerified: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    timeOut: { type: Date },
    verificationCode: { type: String },
    passwordResetCode: { type: String },
    passwordResetExpires: { type: Date }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.model('Patient', patientSchema);
