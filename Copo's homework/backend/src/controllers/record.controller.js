import ClinicalRecord from '../models/ClinicalRecord.model.js';

const recordController = {};

recordController.create = async (req, res) => {
    try {
        //#1- Creo un nuevo expediente clínico
        const newRecord = new ClinicalRecord(req.body);
        await newRecord.save();
        
        //#2- Respondo
        return res.json({ message: "Action done", data: newRecord });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

recordController.getAll = async (req, res) => {
    try {
        //#1- Busco todos los expedientes poblando la información del paciente
        const records = await ClinicalRecord.find()
            .populate('patient_id', 'name lastName email');
        
        //#2- Respondo
        return res.json({ message: "Action done", data: records });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

recordController.getById = async (req, res) => {
    try {
        //#1- Busco el expediente por ID
        const record = await ClinicalRecord.findById(req.params.id)
            .populate('patient_id', 'name lastName email');
        if (!record) return res.status(404).json({ message: "Action failed", error: "Expediente no encontrado" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: record });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

recordController.update = async (req, res) => {
    try {
        //#1- Actualizo el expediente clínico
        const updatedRecord = await ClinicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRecord) return res.status(404).json({ message: "Action failed", error: "Expediente no encontrado" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: updatedRecord });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

recordController.delete = async (req, res) => {
    try {
        //#1- Elimino el expediente
        const deletedRecord = await ClinicalRecord.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: "Action failed", error: "Expediente no encontrado" });
        
        //#2- Respondo
        return res.json({ message: "Action done" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

export default recordController;
