import MedicalAppointment from '../models/MedicalAppointment.model.js';

const appointmentController = {};

appointmentController.create = async (req, res) => {
    try {
        //#1- Creo una nueva cita
        const newAppointment = new MedicalAppointment(req.body);
        await newAppointment.save();
        
        //#2- Respondo
        return res.json({ message: "Action done", data: newAppointment });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

appointmentController.getAll = async (req, res) => {
    try {
        //#1- Busco todas las citas poblando paciente y especialidad
        const appointments = await MedicalAppointment.find()
            .populate('patient_id', 'name lastName email')
            .populate('specialty_id', 'specialtyName');
        
        //#2- Respondo
        return res.json({ message: "Action done", data: appointments });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

appointmentController.getById = async (req, res) => {
    try {
        //#1- Busco cita por ID
        const appointment = await MedicalAppointment.findById(req.params.id)
            .populate('patient_id', 'name lastName email')
            .populate('specialty_id', 'specialtyName');
        if (!appointment) return res.status(404).json({ message: "Action failed", error: "Cita no encontrada" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: appointment });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

appointmentController.update = async (req, res) => {
    try {
        //#1- Actualizo la cita
        const updatedAppointment = await MedicalAppointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAppointment) return res.status(404).json({ message: "Action failed", error: "Cita no encontrada" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: updatedAppointment });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

appointmentController.delete = async (req, res) => {
    try {
        //#1- Elimino la cita
        const deletedAppointment = await MedicalAppointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) return res.status(404).json({ message: "Action failed", error: "Cita no encontrada" });
        
        //#2- Respondo
        return res.json({ message: "Action done" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

export default appointmentController;
