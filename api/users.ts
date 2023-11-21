import { Router , json } from "express";

export const userRouter = Router();
userRouter.use(json());

userRouter.route('/')
    .get((req, res) => {
        
    })