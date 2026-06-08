import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        //#1- Obtengo el token de las cookies que envía el cliente (credentials: true)
        const token = req.cookies.token;

        //#2- Si no hay token, deniego el acceso inmediatamente
        if (!token) {
            return res.status(401).json({ message: "Action failed", error: "Acceso denegado. No se encontró el token de autenticación." });
        }

        //#3- Verifico el token utilizando la clave secreta configurada en .env
        const decoded = jwt.verify(token, process.env.JWT_secret_key);

        //#4- Guardo la información descifrada del usuario en el objeto request (req.user)
        req.user = decoded;

        //#5- Continúo con el flujo llamando a next()
        next();
    } catch (error) {
        console.log("error" + error);
        return res.status(401).json({ message: "Action failed", error: "Token inválido o expirado." });
    }
};

export default authMiddleware;
