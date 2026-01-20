function successResponse(data: any, message?: string | null, meta?: any) {
	return { status: '200', data, message: message ?? `Success`, meta: { meta } };
}

export default successResponse;
