import mongoose from 'mongoose';

const medicalEquipmentSchema = new mongoose.Schema({
    equipmentName: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    maintenanceDate: { type: Date },
    location: { type: String, required: true },
    image: { type: String }, // URL from Cloudinary
    status: { type: String, enum: ['Operativo', 'En Mantenimiento', 'Fuera de Servicio'], default: 'Operativo' },
    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.model('MedicalEquipment', medicalEquipmentSchema);
