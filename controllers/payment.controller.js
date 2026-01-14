import Stripe from "stripe";
import Order from "../models/order.model.js";
import connectDB from "../lib/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function confirmPayment(req, res) {
    try {
        const { paymentIntentId, orderId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment intent ID is required' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            await connectDB();

            if (orderId) {
                await Order.findOneAndUpdate(
                    { orderId },
                    {
                        paymentStatus: 'paid',
                        status: 'confirmed',
                        paymentIntentId,
                        updatedAt: new Date()
                    }
                );
            }

            return res.status(200).json({
                success: true,
                paymentStatus: 'succeeded',
                message: 'Payment confirmed successfully'
            });
        } else {
            return res.status(400).json({
                success: false,
                paymentStatus: paymentIntent.status,
                error: 'Payment not completed'
            });
        }

    } catch (error) {
        console.error('Payment confirmation error:', error);
        return res.status(500).json({
            error: 'Payment confirmation error',
            message: error.message
        });
    }
}

// export async function createPaymentIntent(req, res) {
//     try {
//         const { amount, currency = 'lkr', orderId, items } = req.body;

//         if (!amount || amount <= 0) {
//             return res.status(400).json({ error: 'Invalid amount' });
//         }

//         // Stripe payment intent create
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100), // smallest currency unit
//             currency: currency.toLowerCase(),
//             metadata: {
//                 orderId: orderId || '',
//                 items: JSON.stringify(items || [])
//             },
//             automatic_payment_methods: {
//                 enabled: true,
//             },
//         });

//         return res.status(200).json({
//             success: true,
//             clientSecret: paymentIntent.client_secret,
//             paymentIntentId: paymentIntent.id
//         });

//     } catch (error) {
//         console.error('Stripe error:', error);
//         return res.status(500).json({ 
//             error: 'Payment processing error',
//             message: error.message 
//         });
//     }
// }


// export async function createPaymentIntent(req, res) {
//     try {
//         const { amount, currency = "lkr", orderId, items } = req.body;

//         if (!amount || amount <= 0) {
//             return res.status(400).json({ error: "Invalid amount" });
//         }

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100), // smallest currency unit
//             currency: currency.toLowerCase(),
//             metadata: {
//                 orderId: orderId || "",
//                 items: JSON.stringify(items || [])
//             },
//             automatic_payment_methods: { enabled: true } // enables wallets
//         });

//         res.status(200).json({
//             success: true,
//             clientSecret: paymentIntent.client_secret
//         });
//     } catch (error) {
//         console.error("Stripe Payment Intent error:", error);
//         res.status(500).json({ error: error.message });
//     }
// }

export async function createPaymentIntent(req, res) {
    try {
        const { amount, currency = "lkr", orderId } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // LKR smallest unit
            currency,
            payment_method_types: ["card"],
            metadata: { orderId: orderId || "" }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}