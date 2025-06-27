import mongoose from 'mongoose';
import {NODE_ENV, DB_URI } from "../configs/env.js";

if (!DB_URI) {
    throw  new Error('DB_URL is not defined');
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log(`Connected to database in ${NODE_ENV} mode`);
    } catch (error) {
        console.log("Error connecting to db: ", error);
        process.exit(1);
    }
}

export default connectToDatabase;