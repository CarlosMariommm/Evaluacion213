import MedicalSpecialty from '../models/MedicalSpecialty.model.js';

const specialtyController = {};

specialtyController.create = async (req, res) => {
    try {
        const newSpecialty = new MedicalSpecialty(req.body);
        await newSpecialty.save();
        
        return res.json({ message: "Action done", data: newSpecialty });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.getAll = async (req, res) => {
    try {
        const specialties = await MedicalSpecialty.find();
        
        return res.json({ message: "Action done", data: specialties });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.getById = async (req, res) => {
    try {
        const specialty = await MedicalSpecialty.findById(req.params.id);
        if (!specialty) return res.status(404).json({ message: "Action failed", error: "Especialidad no encontrada" });
        
        return res.json({ message: "Action done", data: specialty });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.update = async (req, res) => {
    try {
        const updatedSpecialty = await MedicalSpecialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSpecialty) return res.status(404).json({ message: "Action failed", error: "Especialidad no encontrada" });
        
        return res.json({ message: "Action done", data: updatedSpecialty });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.delete = async (req, res) => {
    try {
        const deletedSpecialty = await MedicalSpecialty.findByIdAndDelete(req.params.id);
        if (!deletedSpecialty) return res.status(404).json({ message: "Action failed", error: "Especialidad no encontrada" });
        
        return res.json({ message: "Action done" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

export default specialtyController;
