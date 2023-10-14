import { SiteErrorObject } from '@shared';
import { Response } from 'express';
import { SiteError } from '../errors';
import { MiddlewareProvider } from '../types/Express';

export const siteErrorHandler: MiddlewareProvider = () => {
    return (err, req, res: Response<SiteErrorObject<unknown>>, next) => {
        if (err instanceof SiteError) {
            if (req.app.get('env') === 'development') {
                console.log(`${req.method} ${req.url}`, err);
            }

            res.status(err.statusCode).json({
                title: err.title,
                description: err.description,
                additionalData: err.additionalData,
            });
        } else next(err);
    };
};
