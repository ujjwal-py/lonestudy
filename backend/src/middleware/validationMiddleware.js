import ApiError from "../utils/apiError.js";

export const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new ApiError(400, "Validation Error", result.error.issues);
        }
        req.body = result.data;
        next();
    };
};


