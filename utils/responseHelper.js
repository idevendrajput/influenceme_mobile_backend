/**
 * Standardized API Response Helper
 */

export const successResponse = (res, message, data = null, statusCode = 200, pagination = null) => {
    const response = {
        status: true,
        message,
        data
    };

    // Add pagination if provided
    if (pagination) {
        response.page = pagination.currentPage;
        response.totalPages = pagination.totalPages;
    }

    return res.status(statusCode).json(response);
};

export const errorResponse = (res, message, statusCode = 400, data = null) => {
    const response = {
        status: false,
        message,
        data
    };

    return res.status(statusCode).json(response);
};
