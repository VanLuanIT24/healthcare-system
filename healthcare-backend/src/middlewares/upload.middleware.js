const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

function createStorage(subfolder) {
  const destination = ensureDirectory(path.join(process.cwd(), 'uploads', subfolder));
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const safeName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, safeName);
    }
  });
}

const uploadMiddleware = multer({ storage: createStorage('profiles') });
const patientDocumentUpload = multer({ storage: createStorage('patient-documents') });

module.exports = {
  uploadMiddleware,
  patientDocumentUpload
};
