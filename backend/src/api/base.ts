import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import * as bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

dotenv.config();
export const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(`[EXPRESS] ${req.method}:${req.url}`);
    req.started = Date.now();
    next();
});

app.use(helmet())

let sessionSecret = process.env.SESSION_SECRET || "superDuperSecretKeyThatNoOneCanTotallyGuess123456789";
if (!process.env.SESSION_SECRET) console.warn("!! No session secret provided, using default value. This may be insecure.");

app.use(session({
    secret: sessionSecret,
    cookie: {
        maxAge: 60000 * 60 * 24 // 1 day
    },
    resave: false,
    saveUninitialized: false,
    name: 'authentication',
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL, ttl: 60 * 60 * 24, dbName: process.env.SESSION_DB, collectionName: "sessions" })
}));

app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});

app.use((req, res, next) => {
    console.log(`[EXPRESS] ${req.method}:${req.url} ‖ Finished in ${Date.now() - req.started!}ms\n`)
    next();
})

app.listen(PORT, () => console.log("Listening on port " + PORT));