import connectDB from "../../lib/db.js";
import Product from "../../models/product.model.js";

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json({ success: true, product });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
