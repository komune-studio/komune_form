import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { RequestError } from '../errors/RequestErrorCollection';
import { users_role } from '@prisma/client';

const processToken = (req: Request, successCallback: Function, errorCallback: Function) => {
	if (req.headers['authorization']) {
		let token = req.headers['authorization'].split(' ')[1];
		// decode token
		if (token) {
			let secret = process.env.TOKEN_SECRET;
			if (!secret) {
				errorCallback(new Error('NO_SECRET_DEFINED'));
			}

			// verifies secret and checks exp
			try {
				req.decoded = jwt.verify(token, <Secret>secret);
				// console.log(req.decoded)
				successCallback();
			} catch (err: any) {
				console.log(err);
				let message = err.message;
				message = message.toUpperCase().replace(' ', '_');
				errorCallback({ msg: message, err: err });
			}
		} else {
			//token missing
			errorCallback({ msg: 'NO_TOKEN_PROVIDED' });
		}
	} else {
		//no header
		errorCallback({ msg: 'BAD_TOKEN_FORMAT' });
	}
};

function member(req: Request, res: Response, next: NextFunction) {
	processToken(
		req,
		async () => {
			if (req.decoded.authenticated === true) {
				next();
			} else {
				return next(new RequestError('No member data found in the token', 403, 'NO_MEMBER_DATA'));
			}
		},
		(err: any) => {
			return next(new RequestError('Refer to the code', 403, err.msg));
		}
	);
}

function admin(req: Request, res: Response, next: NextFunction) {
	processToken(
		req,
		async () => {
			if (req.decoded.role === users_role.ADMIN) {
				next();
			} else {
				return next(new RequestError('No admin data found in the token', 403, 'NO_ADMIN_DATA'));
			}
		},
		(err: any) => {
			//logger.error(err.err)
			return next(new RequestError('Refer to the code', 403, err.msg));
		}
	);
}

function superadmin(req: Request, res: Response, next: NextFunction) {
	processToken(
		req,
		async () => {
			if (req.decoded.role === users_role.SUPERADMIN) {
				next();
			} else {
				return next(new RequestError('No Super Admin data found in the token', 403, 'NO_SUPERADMIN_DATA'));
			}
		},
		(err: any) => {
			//logger.error(err.err)
			return next(new RequestError('Refer to the code', 403, err.msg));
		}
	);
}

function admin_superadmin(req: Request, res: Response, next: NextFunction) {
	processToken(
		req,
		async () => {
			if (req.decoded.role === users_role.SUPERADMIN || req.decoded.role === users_role.ADMIN) {
				next();
			} else {
				return next(new RequestError('No superadmin/admin data found in the token', 403, 'NO_SUPERADMIN_DATA'));
			}
		},
		(err: any) => {
			//logger.error(err.err)
			return next(new RequestError('Refer to the code', 403, err.msg));
		}
	);
}

function any(req: Request, res: Response, next: NextFunction) {
	processToken(
		req,
		async () => {
			if (req.decoded.authenticated) {
				// console.log(req.decoded)
				next();
			} else {
				return next(new RequestError('No superadmin/admin data found in the token', 403, 'NO_AUTH_DATA'));
			}
		},
		(err: any) => {
			//logger.error(err)
			return next(new RequestError(err.msg, 403, 'Refer to the code'));
		}
	);
}

function optional(req: Request, res: Response, next: NextFunction) {
	processToken(
		req,
		async () => {
			next();
		},
		(err: any) => {
			req.decoded = { none: true };
			next();
		}
	);
}

function developer(req: Request, res: Response, next: NextFunction) {
	if (!process.env.DEV_SECRET || process.env.DEV_SECRET?.length < 5)
		return next(new RequestError('Invalid auth', 403, 'INVALID_AUTH'));
	if (req.headers['authorization'] === process.env.DEV_SECRET) next();
	else return next(new RequestError('Invalid auth', 403, 'INVALID_AUTH'));
}

export default {
	member,
	admin,
	any,
	optional,
	developer,
	superadmin,
	admin_superadmin,
};
