import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User';

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
    });
};

// 2. REGISTER controller
//    - Check validation errors
//    - Destructure name, email, password from req.body
//    - Check if user already exists (find by email)
//    - If exists -> return 400 error
//    - Create new user with User.create()
//    - Generate token
//    - Return 201 with user data + token

// 3. LOGIN controller
//    - Check validation errors
//    - Destructure email, password from req.body
//    - Find user by email
//    - If no user -> return 401 "Invalid credentials"
//    - Compare password using user.comparePassword()
//    - If wrong password -> return 401 "Invalid credentials"
//    - Generate token
//    - Return 200 with user data + token

export const register = async (req: Request, res: Response) => {
    try {
        // 1. Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        // 2. Destructure body
        const { name, email, password } = req.body;

        // 3. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // 4. Create user
        const user = await User.create({ name, email, password });

        // 5. Generate token
        const token = generateToken(user._id.toString());

        // 6. Return response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                token,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        // 1. Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // 3. Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // 4. Generate token
        const token = generateToken(user._id.toString());

        // 5. Return response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
};