import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
    totalMealsServed: { type: Number, default: 0 }, // Start with initial flat value
    totalStars: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalDeliveryTime: { type: Number, default: 0 }, // in minutes
    totalDeliveries: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);
export default Stats;
