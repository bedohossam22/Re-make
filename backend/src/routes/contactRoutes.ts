import { Router } from 'express';
import { submitContact, getTicketStatus } from '../controllers/contactController';
import { contactSubmissionValidation } from '../validators/contactValidator';

const router = Router();

// @route   POST /api/contact
// @desc    Submit an inquiry to MOIC
// @access  Public
router.post('/', contactSubmissionValidation, submitContact);

// @route   GET /api/contact/ticket/:ticketId
// @desc    Check ticket status by ID
// @access  Public
router.get('/ticket/:ticketId', getTicketStatus);

export default router;
