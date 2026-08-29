import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Task } from '../models/Task';

// 1. GET ALL TASKS
//    - Extract status, priority, search from req.query
//    - Build query object with user: req.user._id
//    - If status provided -> add to query
//    - If priority provided -> add to query
//    - If search provided -> add title regex to query
//    - Find tasks with query
//    - Sort by createdAt: -1 (newest first)
//    - Return tasks with count

// 2. GET SINGLE TASK
//    - Get task id from req.params
//    - Find task by _id AND user: req.user._id
//    - If not found -> 404
//    - Return task

// 3. CREATE TASK
//    - Check validation errors
//    - Destructure title, description, status, priority, dueDate from req.body
//    - Create task with user: req.user._id
//    - Return 201 with created task

// 4. UPDATE TASK
//    - Check validation errors
//    - Get task id from req.params
//    - Find task by _id AND user: req.user._id
//    - If not found -> 404
//    - Destructure fields from req.body
//    - Update only fields that are provided
//    - Save task
//    - Return updated task

// 5. DELETE TASK
//    - Get task id from req.params
//    - Find and delete task by _id AND user: req.user._id
//    - If not found -> 404
//    - Return success message

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { status, priority, search, page, limit, sortBy, sortOrder } = req.query;
        const userId = req.user._id;

        const query: any = {
            $or: [
                { createdBy: userId },
                { assignees: userId },
                { user: userId },
            ],
        };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            const escapedSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.title = { $regex: escapedSearch, $options: 'i' };
        }

        // Sorting configuration
        const validSortFields: Record<string, string> = {
            createdAt: 'createdAt',
            dueDate: 'dueDate',
            priority: 'priority',
            title: 'title',
        };

        const sortField = validSortFields[String(sortBy)] || 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortOptions: any = { [sortField]: sortDirection };

        // Count total matching documents
        const total = await Task.countDocuments(query);

        // Pagination calculations
        const isPaginated = page !== undefined || limit !== undefined;
        const pageNum = Math.max(1, parseInt(String(page || '1'), 10) || 1);
        const limitNum = Math.max(1, parseInt(String(limit || '10'), 10) || 10);
        const skip = (pageNum - 1) * limitNum;

        let taskQuery = Task.find(query)
            .populate('createdBy', 'name email')
            .populate('assignees', 'name email')
            .sort(sortOptions);

        if (isPaginated) {
            taskQuery = taskQuery.skip(skip).limit(limitNum);
        }

        const tasks = await taskQuery;

        const totalPages = isPaginated ? Math.ceil(total / limitNum) || 1 : 1;

        res.json({
            success: true,
            count: tasks.length,
            total,
            page: isPaginated ? pageNum : 1,
            totalPages,
            hasPrevPage: isPaginated ? pageNum > 1 : false,
            hasNextPage: isPaginated ? pageNum < totalPages : false,
            data: tasks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
        });
    }
};

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;
        const userId = req.user._id;

        const task = await Task.findOne({
            _id: taskId,
            $or: [
                { createdBy: userId },
                { assignees: userId },
                { user: userId },
            ],
        })
            .populate('createdBy', 'name email')
            .populate('assignees', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.json({
            success: true,
            data: task,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching task',
        });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        // - Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        // - Destructure title, description, status, priority, dueDate, assignees from req.body
        const { title, description, status, priority, dueDate, assignees } = req.body;

        // - Create task with user, createdBy, and assignees
        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            user: req.user._id,
            createdBy: req.user._id,
            assignees: Array.isArray(assignees) ? assignees : [],
        });

        await task.populate('createdBy', 'name email');
        await task.populate('assignees', 'name email');

        // - Return 201 with created task
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating task',
        });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        // - Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        // - Get task id from req.params
        const taskId = req.params.id;
        const userId = req.user._id;

        // - Find task by _id AND authorized visibility (createdBy OR assignees OR user)
        let task = await Task.findOne({
            _id: taskId,
            $or: [
                { createdBy: userId },
                { assignees: userId },
                { user: userId },
            ],
        });

        // - If not found -> 404
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        // - Destructure fields from req.body
        const { title, description, status, priority, dueDate, assignees } = req.body;

        // - Update only fields that are provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignees !== undefined && Array.isArray(assignees)) task.assignees = assignees;

        // - Save task
        await task.save();
        await task.populate('createdBy', 'name email');
        await task.populate('assignees', 'name email');

        // - Return updated task
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating task',
        });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const taskId = req.params.id;
        const userId = req.user._id;

        const task = await Task.findOneAndDelete({
            _id: taskId,
            $or: [
                { createdBy: userId },
                { assignees: userId },
                { user: userId },
            ],
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
        });
    }
};

