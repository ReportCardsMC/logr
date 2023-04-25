import {Router} from "express";
import hat from "hat";
import passport from "passport";
import { UserModel } from "../../models/models";

function generateCode(): string {
    return hat();
}

export const authRouter = Router();

passport.serializeUser((user: any, done) => {
    console.log(`[PASSPORT] Serializing user ${user.email} (Provider: ${user.provider})`)
    console.log(JSON.stringify(user, null, 2))
    process.nextTick(function() {
        // console.log(JSON.stringify(user, null, 2))
        done(null, user.email);
    })
})

passport.deserializeUser(async (id, done) => {
    console.log(`[PASSPORT] Deserializing user ${id}`)
    try {
        const user = await UserModel.findOne({email: id});
        if(!user) {
            return done(new Error(`[PASSPORT] User ${id} not found`), null);
        }
        user.apiKeys = user.apiKeys!.map((k) => ({createdAt: k.createdAt, key: "[HIDDEN]", lastUsed: k.lastUsed}));
        console.log(`[PASSPORT] User ${id} found`)
        process.nextTick(function() {
            done(null, user);
        })
    } catch (err) {
        console.error(`[PASSPORT] Error deserializing user ${id}`)
        process.nextTick(function() {
            done(err, null);
        })
    }
    // done(null, { id });
})

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

authRouter.get('/google/callback',
    passport.authenticate('google', { failureRedirect: "/login", failureMessage: "Failed to login with Google", successRedirect: "/" }),
    (req, res) => {
        res.redirect('/')
    }
)

authRouter.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'] }))

authRouter.get('/discord/callback',
    passport.authenticate('discord', { failureRedirect: "/login", failureMessage: "Failed to login with Discord", successRedirect: "/" }),
    (req, res) => {
        res.redirect('/')
    }
)

authRouter.get('/account', (req, res) => {
    if(!req.user) {
        return res.status(401).json({error: "Not logged in"})
    }
    return res.json(req.user)
})