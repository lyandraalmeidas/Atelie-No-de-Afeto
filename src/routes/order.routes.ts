import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeAdmin } from '../middlewares/role.middleware';
import { parsePagination } from '../middlewares/pagination.middleware';

const router = Router();
const orderController = new OrderController();

router.use(authenticate);

//listagem geral e edição, só admin
router.get('/', authorizeAdmin, parsePagination, orderController.findAll);
router.patch('/:id/status', authorizeAdmin, orderController.updateStatus);
router.delete('/:id', authorizeAdmin, orderController.delete);

// pedidos do proprio usuario, só estar logado
router.get('/my-orders', parsePagination, orderController.findByUser);
router.get('/:id', orderController.findById);
router.post('/', orderController.create);

export default router;