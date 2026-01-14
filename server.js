import app from './app.js';
import connectDB from './lib/db.js';

const PORT = 3000;

// Start
connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Local Express Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB', err);
});
