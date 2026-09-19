import { AppError } from '../middleware/errorMiddleware.js';

export function featureNotImplemented(featureName) {
  return (req, res, next) => {
    next(new AppError(`${featureName} is not implemented yet`, 501));
  };
}
