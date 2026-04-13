import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { uploadImage } from "../middlewares/upload.middleware";
import { AppError } from "../utils/AppError";

const UPLOAD_DIR = path.resolve("uploads");

// confirma a existencia da pasta antes de iniciar
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export class UploadController {
  // caminho POST /api/upload/imagem — recebe multipart/form-data(forma de dado) com campo "image"
  upload(req: Request, res: Response, next: NextFunction): void {
    uploadImage(req, res, (err) => {
      if (err) {
        next(new AppError(err.message, 400));
        return;
      }
      if (!req.file) {
        next(new AppError("Nenhuma imagem enviada.", 400));
        return;
      }

      const imageUrl = `${process.env.BASE_URL || "http://localhost:3333"}/uploads/${req.file.filename}`;
      res.status(201).json({ imageUrl });
    });
  }

  // caminho DELETE /api/upload/imagem - para deletar a imagem
  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      const { filename } = req.params;
      // destroi os dados ao deletar, para que não aja risco de vazamento
      const safe = path.basename(filename);
      const filePath = path.join(UPLOAD_DIR, safe);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
