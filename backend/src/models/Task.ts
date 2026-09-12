import mongoose, { Document, Schema } from "mongoose";

export interface ISubtask {
    _id?: string;
    title: string;
    completed: boolean;
}

export interface ITask extends Document {
    title: string;
    description?: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate: Date;
    user: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    assignees?: mongoose.Types.ObjectId[];
    subtasks?: ISubtask[];
    createdAt: Date;
    updatedAt: Date;
}



// Task Schema 

const subtaskSchema = new Schema<ISubtask>(
    {
        title: {
            type: String,
            required: [true, 'Subtask title is required'],
            trim: true,
            maxlength: [200, 'Subtask title cannot exceed 200 characters'],
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'Done'],
            default: 'To Do',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        assignees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        subtasks: [subtaskSchema],
    },
    {
        timestamps: true,
    }
);


taskSchema.index({ title: 'text' });

export const Task = mongoose.model<ITask>('Task', taskSchema);