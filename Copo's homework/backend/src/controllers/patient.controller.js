import Patient from '../models/Patient.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { uploadImage, deleteImage } from '../utils/cloudinary.util.js';
import { sendEmail } from '../utils/mailer.util.js';

const patientController = {};

patientController.register = async (req, res) => {
    try {
        const { name, lastName, email, password, birthDate, phone, address, bloodType, phoneEmergencyContacts } = req.body;
        
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({ message: "Action failed", error: "El correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let profilePhotoUrl = "";
        if (req.file) {
            profilePhotoUrl = await uploadImage(req.file.buffer, "patients_profiles");
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        let parsedContacts = [];
        if (phoneEmergencyContacts) {
            parsedContacts = typeof phoneEmergencyContacts === 'string' ? JSON.parse(phoneEmergencyContacts) : phoneEmergencyContacts;
        }

        const newPatient = new Patient({
            name, lastName, email, password: hashedPassword, birthDate, phone, address, bloodType,
            phoneEmergencyContacts: parsedContacts,
            profilePhoto: profilePhotoUrl,
            verificationCode
        });
        await newPatient.save();

        await sendEmail(
            email,
            "Verifica tu correo electrónico - Hospital Rosales",
            `Tu código de verificación es: ${verificationCode}`,
            `<p>Tu código de verificación es: <b>${verificationCode}</b></p>`
        );

        return res.json({ message: "Action done", data: "Paciente registrado. Por favor verifica tu correo electrónico." });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });

        if (patient.verificationCode !== code) {
            return res.status(400).json({ message: "Action failed", error: "Código incorrecto" });
        }

        patient.isVerified = true;
        patient.verificationCode = undefined;
        await patient.save();

        return res.json({ message: "Action done", data: "Correo verificado exitosamente." });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Usuario no encontrado" });
        if (!patient.isVerified) return res.status(403).json({ message: "Action failed", error: "Por favor verifica tu correo primero" });

        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) return res.status(400).json({ message: "Action failed", error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_secret_key, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return res.json({ message: "Action done", data: { patient: { id: patient._id, name: patient.name, email: patient.email } } });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.logout = async (req, res) => {
    try {
        res.clearCookie('token');
        
        return res.json({ message: "Action done", data: "Sesión cerrada correctamente" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Usuario no encontrado" });

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        patient.passwordResetCode = resetCode;
        patient.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutos
        await patient.save();

        await sendEmail(
            email,
            "Recuperación de contraseña - Hospital Rosales",
            `Tu código para recuperar la contraseña es: ${resetCode}`,
            `<p>Tu código para recuperar la contraseña es: <b>${resetCode}</b>. Expirará en 15 minutos.</p>`
        );

        return res.json({ message: "Action done", data: "Código de recuperación enviado al correo" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const patient = await Patient.findOne({ 
            email, 
            passwordResetCode: code,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!patient) return res.status(400).json({ message: "Action failed", error: "Código inválido o expirado" });

        const salt = await bcrypt.genSalt(10);
        patient.password = await bcrypt.hash(newPassword, salt);
        
        patient.passwordResetCode = undefined;
        patient.passwordResetExpires = undefined;
        await patient.save();

        return res.json({ message: "Action done", data: "Contraseña actualizada exitosamente" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.getAll = async (req, res) => {
    try {
        const patients = await Patient.find().select('-password -verificationCode -passwordResetCode');
        
        return res.json({ message: "Action done", data: patients });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.getById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).select('-password');
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });
        
        return res.json({ message: "Action done", data: patient });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.update = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.password) delete updateData.password;

        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        if (!updatedPatient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });
        
        return res.json({ message: "Action done", data: updatedPatient });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.delete = async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (!deletedPatient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });
        
        return res.json({ message: "Action done" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

export default patientController;
