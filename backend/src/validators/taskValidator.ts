import { body } from 'express-validator';

// Validation rules for task creation (title and dueDate are required)
export const createTaskValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('status')
        .optional()
        .isIn(['To Do', 'In Progress', 'Done'])
        .withMessage('Status must be: To Do, In Progress, or Done'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Priority must be: Low, Medium, or High'),

    body('dueDate')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            if (!value) return true;
            const inputDateStr = value.split('T')[0];
            const todayDateStr = new Date().toISOString().split('T')[0];
            if (inputDateStr < todayDateStr) {
                throw new Error('Due date cannot be in the past');
            }
            return true;
        }),
];

// Validation rules for task update (all fields optional if omitted, but validated if provided)
export const updateTaskValidation = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('status')
        .optional()
        .isIn(['To Do', 'In Progress', 'Done'])
        .withMessage('Status must be: To Do, In Progress, or Done'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Priority must be: Low, Medium, or High'),

    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
];