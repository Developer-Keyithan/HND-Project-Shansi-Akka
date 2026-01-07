import connectDB from "../lib/db.js";
import Product from "../models/product.model.js";

// Get products
export async function getProducts(req, res) {
    try {
        await connectDB();
        const { category, search, limit } = req.query;
        let query = {};

        if (category && category !== "all") query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        let products = await Product.find(query).sort({ createdAt: -1 });
        if (limit) products = products.slice(0, parseInt(limit));

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Create product
export async function createProduct(req, res) {
    try {
        await connectDB();
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
