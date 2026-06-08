import multer from 'multer';

//#1- Configuro multer para usar memoria, ya que subiremos directamente a Cloudinary mediante streams
const storage = multer.memoryStorage();

//#2- Filtro para aceptar solo archivos de imagen
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('No es un archivo de imagen válido'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite máximo de 5MB por imagen
    }
});

export default upload;
