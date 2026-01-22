import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateAccessToken = (userId: string) => {
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
        expiresIn: '15m',
    });
};

export const generateRefreshToken = (userId: string) => {
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
