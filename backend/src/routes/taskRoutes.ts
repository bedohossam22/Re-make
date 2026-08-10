import express from 'express';
import {
    deleteTask,
    getTasks,
    createTask,
    getTaskById,
    updateTask,
} from '../controllers/taskController';
import { updateTaskValidation, createTaskValidation } from '../validators/taskValidator';
import { auth } from '../middleware/auth';

const router = express.Router();

// All task routes require authentication
router.use(auth);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTaskValidation, createTask);
router.put('/:id', updateTaskValidation, updateTask);
router.delete('/:id', deleteTask);

export default router;