import { Mapped, OptionalKeys, RequiredKeys } from '../utils/types';
import { users as User, Prisma } from '@prisma/client';
import prisma from '../services/prisma';
import hidash from '../utils/hidash';


const model = prisma.users;

export type Required = Omit<RequiredKeys<User>, 'id' | 'created_at' | 'modified_at' | 'active'>;
export type Optional = Partial<Omit<OptionalKeys<User>, 'premiere_id'>>;
export type Create = Mapped<Required & Optional>;

export function getRequired() {
    const required: Required = {
        username: '',
        password: '',
        salt: '',
        role: 'SUPERADMIN',
    };
    return Object.keys(required);
}

export function formatCreate(data: any) {
    const formatted: Create = {
        username: data.username,
        password: data.password,
        salt: data.salt,
        role: data.role,
    };

    hidash.clean(formatted);
    return formatted;
}

export async function create(data: Create) {
    return await model.create({ data });
}

export async function getByUsername(username: User['username']) {
    return await model.findUnique({ where: { username } });
}

export async function getById(id: User['id']) {
    return await model.findUnique({ where: { id } });
}

export async function getAll() {
    return await model.findMany({
        where: { active: true }, 
        orderBy: { created_at: 'desc' }
    });
}

export async function updatePassword(id: User['id'], password: string, salt: string) {
    return await model.update({
        where: { id },
        data: {
            password,
            salt,
            modified_at: new Date()
        }
    });
}

export async function update(id: User['id'], data: Partial<User>) {
    return await model.update({
        where: { id },
        data: {
            ...data,
            modified_at: new Date()
        }
    });
}

export async function softDelete(id: User['id']) {
    return await model.update({
        where: { id },
        data: {
            active: false,
            modified_at: new Date()
        }
    });
}

// Get user including inactive (for internal use)
export async function getByIdIncludeInactive(id: User['id']) {
    return await model.findUnique({ where: { id } });
}

// Restore user
export async function restoreUser(id: User['id']) {
    return await model.update({
        where: { id },
        data: {
            active: true,
            modified_at: new Date()
        }
    });
}