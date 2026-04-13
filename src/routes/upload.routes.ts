import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdmin } from '../middlewares/role.middleware';

const router = Router();
const upload = new UploadController();

router.use(authenticate, authorizeAdmin);

router.post('/imagem', upload.upload);
router.delete('/imagem/:filename', upload.delete);

export default router;