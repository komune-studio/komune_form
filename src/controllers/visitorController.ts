import { NextFunction, Request, Response } from 'express';
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError,
    InternalServerError,
    MissingBodyError,
} from '../errors/RequestErrorCollection';
import * as VisitorDAO from '../daos/visitorDAO';
import hidash from '../utils/hidash';
import { visitors as Visitor } from '@prisma/client'; // Import dari prisma client

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

        const result = await VisitorDAO.create(VisitorDAO.formatCreate(body));
        res.send(result);
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

        res.send(visitor);
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
            search
        } = req.query;

        const options: VisitorDAO.GetAllOptions = {};

        if (includeCheckedOut !== undefined) {
            options.includeCheckedOut = includeCheckedOut === 'true';
        }

        if (dateFrom) {
            options.dateFrom = new Date(dateFrom as string);
        }

        if (dateTo) {
            options.dateTo = new Date(dateTo as string);
        }

        if (visitorProfile && ['Player', 'Visitor', 'Other'].includes(visitorProfile as string)) {
            // Gunakan type langsung dari @prisma/client
            options.visitorProfile = visitorProfile as Visitor['visitor_profile'];
        }

        if (search) {
            options.search = search as string;
        }

        const visitors = await VisitorDAO.getAll(options);
        res.send(visitors);
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

        const result = await VisitorDAO.update(id, body);
        res.send(result);
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
            message: 'Visitor checked out successfully',
            visitor: result 
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
            message: 'Visitor deleted successfully'
        });
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}

export async function getVisitorStats(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
        const { dateFrom, dateTo } = req.query;

        const stats = await VisitorDAO.getStats(
            dateFrom ? new Date(dateFrom as string) : undefined,
            dateTo ? new Date(dateTo as string) : undefined
        );

        res.send(stats);
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
            // Fix: Use BadRequestError or create a custom message
            // instead of EntityNotFoundError which expects a numeric ID
            next(new BadRequestError(`Visitor with phone number ${phone} not found`));
            return;
        }

        res.send(visitor);
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

        const visitors = await VisitorDAO.getAll({
            search: query as string,
            includeCheckedOut: true
        });

        res.send(visitors);
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
        res.send(visitors);
    } catch (error: any) {
        next(new InternalServerError(error));
    }
}