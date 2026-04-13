import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdmin } from '../middlewares/role.middleware';
import { parsePagination } from '../middlewares/pagination.middleware';

const router = Router();
const productController = new ProductController();

// leitura pública 
router.get('/', parsePagination, productController.findAll);
router.get('/:id', productController.findById);

// edição, só admin
router.post('/', authenticate, authorizeAdmin, productController.create);
router.put('/:id', authenticate, authorizeAdmin, productController.update);
router.delete('/:id', authenticate, authorizeAdmin, productController.delete);

export default router;