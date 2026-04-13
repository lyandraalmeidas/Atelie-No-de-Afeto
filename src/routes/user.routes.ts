import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdmin } from '../middlewares/role.middleware';
import { parsePagination } from '../middlewares/pagination.middleware';

const router = Router();
const userController = new UserController();

router.use(authenticate);

// listagem geral, só admin
router.get('/', authorizeAdmin, parsePagination, userController.findAll);

// edição no proprio perfil, qualquer um logado
router.get('/:id', userController.findById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;