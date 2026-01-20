import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as MemberDAO from '../daos/memberDao';

export async function validateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as jwt.Secret) as any;
    
    // Get fresh user data from database
    const member = await MemberDAO.getById(decoded.id);
    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      country: member.country,
      publishing_house: member.publishing_house,
      email: member.email,
    };

    return res.json({
      success: true,
      message: 'Token is valid',
      data: userData
    });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Token validation failed'
      });
    }
  }
}

