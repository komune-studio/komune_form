import { NextFunction, Request, Response } from 'express';
import {
    BadParamIdError,
    BadRequestError,
    EntityNotFoundError,
    InternalServerError,
    MissingBodyError,
} from '../errors/RequestErrorCollection';
import * as UserDAO from '../daos/userDAO';
import hidash from '../utils/hidash';
import crypto from '../utils/crypto';
import { users_role } from '@prisma/client';
import prisma from '../services/prisma'; 
import jwt from 'jsonwebtoken';

export async function createSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        if (!body) return next(new MissingBodyError());

        const salt = crypto.generateSalt();
        const password = crypto.generatePassword(body.password, salt);
        body.salt = salt;
        body.password = password;

        const isMissingProperty = hidash.checkPropertyV2(body, 'User', UserDAO.getRequired());
        if (isMissingProperty.message) return next(isMissingProperty);

        if (body.role !== users_role.SUPERADMIN) {
            return next(new BadRequestError("User's role must be SUPERADMIN!", 'INVALID_USER_ROLE'));
        }

        const result = await UserDAO.create(UserDAO.formatCreate(body));
        return res.send(hidash.desensitizedFactory(result));
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        if (!body) return next(new MissingBodyError());

        const salt = crypto.generateSalt();
        const password = crypto.generatePassword(body.password, salt);
        body.salt = salt;
        body.password = password;

        const isMissingProperty = hidash.checkPropertyV2(body, 'User', UserDAO.getRequired());
        if (isMissingProperty.message) return next(isMissingProperty);

        if (body.role !== users_role.ADMIN) {
            return next(new BadRequestError("User's role must be ADMIN!", 'INVALID_USER_ROLE'));
        }

        const result = await UserDAO.create(UserDAO.formatCreate(body));
        return res.send(hidash.desensitizedFactory(result));
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        if (!body) return next(new MissingBodyError());

        const user = await UserDAO.getByUsername(body.username);
        if (!user) return next(new EntityNotFoundError('Username', body.username));

        // Cek apakah user aktif
        if (!user.active) {
            return next(new BadRequestError('Your account is deactivated. Please contact administrator.', 'ACCOUNT_DEACTIVATED'));
        }

        const hashedPassword = crypto.generatePassword(body.password, user.salt);
        if (hashedPassword !== user.password) {
            return next(new BadRequestError('Invalid username or password!'));
        }

        const token = jwt.sign(
            {
                authenticated: true,
                id: user.id,
                username: user.username,
                role: user.role,
            },
            process.env.TOKEN_SECRET as jwt.Secret,
            { expiresIn: '7d' }
        );

        const userData = hidash.desensitizedFactory(user);
        return res.json({ ...userData, token });
    } catch (error: any) {
        return next(new InternalServerError(error.message));
    }
}

export async function getSelfData(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseInt(req.decoded.id);
        if (isNaN(id)) return next(new BadParamIdError());

        let user = await UserDAO.getById(id);
        if (!user) return next(new EntityNotFoundError('User', id));

        hidash.desensitizedFactory(user);
        return res.send(user);
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
      const users = await UserDAO.getAll();
      
      // Desensitize each user's data
      const desensitizedUsers = users.map(user => 
          hidash.desensitizedFactory(user)
      );
      
      return res.send(desensitizedUsers);
  } catch (error: any) {
      return next(new InternalServerError(error));
  }
}

export async function resetUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
      const { newPassword } = req.body; // HANYA newPassword dari body
      const userId = parseInt(req.params.userId); // userId dari URL
      
      if (!newPassword) {
          return next(new MissingBodyError());
      }

      if (isNaN(userId)) return next(new BadParamIdError());

      // Check if user exists
      const user = await UserDAO.getById(userId);
      if (!user) return next(new EntityNotFoundError('User', userId));

      // Generate new salt and password
      const salt = crypto.generateSalt();
      const hashedPassword = crypto.generatePassword(newPassword, salt);

      // Update password
      const result = await UserDAO.updatePassword(userId, hashedPassword, salt);
      
      return res.send({ 
          message: 'Password reset successfully',
          user: hidash.desensitizedFactory(result)
      });
  } catch (error: any) {
      return next(new InternalServerError(error));
  }
}

// Reset own password (for logged in users)
export async function resetOwnPassword(req: Request, res: Response, next: NextFunction) {
  try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
          return next(new MissingBodyError());
      }

      const userId = parseInt(req.decoded.id);
      if (isNaN(userId)) return next(new BadParamIdError());

      // Get user data
      const user = await UserDAO.getById(userId);
      if (!user) return next(new EntityNotFoundError('User', userId));

      // Verify current password
      const currentHashedPassword = crypto.generatePassword(currentPassword, user.salt);
      if (currentHashedPassword !== user.password) {
          return next(new BadRequestError('Current password is incorrect!'));
      }

      // Generate new salt and password
      const newSalt = crypto.generateSalt();
      const newHashedPassword = crypto.generatePassword(newPassword, newSalt);

      // Update password
      const result = await UserDAO.updatePassword(userId, newHashedPassword, newSalt);
      
      return res.send({ 
          message: 'Password reset successfully',
          user: hidash.desensitizedFactory(result)
      });
  } catch (error: any) {
      return next(new InternalServerError(error));
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
      const { username } = req.body; // Bisa ditambah field lain sesuai kebutuhan
      const userId = parseInt(req.params.userId || req.decoded.id); // Bisa dari params atau dari token
      
      if (!username) {
          return next(new MissingBodyError());
      }

      if (isNaN(userId)) return next(new BadParamIdError());

      // Check if user exists
      const user = await UserDAO.getById(userId);
      if (!user) return next(new EntityNotFoundError('User', userId));

      // Check if username already exists (kecuali untuk user yang sama)
      if (username !== user.username) {
          const existingUser = await UserDAO.getByUsername(username);
          if (existingUser && existingUser.id !== userId) {
              return next(new BadRequestError("Username already exists!", "USERNAME_EXISTS"));
          }
      }

      // Update user data
      const result = await UserDAO.update(userId, { username });
      
      return res.send({ 
          message: 'Profile updated successfully',
          user: hidash.desensitizedFactory(result)
      });
  } catch (error: any) {
      return next(new InternalServerError(error));
  }
}

// Update own profile (for logged in user)
export async function updateOwnProfile(req: Request, res: Response, next: NextFunction) {
  try {
      const { username } = req.body;
      const userId = parseInt(req.decoded.id); // Selalu dari token (user yang login)
      
      if (!username) {
          return next(new MissingBodyError());
      }

      if (isNaN(userId)) return next(new BadParamIdError());

      // Check if user exists
      const user = await UserDAO.getById(userId);
      if (!user) return next(new EntityNotFoundError('User', userId));

      // Check if username already exists
      if (username !== user.username) {
          const existingUser = await UserDAO.getByUsername(username);
          if (existingUser && existingUser.id !== userId) {
              return next(new BadRequestError("Username already exists!", "USERNAME_EXISTS"));
          }
      }

      // Update user data
      const result = await UserDAO.update(userId, { username });
      
      return res.send({ 
          message: 'Profile updated successfully',
          user: hidash.desensitizedFactory(result)
      });
  } catch (error: any) {
      return next(new InternalServerError(error));
  }
}

export async function softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) return next(new BadParamIdError());

        // Check if user exists
        const user = await UserDAO.getByIdIncludeInactive(userId);
        if (!user) return next(new EntityNotFoundError('User', userId));

        // Prevent self-deletion
        const currentUserId = parseInt(req.decoded.id);
        if (userId === currentUserId) {
            return next(new BadRequestError("Cannot delete your own account!", "SELF_DELETION_NOT_ALLOWED"));
        }

        // Prevent deleting SUPERADMIN (unless by another SUPERADMIN)
        if (user.role === users_role.SUPERADMIN && req.decoded.role !== users_role.SUPERADMIN) {
            return next(new BadRequestError("Only SUPERADMIN can delete another SUPERADMIN!", "UNAUTHORIZED_DELETION"));
        }

        // Soft delete user
        const result = await UserDAO.softDelete(userId);
        
        return res.send({ 
            message: 'User deleted successfully',
            user: hidash.desensitizedFactory(result)
        });
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
}

// Restore user
export async function restoreUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) return next(new BadParamIdError());

        // Check if user exists
        const user = await UserDAO.getByIdIncludeInactive(userId);
        if (!user) return next(new EntityNotFoundError('User', userId));

        // Restore user
        const result = await UserDAO.restoreUser(userId);
        
        return res.send({ 
            message: 'User restored successfully',
            user: hidash.desensitizedFactory(result)
        });
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
}

// Get all users including inactive (for SUPERADMIN only)
export async function getAllUsersWithInactive(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await prisma.users.findMany({
            orderBy: { created_at: 'desc' }
        });
        
        // Desensitize each user's data
        const desensitizedUsers = users.map(user => 
            hidash.desensitizedFactory(user)
        );
        
        return res.send(desensitizedUsers);
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
}