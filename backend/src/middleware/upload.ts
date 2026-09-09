import multer from "multer";
import { env } from "../config/env";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /pdf|text|msword|officedocument|plain/.test(file.mimetype) ||
      /\.(pdf|txt|doc|docx)$/i.test(file.originalname);

    if (ok) {
      cb(null, true);
      return;
    }

    cb(new Error("Unsupported document type"));
  },
});
