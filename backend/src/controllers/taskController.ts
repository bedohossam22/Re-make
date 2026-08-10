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
        const { status, priority, search } = req.query;
        const query: any = { user: req.user._id };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) query.title = { $regex: search, $options: 'i' };

        const tasks = await Task.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
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

        const task = await Task.findOne({
            _id: taskId,
            user: req.user._id,
        });

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

        // - Destructure title, description, status, priority, dueDate from req.body
        const { title, description, status, priority, dueDate } = req.body;

        // - Create task with user: req.user._id
        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            user: req.user._id,
        });

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

        // - Find task by _id AND user: req.user._id
        let task = await Task.findOne({
            _id: taskId,
            user: req.user._id,
        });

        // - If not found -> 404
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        // - Destructure fields from req.body
        const { title, description, status, priority, dueDate } = req.body;

        // - Update only fields that are provided
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (dueDate) task.dueDate = dueDate;

        // - Save task
        await task.save();

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
    // 5. DELETE TASK
    //    - Get task id from req.params
    //    - Find and delete task by _id AND user: req.user._id
    //    - If not found -> 404
    //    - Return success message
    const taskId = req.params.id

    const task = await Task.findOneAndDelete({
        _id: taskId,
        user: req.user._id,
    })
    res.json({
        success: true,
        message: 'Task Deleted successfully'
    });
}

