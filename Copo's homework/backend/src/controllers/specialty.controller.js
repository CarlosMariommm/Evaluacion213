import MedicalSpecialty from '../models/MedicalSpecialty.model.js';

const specialtyController = {};

specialtyController.create = async (req, res) => {
    try {
        //#1- Creo una nueva especialidad con los datos del body
        const newSpecialty = new MedicalSpecialty(req.body);
        await newSpecialty.save();
        
        //#2- Respondo al cliente
        return res.json({ message: "Action done", data: newSpecialty });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.getAll = async (req, res) => {
    try {
        //#1- Busco todas las especialidades
        const specialties = await MedicalSpecialty.find();
        
        //#2- Respondo
        return res.json({ message: "Action done", data: specialties });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.getById = async (req, res) => {
    try {
        //#1- Busco especialidad por ID
        const specialty = await MedicalSpecialty.findById(req.params.id);
        if (!specialty) return res.status(404).json({ message: "Action failed", error: "Especialidad no encontrada" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: specialty });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.update = async (req, res) => {
    try {
        //#1- Actualizo la especialidad
        const updatedSpecialty = await MedicalSpecialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSpecialty) return res.status(404).json({ message: "Action failed", error: "Especialidad no encontrada" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: updatedSpecialty });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

specialtyController.delete = async (req, res) => {
    try {
        //#1- Elimino la especialidad
        const deletedSpecialty = await MedicalSpecialty.findByIdAndDelete(req.params.id);
        if (!deletedSpecialty) return res.status(404).json({ message: "Action failed", error: "Especialidad no encontrada" });
        
        //#2- Respondo
        return res.json({ message: "Action done" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

export default specialtyController;
