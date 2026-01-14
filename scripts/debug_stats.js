import connectDB from '../lib/db.js';
import Stats from '../models/stats.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkStats() {
    await connectDB();
    const stats = await Stats.findOne();
    process.exit(0);
}

checkStats();
