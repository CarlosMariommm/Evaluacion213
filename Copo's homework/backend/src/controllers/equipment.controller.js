import MedicalEquipment from '../models/MedicalEquipment.model.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.util.js';

const equipmentController = {};

equipmentController.create = async (req, res) => {
    try {
        const data = { ...req.body };
        
        if (req.file) {
            const imageUrl = await uploadImage(req.file.buffer, "medical_equipment");
            data.image = imageUrl;
        }

        const newEquipment = new MedicalEquipment(data);
        await newEquipment.save();
        
        return res.json({ message: "Action done", data: newEquipment });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

equipmentController.getAll = async (req, res) => {
    try {
        const equipments = await MedicalEquipment.find();
        
        return res.json({ message: "Action done", data: equipments });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

equipmentController.getById = async (req, res) => {
    try {
        const equipment = await MedicalEquipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: "Action failed", error: "Equipo médico no encontrado" });
        
        return res.json({ message: "Action done", data: equipment });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

equipmentController.update = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.file) {
            const imageUrl = await uploadImage(req.file.buffer, "medical_equipment");
            data.image = imageUrl;
        }

        const updatedEquipment = await MedicalEquipment.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!updatedEquipment) return res.status(404).json({ message: "Action failed", error: "Equipo médico no encontrado" });
        
        return res.json({ message: "Action done", data: updatedEquipment });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

equipmentController.delete = async (req, res) => {
    try {
        const deletedEquipment = await MedicalEquipment.findByIdAndDelete(req.params.id);
        if (!deletedEquipment) return res.status(404).json({ message: "Action failed", error: "Equipo médico no encontrado" });
        
        return res.json({ message: "Action done" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

export default equipmentController;
