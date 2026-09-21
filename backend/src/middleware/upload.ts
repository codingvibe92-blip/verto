import multer from 'multer';
import { ApiError } from '../utils/errors';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isCsv = /\.csv$/i.test(file.originalname) || file.mimetype === 'text/csv' || file.mimetype.includes('csv');
    if (!isCsv) {
      cb(ApiError.badRequest('Only CSV files are allowed'));
      return;
    }
    cb(null, true);
  },
});