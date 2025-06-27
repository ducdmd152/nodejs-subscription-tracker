import jwt from 'jsonwebtoken'

import User from '../models/user.model.js'
import {JWT_SECRET} from "../configs/env.js";

export const authenticate = async (req, res, next) => {
    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if(!user) return res.status(401).json({ message: 'Unauthorized' });

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
}

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const isAdmin = req.user?.isAdmin;

        if (!allowedRoles.includes(isAdmin ? 0 : 1)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }

        next();
    };
};