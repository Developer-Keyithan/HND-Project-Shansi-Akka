import mongoose from 'mongoose';
import User from './models/user.model.js';
import connectDB from './lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

const email = 'sathyjaseelankeyithan@gmail.com';

connectDB().then(async () => {
    const res = await User.deleteOne({ email });
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
