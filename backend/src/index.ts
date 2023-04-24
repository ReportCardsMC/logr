import { app } from "./api/base";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

if (!process.env.SESSION_SECRET) {
    console.warn("\n!!! It's recommended to set your own secret session in .env, it's used for specific hashing values. (SESSION_SECRET)\n")
}

if (!process.env.MONGO_URL) {
    console.error("!!! Invalid Mongo URI in .env (MONGO_URI)")
    process.exit(1);
}

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URL)
.catch(err => {
    console.error("!!! Had an issue connecting to the mongo database")
    console.error(err)
    process.exit(1);
})
.then(() => {
    console.log("[MONGO] Database Connected")
})

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`[EXPRESS] Running on port ${PORT}`))