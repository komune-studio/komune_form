import { Prisma } from '@prisma/client';
import prisma from '../services/prisma';
import hidash from '../utils/hidash';

const model = prisma.visitors;

export interface CreateVisitorData {
    visitor_name: string;
    phone_number: string;
    visitor_profile: Prisma.visitorsCreateInput['visitor_profile'];
    visitor_profile_other?: string | null;
    staff_id: number;
    checked_out_at?: Date | null;
}

export interface UpdateVisitorData {
    visitor_name?: string;
    phone_number?: string;
    visitor_profile?: Prisma.visitorsCreateInput['visitor_profile'];
    visitor_profile_other?: string | null;
    staff_id?: number;
    checked_out_at?: Date | null;
}

export interface GetAllOptions {
    includeCheckedOut?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    visitorProfile?: Prisma.visitorsCreateInput['visitor_profile'];
    search?: string;
    staffId?: number;
    timeRange?: string;
    limit?: number;        // Tambahan: buat pagination
    offset?: number;       // Tambahan: buat pagination
    selectFields?: string[]; // Tambahan: pilih field tertentu aja
}

// Format rapi buat tabel/grid display (flatten structure)
export function formatVisitorForTable(visitor: any) {
    if (!visitor) return null;
    
    return {
        id: visitor.id,
        visitor_name: visitor.visitor_name,
        phone_number: visitor.phone_number,
        visitor_profile: visitor.visitor_profile,
        visitor_profile_other: visitor.visitor_profile_other,
        status: visitor.checked_out_at ? 'Checked Out' : 'Active',
        check_in_date: visitor.created_at ? new Date(visitor.created_at).toISOString().split('T')[0] : '',
        check_in_time: visitor.created_at ? new Date(visitor.created_at).toTimeString().split(' ')[0] : '',
        check_out_date: visitor.checked_out_at ? new Date(visitor.checked_out_at).toISOString().split('T')[0] : '',
        check_out_time: visitor.checked_out_at ? new Date(visitor.checked_out_at).toTimeString().split(' ')[0] : '',
        // Flatten staff data jadi column sendiri-sendiri
        staff_name: visitor.staff?.name || '-',
        staff_phone: visitor.staff?.phone_number || '-',
        staff_id: visitor.staff_id
    };
}

export interface VisitorStats {
    totalVisitors: number;
    visitorsByProfile: Array<{
        visitor_profile: Prisma.visitorsCreateInput['visitor_profile'];
        _count: number;
    }>;
    checkedOutCount: number;
    activeVisitors: number;
    recentVisitors: any[];
}

export function getRequired(): Array<keyof CreateVisitorData> {
    const required: Array<keyof CreateVisitorData> = [
        'visitor_name',
        'phone_number', 
        'visitor_profile',
        'staff_id'
    ];
    return required;
}

export function formatCreate(data: any): Prisma.visitorsCreateInput {
    const formatted: Prisma.visitorsCreateInput = {
        visitor_name: data.visitor_name,
        phone_number: data.phone_number,
        visitor_profile: data.visitor_profile,
        staff: data.staff_id ? { connect: { id: data.staff_id } } : undefined
    };

    if (data.visitor_profile === 'Other' && data.visitor_profile_other) {
        formatted.visitor_profile_other = data.visitor_profile_other;
    }

    if (data.checked_out_at) {
        formatted.checked_out_at = new Date(data.checked_out_at);
    }

    return formatted;
}

export async function create(data: Prisma.visitorsCreateInput): Promise<any> {
    const result = await model.create({ 
        data,
        include: {
            staff: true
        }
    });
    return formatVisitorForTable(result);
}

export async function getById(id: number): Promise<any | null> {
    const result = await model.findUnique({ 
        where: { id },
        include: {
            staff: true
        }
    });
    return formatVisitorForTable(result);
}

export async function getAll(options?: GetAllOptions): Promise<any[]> {
    const where: Prisma.visitorsWhereInput = {};

    if (options?.dateFrom && options?.dateTo) {
        where.created_at = {
            gte: options.dateFrom,
            lte: options.dateTo
        };
    }

    if (options?.visitorProfile) {
        where.visitor_profile = options.visitorProfile;
    }

    if (options?.staffId) {
        where.staff_id = options.staffId;
    }

    if (options?.search) {
        where.OR = [
            { visitor_name: { contains: options.search } },
            { phone_number: { contains: options.search } },
            { staff: { name: { contains: options.search } } }
        ];
    }

    if (options?.includeCheckedOut === false) {
        where.checked_out_at = null;
    }

    // Build query options
    const queryOptions: any = {
        where,
        include: {
            staff: true
        },
        // ORDERING FIX: ID descending (terbaru di atas)
        orderBy: [
            { id: 'desc' },  // Prioritas ID terbesar di atas
            { created_at: 'desc' }
        ]
    };

    // Pagination
    if (options?.limit) {
        queryOptions.take = options.limit;
    }
    if (options?.offset) {
        queryOptions.skip = options.offset;
    }

    const results = await model.findMany(queryOptions);
    
    // Format rapi buat tabel
    return results.map(formatVisitorForTable);
}

export async function update(id: number, data: UpdateVisitorData): Promise<any> {
    const updateData: Prisma.visitorsUpdateInput = {
        ...data,
        modified_at: new Date()
    };

    // Handle staff relation jika staff_id diupdate
    if (data.staff_id !== undefined) {
        updateData.staff = data.staff_id ? { connect: { id: data.staff_id } } : { disconnect: true };
    }

    const result = await model.update({
        where: { id },
        data: updateData,
        include: {
            staff: true
        }
    });
    
    return formatVisitorForTable(result);
}

export async function checkOut(id: number): Promise<any> {
    const result = await model.update({
        where: { id },
        data: {
            checked_out_at: new Date(),
            modified_at: new Date()
        },
        include: {
            staff: true
        }
    });
    
    return formatVisitorForTable(result);
}

export async function deleteVisitor(id: number): Promise<any> {
    return await model.delete({ 
        where: { id },
        include: {
            staff: true
        }
    });
}

export async function getByPhoneNumber(phone_number: string): Promise<any | null> {
    const result = await model.findFirst({ 
        where: { phone_number },
        include: {
            staff: true
        },
        orderBy: { id: 'desc' } // ID terbaru duluan
    });
    
    return formatVisitorForTable(result);
}

export async function getStats(dateFrom?: Date, dateTo?: Date): Promise<VisitorStats> {
    const where: Prisma.visitorsWhereInput = {};
    
    if (dateFrom && dateTo) {
        where.created_at = {
            gte: dateFrom,
            lte: dateTo
        };
    }

    const totalVisitors = await model.count({ where });
    
    const visitorsByProfile = await model.groupBy({
        by: ['visitor_profile'],
        where,
        _count: true
    });

    const checkedOutCount = await model.count({ 
        where: { 
            ...where,
            checked_out_at: { not: null }
        }
    });

    const activeVisitors = await model.count({ 
        where: { 
            ...where,
            checked_out_at: null
        }
    });

    const recentVisitors = await model.findMany({
        where: { checked_out_at: null },
        include: {
            staff: true
        },
        take: 10,
        orderBy: { id: 'desc' } // ID terbaru duluan
    });

    return {
        totalVisitors,
        visitorsByProfile,
        checkedOutCount,
        activeVisitors,
        recentVisitors: recentVisitors.map(formatVisitorForTable)
    };
}

export async function getRecentActiveVisitors(limit: number = 10): Promise<any[]> {
    const results = await model.findMany({
        where: { checked_out_at: null },
        include: {
            staff: true
        },
        take: limit,
        orderBy: { id: 'desc' } // ID terbaru duluan
    });
    
    return results.map(formatVisitorForTable);
}

export async function validateStaff(staffId: number): Promise<boolean> {
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            active: true
        }
    });
    return !!staff;
}

// Additional functions that might be needed
export async function searchVisitors(searchTerm: string): Promise<any[]> {
    const results = await model.findMany({
        where: {
            OR: [
                { visitor_name: { contains: searchTerm } },
                { phone_number: { contains: searchTerm } },
                { staff: { name: { contains: searchTerm } } }
            ]
        },
        include: {
            staff: true
        },
        orderBy: { id: 'desc' }, // ID terbaru duluan
        take: 50
    });
    
    return results.map(formatVisitorForTable);
}

export async function getVisitorsByStaff(staffId: number): Promise<any[]> {
    const results = await model.findMany({
        where: {
            staff_id: staffId,
            checked_out_at: null
        },
        include: {
            staff: true
        },
        orderBy: { id: 'desc' } // ID terbaru duluan
    });
    
    return results.map(formatVisitorForTable);
}