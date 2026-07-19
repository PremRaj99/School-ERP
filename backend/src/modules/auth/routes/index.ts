import express from 'express';
import { login, signup } from '../auth.controller';
import { submitContact } from '../contact.controller';
import { logout, refresh } from '../../user/user.controller';
import { verifyJWT } from '@/core/middlewares/auth.middleware';

const authRouter = express.Router();

authRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'working' });
});
authRouter.post('/login', login);
authRouter.post('/contact', submitContact);
authRouter.post('/signup', signup);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);

export { authRouter };
