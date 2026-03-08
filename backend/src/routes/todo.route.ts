import { Router } from 'express';
import { getAll, create, update, remove } from '@/controllers/todo.controller';
import { authenticateToken } from '@/middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
