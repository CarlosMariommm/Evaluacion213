import Patient from '../models/Patient.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { uploadImage, deleteImage } from '../utils/cloudinary.util.js';
import { sendEmail } from '../utils/mailer.util.js';

const patientController = {};

patientController.register = async (req, res) => {
    try {
        //#1- Extraigo los datos del cuerpo de la petición
        const { name, lastName, email, password, birthDate, phone, address, bloodType, phoneEmergencyContacts } = req.body;
        
        //#2- Verifico si el paciente ya existe por correo
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({ message: "Action failed", error: "El correo ya está registrado" });
        }

        //#3- Hasheo la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //#4- Manejo la subida de la foto de perfil si existe
        let profilePhotoUrl = "";
        if (req.file) {
            profilePhotoUrl = await uploadImage(req.file.buffer, "patients_profiles");
        }

        //#5- Genero un código de verificación de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        //#6- Creo el nuevo paciente en la base de datos
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

        //#7- Envío el correo de verificación
        await sendEmail(
            email,
            "Verifica tu correo electrónico - Hospital Rosales",
            `Tu código de verificación es: ${verificationCode}`,
            `<p>Tu código de verificación es: <b>${verificationCode}</b></p>`
        );

        //#8- Respondo al cliente con éxito
        return res.json({ message: "Action done", data: "Paciente registrado. Por favor verifica tu correo electrónico." });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.verifyEmail = async (req, res) => {
    try {
        //#1- Obtengo el email y el código del cuerpo
        const { email, code } = req.body;

        //#2- Busco al paciente por correo
        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });

        //#3- Verifico que el código coincida
        if (patient.verificationCode !== code) {
            return res.status(400).json({ message: "Action failed", error: "Código incorrecto" });
        }

        //#4- Actualizo el estado del paciente a verificado y elimino el código
        patient.isVerified = true;
        patient.verificationCode = undefined;
        await patient.save();

        //#5- Respondo al cliente
        return res.json({ message: "Action done", data: "Correo verificado exitosamente." });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.login = async (req, res) => {
    try {
        //#1- Obtengo las credenciales
        const { email, password } = req.body;

        //#2- Busco al paciente y verifico que exista y esté verificado
        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Usuario no encontrado" });
        if (!patient.isVerified) return res.status(403).json({ message: "Action failed", error: "Por favor verifica tu correo primero" });

        //#3- Comparo las contraseñas
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) return res.status(400).json({ message: "Action failed", error: "Contraseña incorrecta" });

        //#4- Genero el JWT
        const token = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_secret_key, { expiresIn: '1d' });

        //#5- Guardo el token en una cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        //#6- Respondo al cliente
        return res.json({ message: "Action done", data: { patient: { id: patient._id, name: patient.name, email: patient.email } } });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.logout = async (req, res) => {
    try {
        //#1- Elimino la cookie
        res.clearCookie('token');
        
        //#2- Respondo al cliente
        return res.json({ message: "Action done", data: "Sesión cerrada correctamente" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.forgotPassword = async (req, res) => {
    try {
        //#1- Obtengo el email
        const { email } = req.body;

        //#2- Busco al paciente
        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Usuario no encontrado" });

        //#3- Genero el código de recuperación
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        patient.passwordResetCode = resetCode;
        patient.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutos
        await patient.save();

        //#4- Envío el correo
        await sendEmail(
            email,
            "Recuperación de contraseña - Hospital Rosales",
            `Tu código para recuperar la contraseña es: ${resetCode}`,
            `<p>Tu código para recuperar la contraseña es: <b>${resetCode}</b>. Expirará en 15 minutos.</p>`
        );

        //#5- Respondo
        return res.json({ message: "Action done", data: "Código de recuperación enviado al correo" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.resetPassword = async (req, res) => {
    try {
        //#1- Obtengo email, código y nueva contraseña
        const { email, code, newPassword } = req.body;

        //#2- Busco al paciente con código válido
        const patient = await Patient.findOne({ 
            email, 
            passwordResetCode: code,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!patient) return res.status(400).json({ message: "Action failed", error: "Código inválido o expirado" });

        //#3- Hasheo la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        patient.password = await bcrypt.hash(newPassword, salt);
        
        //#4- Limpio el código
        patient.passwordResetCode = undefined;
        patient.passwordResetExpires = undefined;
        await patient.save();

        //#5- Respondo
        return res.json({ message: "Action done", data: "Contraseña actualizada exitosamente" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.getAll = async (req, res) => {
    try {
        //#1- Busco todos los pacientes
        const patients = await Patient.find().select('-password -verificationCode -passwordResetCode');
        
        //#2- Respondo
        return res.json({ message: "Action done", data: patients });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.getById = async (req, res) => {
    try {
        //#1- Busco paciente por id
        const patient = await Patient.findById(req.params.id).select('-password');
        if (!patient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: patient });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.update = async (req, res) => {
    try {
        //#1- Actualizo el paciente
        const updateData = { ...req.body };
        if (updateData.password) delete updateData.password;

        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        if (!updatedPatient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });
        
        //#2- Respondo
        return res.json({ message: "Action done", data: updatedPatient });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

patientController.delete = async (req, res) => {
    try {
        //#1- Busco y elimino el paciente
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (!deletedPatient) return res.status(404).json({ message: "Action failed", error: "Paciente no encontrado" });
        
        //#2- Respondo
        return res.json({ message: "Action done" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Action failed", error: "Error interno del servidor" });
    }
};

export default patientController;
