import { NextFunction, Request, Response } from 'express';
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError,
    InternalServerError,
    MissingBodyError,
} from '../errors/RequestErrorCollection';
import * as VisitorDAO from '../daos/visitorDAO';
import * as StaffDAO from '../daos/staffDAO';
import hidash from '../utils/hidash';
import { visitors as Visitor } from '@prisma/client';

export async function createVisitor(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const body = req.body;
        if (!body) {
            next(new MissingBodyError());
            return;
        }

        const isMissingProperty = hidash.checkPropertyV2(body, 'Visitor', VisitorDAO.getRequired());
        if (isMissingProperty.message) {
            next(isMissingProperty);
            return;
        }

        if (body.visitor_profile === 'Other' && !body.visitor_profile_other) {
            next(new BadRequestError('visitor_profile_other is required when profile is Other'));
            return;
        }

        if (body.visitor_profile !== 'Other' && body.visitor_profile_other) {
            next(new BadRequestError('visitor_profile_other should only be filled when profile is Other'));
            return;
        }

        const phoneRegex = /^[0-9+()-]+$/;
        if (!phoneRegex.test(body.phone_number)) {
            next(new BadRequestError('Invalid phone number format'));
            return;
        }

        // VALIDASI STAFF_ID ADA DAN ACTIVE
        const isValidStaff = await VisitorDAO.validateStaff(body.staff_id);
        if (!isValidStaff) {
            next(new BadRequestError(`Staff with ID ${body.staff_id} not found or inactive`));
            return;
        }

        const result = await VisitorDAO.create(VisitorDAO.formatCreate(body));
        res.send({
            http_code: 200,
            data: result,
            message: 'Visitor created successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function getVisitorById(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            next(new BadParamIdError());
            return;
        }

        const visitor = await VisitorDAO.getById(id);
        if (!visitor) {
            next(new EntityNotFoundError('Visitor', id));
            return;
        }

        res.send({
            http_code: 200,
            data: visitor,
            message: 'Visitor retrieved successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function getAllVisitors(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const {
            includeCheckedOut,
            dateFrom,
            dateTo,
            visitorProfile,
            search,
            timeRange,
            limit,      // Tambahan: jumlah item per halaman
            offset,     // Tambahan: skip berapa item
            exportAll   // New parameter for export
        } = req.query;

        const options: VisitorDAO.GetAllOptions = {};

        if (includeCheckedOut !== undefined) {
            options.includeCheckedOut = includeCheckedOut === 'true';
        }

        // Pagination params
        if (limit) {
            options.limit = parseInt(limit as string);
        }
        if (offset) {
            options.offset = parseInt(offset as string);
        }

        // Handle time range filter
        if (timeRange) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today

            switch (timeRange) {
                case 'today':
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    options.dateFrom = today;
                    options.dateTo = tomorrow;
                    break;
                    
                case 'last7days':
                    const last7Days = new Date(today);
                    last7Days.setDate(last7Days.getDate() - 7);
                    options.dateFrom = last7Days;
                    options.dateTo = new Date(); // Now
                    break;
                    
                case 'last30days':
                    const last30Days = new Date(today);
                    last30Days.setDate(last30Days.getDate() - 30);
                    options.dateFrom = last30Days;
                    options.dateTo = new Date(); // Now
                    break;
                    
                case 'custom':
                    // For custom range, use dateFrom and dateTo
                    if (dateFrom) {
                        options.dateFrom = new Date(dateFrom as string);
                    }
                    if (dateTo) {
                        options.dateTo = new Date(dateTo as string);
                    }
                    break;
                    
                default:
                    // No time range selected, get all data
                    break;
            }
        } else {
            // Handle old way for backward compatibility
            if (dateFrom) {
                options.dateFrom = new Date(dateFrom as string);
            }

            if (dateTo) {
                options.dateTo = new Date(dateTo as string);
            }
        }

        if (visitorProfile && ['Player', 'Visitor', 'Other'].includes(visitorProfile as string)) {
            options.visitorProfile = visitorProfile as Visitor['visitor_profile'];
        }

        if (search) {
            options.search = search as string;
        }

        // Jika exportAll = true, ambil semua tanpa pagination
        if (exportAll === 'true') {
            options.limit = undefined;
            options.offset = undefined;
        }

        const visitors = await VisitorDAO.getAll(options);
        
        res.send({
            http_code: 200,
            data: visitors,
            count: visitors.length,
            message: exportAll === 'true' ? 'All visitors data for export' : 'Visitors retrieved successfully'
        });
        
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function updateVisitor(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            next(new BadParamIdError());
            return;
        }

        const body = req.body;
        if (!body) {
            next(new MissingBodyError());
            return;
        }

        const visitor = await VisitorDAO.getById(id);
        if (!visitor) {
            next(new EntityNotFoundError('Visitor', id));
            return;
        }

        if (body.visitor_profile === 'Other' && !body.visitor_profile_other) {
            next(new BadRequestError('visitor_profile_other is required when profile is Other'));
            return;
        }

        if (body.visitor_profile !== 'Other' && body.visitor_profile_other) {
            body.visitor_profile_other = null;
        }

        if (body.phone_number) {
            const phoneRegex = /^[0-9+()-]+$/;
            if (!phoneRegex.test(body.phone_number)) {
                next(new BadRequestError('Invalid phone number format'));
                return;
            }
        }

        // VALIDASI STAFF_ID JIKA DIUPDATE
        if (body.staff_id) {
            const isValidStaff = await VisitorDAO.validateStaff(body.staff_id);
            if (!isValidStaff) {
                next(new BadRequestError(`Staff with ID ${body.staff_id} not found or inactive`));
                return;
            }
        }

        const result = await VisitorDAO.update(id, body);
        res.send({
            http_code: 200,
            data: result,
            message: 'Visitor updated successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function checkOutVisitor(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            next(new BadParamIdError());
            return;
        }

        const visitor = await VisitorDAO.getById(id);
        if (!visitor) {
            next(new EntityNotFoundError('Visitor', id));
            return;
        }

        if (visitor.checked_out_at) {
            next(new BadRequestError('Visitor already checked out'));
            return;
        }

        const result = await VisitorDAO.checkOut(id);
        res.send({ 
            http_code: 200,
            data: result,
            message: 'Visitor checked out successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function deleteVisitor(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            next(new BadParamIdError());
            return;
        }

        const visitor = await VisitorDAO.getById(id);
        if (!visitor) {
            next(new EntityNotFoundError('Visitor', id));
            return;
        }

        await VisitorDAO.deleteVisitor(id);
        res.send({ 
            http_code: 200,
            message: 'Visitor deleted successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function getVisitorStats(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const { dateFrom, dateTo, timeRange } = req.query;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        // Handle time range filter for stats
        if (timeRange) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today

            switch (timeRange) {
                case 'today':
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    startDate = today;
                    endDate = tomorrow;
                    break;
                    
                case 'last7days':
                    const last7Days = new Date(today);
                    last7Days.setDate(last7Days.getDate() - 7);
                    startDate = last7Days;
                    endDate = new Date(); // Now
                    break;
                    
                case 'last30days':
                    const last30Days = new Date(today);
                    last30Days.setDate(last30Days.getDate() - 30);
                    startDate = last30Days;
                    endDate = new Date(); // Now
                    break;
                    
                case 'custom':
                    // For custom range, use dateFrom and dateTo
                    if (dateFrom) {
                        startDate = new Date(dateFrom as string);
                    }
                    if (dateTo) {
                        endDate = new Date(dateTo as string);
                    }
                    break;
            }
        } else {
            // Fallback to old parameters
            if (dateFrom) {
                startDate = new Date(dateFrom as string);
            }
            if (dateTo) {
                endDate = new Date(dateTo as string);
            }
        }

        const stats = await VisitorDAO.getStats(startDate, endDate);
        res.send({
            http_code: 200,
            data: stats,
            message: 'Stats retrieved successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function getVisitorByPhone(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const { phone } = req.query;
        
        if (!phone) {
            next(new BadRequestError('Phone number is required'));
            return;
        }

        const visitor = await VisitorDAO.getByPhoneNumber(phone as string);
        
        if (!visitor) {
            next(new BadRequestError(`Visitor with phone number ${phone} not found`));
            return;
        }

        res.send({
            http_code: 200,
            data: visitor,
            message: 'Visitor retrieved successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function searchVisitors(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const { query } = req.query;
        
        if (!query) {
            next(new BadRequestError('Search query is required'));
            return;
        }

        const visitors = await VisitorDAO.searchVisitors(query as string);

        res.send({
            http_code: 200,
            data: visitors,
            count: visitors.length,
            message: 'Search results retrieved'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function getRecentActiveVisitors(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const { limit } = req.query;
        const visitors = await VisitorDAO.getRecentActiveVisitors(
            limit ? parseInt(limit as string) : 10
        );
        
        res.send({
            http_code: 200,
            data: visitors,
            count: visitors.length,
            message: 'Recent active visitors retrieved'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

// Function untuk mendapatkan daftar staff untuk dropdown
export async function getStaffForDropdown(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const staff = await StaffDAO.getActiveStaff();
        res.send({
            http_code: 200,
            data: staff,
            message: 'Staff list retrieved'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

// Validasi nama staff
export async function validateStaffName(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const { name } = req.query;
        
        if (!name) {
            next(new BadRequestError('Staff name is required'));
            return;
        }

        const staff = await StaffDAO.getStaffByName(name as string);
        
        if (!staff) {
            res.send({ 
                http_code: 200,
                valid: false, 
                message: `Staff "${name}" not found or inactive` 
            });
            return;
        }

        res.send({ 
            http_code: 200,
            valid: true, 
            staff: {
                id: staff.id,
                name: staff.name,
                phone_number: staff.phone_number
            }
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

// Function untuk export CSV
export async function exportVisitorsToCSV(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const {
            includeCheckedOut,
            dateFrom,
            dateTo,
            visitorProfile,
            search,
            timeRange
        } = req.query;

        const options: VisitorDAO.GetAllOptions = {
            includeCheckedOut: true // For export, include all data
        };

        // Handle time range filter
        if (timeRange) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (timeRange) {
                case 'today':
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    options.dateFrom = today;
                    options.dateTo = tomorrow;
                    break;
                    
                case 'last7days':
                    const last7Days = new Date(today);
                    last7Days.setDate(last7Days.getDate() - 7);
                    options.dateFrom = last7Days;
                    options.dateTo = new Date();
                    break;
                    
                case 'last30days':
                    const last30Days = new Date(today);
                    last30Days.setDate(last30Days.getDate() - 30);
                    options.dateFrom = last30Days;
                    options.dateTo = new Date();
                    break;
                    
                case 'custom':
                    if (dateFrom) {
                        options.dateFrom = new Date(dateFrom as string);
                    }
                    if (dateTo) {
                        options.dateTo = new Date(dateTo as string);
                    }
                    break;
            }
        } else {
            if (dateFrom) {
                options.dateFrom = new Date(dateFrom as string);
            }
            if (dateTo) {
                options.dateTo = new Date(dateTo as string);
            }
        }

        if (visitorProfile && ['Player', 'Visitor', 'Other'].includes(visitorProfile as string)) {
            options.visitorProfile = visitorProfile as Visitor['visitor_profile'];
        }

        if (search) {
            options.search = search as string;
        }

        const visitors = await VisitorDAO.getAll(options);

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=visitors_export.csv');

        // Create CSV content - sekarang udah rapi karena data flat
        const headers = [
            'ID',
            'Visitor Name',
            'Phone Number',
            'Profile',
            'Profile Detail',
            'Staff Name',
            'Staff Phone',
            'Check-in Date',
            'Check-in Time',
            'Check-out Date',
            'Check-out Time',
            'Status'
        ];

        // Write headers
        let csvContent = headers.join(',') + '\n';

        // Write data rows
        visitors.forEach((visitor: any) => {
            const row = [
                visitor.id,
                `"${visitor.visitor_name || ''}"`,
                `"${visitor.phone_number || ''}"`,
                `"${visitor.visitor_profile || ''}"`,
                `"${visitor.visitor_profile_other || ''}"`,
                `"${visitor.staff_name || 'No Staff'}"`,  // Udah flat
                `"${visitor.staff_phone || ''}"`,         // Udah flat
                visitor.check_in_date || '',
                visitor.check_in_time || '',
                visitor.check_out_date || '',
                visitor.check_out_time || '',
                visitor.status || ''
            ];
            csvContent += row.join(',') + '\n';
        });

        res.send(csvContent);
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}