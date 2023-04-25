import passport from "passport";
import dotenv from "dotenv";
import refresh from "passport-oauth2-refresh"
import Strategy from "passport-discord";
import { UserModel } from "../../models/models";

dotenv.config()

if (!process.env.DISCORD_CLIENT_ID) {
    console.error("!!! Invalid Discord Client ID in .env")
    process.exit(1)
}

if (!process.env.DISCORD_AUTH_SECRET) {
    console.error("!!! Invalid Discord Auth Secret in .env")
    process.exit(1)
}

let discordStrat = new Strategy(
    {
        clientID: process.env.DISCORD_CLIENT_ID as string,
        clientSecret: process.env.DISCORD_AUTH_SECRET as string,
        callbackURL: process.env.REDIRECT_URI || `http://localhost:3000/auth/discord/callback`,
        scope: ["identify", "email"]
    }, async (accessToken: string, refreshToken: string, profile, done) => { // Any is actually meant to be OAuth2Strategy.VerifyCallback
        console.log("[DISCORD] Logged in to " + profile.email)
        let email = profile.email;
        const user = await UserModel.findOne({ email });
        try {
            if (user) {
                let strategyFound = user.strategiesUsed?.find((s) => s.name === "discord")
                if (strategyFound) {
                    // update last used in the object
                    strategyFound.lastUsed = Date.now()
                } else {
                    user.strategiesUsed?.push({lastUsed: Date.now(), name: "discord"})
                }
                await user.save()
                user.apiKeys = user.apiKeys!.map((k) => ({createdAt: k.createdAt, key: "[HIDDEN]", lastUsed: k.lastUsed}))
                return done(null, user);
            } else {
                const user = await UserModel.create({username: profile.username, email: profile.email, role: 0, extraProjects: 0, apiKeys: [], strategiesUsed: [{"lastUsed": Date.now(), "name": "discord"}]});
                const savedUser = await user.save();
                savedUser.apiKeys = savedUser.apiKeys!.map((k) => ({createdAt: k.createdAt, key: "[HIDDEN]", lastUsed: k.lastUsed}))
                return done(null, savedUser);
            }
        } catch (err: any) {
            console.error(`[DISCORD] Error logging in to ${profile.email}`)
            return done(err, undefined);
        }
    }
)

passport.use(discordStrat)

refresh.use(discordStrat)