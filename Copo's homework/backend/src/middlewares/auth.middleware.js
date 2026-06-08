import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Action failed", error: "Acceso denegado. No se encontró el token de autenticación." });
        }

        const decoded = jwt.verify(token, process.env.JWT_secret_key);

        req.user = decoded;

        next();
    } catch (error) {
        console.log("error" + error);
        return res.status(401).json({ message: "Action failed", error: "Token inválido o expirado." });
    }
};

export default authMiddleware;
