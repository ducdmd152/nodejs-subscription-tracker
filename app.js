import express from 'express';
import {PORT, QSTASH_TOKEN, QSTASH_URL} from './configs/env.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import {authenticate, authorize} from "./middlewares/auth.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

// create server
const app = express();


// global middlewares
app.use(express.json()); // JSON body
app.use(express.urlencoded({ extended: true })); // Form body
app.use(cookieParser()); // Cookie
app.use(arcjetMiddleware); // Arcjet Sercurity Protection

console.log("QSTASH_TOKEN: ", QSTASH_TOKEN);
console.log("QSTASH_URL: ", QSTASH_URL);

// routes
app.get('/', (req, res) => {
    res.send('Welcome to the Subscription Tracker API');
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenticate, authorize(0), userRouter);
app.use("/api/v1/subscriptions", authenticate, subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);


// post middlewares
app.use(errorMiddleware);

// port release
app.listen(PORT, async () => {
    console.log(`Subscription Tracker API is running on port http://localhost:${PORT}`);

    await connectToDatabase();
});