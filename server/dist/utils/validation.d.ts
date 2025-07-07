import { Request, Response, NextFunction } from 'express';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateUrl: () => import("express-validator").ValidationChain[];
export declare const validateCreateComment: () => import("express-validator").ValidationChain[];
export declare const validateToggleLike: () => import("express-validator").ValidationChain[];
export declare const validateDeleteComment: () => import("express-validator").ValidationChain[];
export declare const normalizeUrl: (url: string) => string;
//# sourceMappingURL=validation.d.ts.map