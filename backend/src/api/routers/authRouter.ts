import {Router} from "express";
import hat from "hat";
import passport from "passport";

function generateCode(): string {
    return hat();
}

export const authRouter = Router();

authRouter.get('/google', passport.authenticate('google'))