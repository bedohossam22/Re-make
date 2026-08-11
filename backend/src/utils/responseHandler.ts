import { Response } from 'express';

/**
 * Success response handler
 */
export const successResponse = (
    res: Response,
    data: any,
    message: string = 'Success',
    statusCode: number = 200
) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Error response handler
 */
export const errorResponse = (
    res: Response,
    message: string = 'Something went wrong',
    statusCode: number = 500,
    errors: any = null
) => {
    const response: any = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    res.status(statusCode).json(response);
};

/**
 * Paginated response handler
 */
export const paginatedResponse = (
    res: Response,
    data: any[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success'
) => {
    res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
};