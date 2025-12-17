import express from 'express';
import { fetchAllUsers } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/', fetchAllUsers);

userRouter.get('/:id', (req, res) => {
  res.send('User route');
});

userRouter.put('/:id', (req, res) => {
  res.send('User route');
});

userRouter.delete('/:id', (req, res) => {
  res.send('User route');
});
export default userRouter;