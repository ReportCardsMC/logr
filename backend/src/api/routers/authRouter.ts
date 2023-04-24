import {Router} from "express";
import hat from "hat";

function generateCode(): string {
    return hat();
}

export const authRouter = Router();

authRouter.get('/google', passport.authenticate('google'))