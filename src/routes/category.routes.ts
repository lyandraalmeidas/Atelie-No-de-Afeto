import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdmin } from '../middlewares/role.middleware';
import { parsePagination } from '../middlewares/pagination.middleware';

const router = Router();
const categoryController = new CategoryController();

router.use(authenticate);

// visualização, qualquer um logado
router.get('/', parsePagination, categoryController.findAll);
router.get('/:id', categoryController.findById);

// edição, somente ADMIN
router.post('/', authorizeAdmin, categoryController.create);
router.put('/:id', authorizeAdmin, categoryController.update);
router.delete('/:id', authorizeAdmin, categoryController.delete);

export default router;