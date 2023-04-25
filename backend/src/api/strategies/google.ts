import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../../models/models";
import { User } from "../../models/User";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("!!! Invalid Google Client ID in .env")
    process.exit(1)
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error("!!! Invalid Google Auth Secret in .env")
    process.exit(1)
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
},
async (accessToken, refreshToken, profile, cb) => {
    let email = profile.emails![0].value;
    if (profile.emails![0].verified === false) {
        return cb(new Error("Email not verified"), null);
    }

    const user = await UserModel.findOne({email});
    try {
        if (user) {
            let strategyFound = user.strategiesUsed?.find((s) => s.name === "google")
            if (strategyFound) {
                // update last used in the object
                strategyFound.lastUsed = Date.now()
            } else {
                user.strategiesUsed?.push({lastUsed: Date.now(), name: "google"})
            }
            await user.save()
            user.apiKeys = user.apiKeys!.map((k) => ({createdAt: k.createdAt, key: "[HIDDEN]", lastUsed: k.lastUsed}))
            return cb(null, user);
        } else {
            const user: User = {"username": profile.displayName, email: profile.emails[0].value, "role": 0, "extraProjects": 0, "apiKeys": [], strategiesUsed: [{"lastUsed": Date.now(), "name": "google"}]};
            const newUser = await UserModel.create(user);
            // const savedUser = await newUser.save();
            newUser.apiKeys = newUser.apiKeys!.map((k) => ({createdAt: k.createdAt, key: "[HIDDEN]", lastUsed: k.lastUsed}))
            return cb(null, newUser);
        }
    } catch (err) {
        console.error("[GOOGLE] Error while logging in for " + profile.id);
        cb(err as Error, undefined)
    }
}));