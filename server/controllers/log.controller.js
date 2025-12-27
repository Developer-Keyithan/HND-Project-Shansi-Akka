import Log from "../models/log.model.js";
import connectDB from "../db.js";

export async function handleLogs(req, res) {
    try {
        await connectDB();

        if (req.method === 'POST') {
            const logEntry = new Log(req.body);
            await logEntry.save();
            res.status(201).json({ success: true });
        } 
        else if (req.method === 'GET') {
            const { level, limit = 100 } = req.query;
            let query = {};

            if (level) {
                query.level = level;
            }

            const logs = await Log.find(query)
                .sort({ timestamp: -1 })
                .limit(parseInt(limit));

            res.status(200).json({ success: true, logs });
        } 
        else {
            res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('Logs API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
