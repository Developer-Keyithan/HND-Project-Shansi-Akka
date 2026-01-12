import connectDB from "../lib/db.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

// Get products
export async function getProducts(req, res) {
    try {
        await connectDB();
        const { category, search, limit, sort, userId } = req.query;
        let query = {};

        if (category && category !== "all") query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
            // dynamic based on search: Increment views from search
            Product.updateMany(query, { $inc: { views: 1 } }).catch(err => console.error(err));

            // If userId present, record search history (fire and forget)
            if (userId) {
                User.findByIdAndUpdate(userId, {
                    $push: { searchHistory: { query: search, date: new Date() } }
                }).catch(err => console.error("Failed to update search history", err));
            }
        }

        // Fetch all candidates first (filtering is applied)
        let products = await Product.find(query);

        // Personalized Sorting
        if (userId && sort === 'popular') { // Apply personalization mainly on 'popular' or default sort
            const user = await User.findById(userId);
            const userOrders = await Order.find({ userId: userId });

            if (user) {
                // Gather interaction data
                const validWishlist = new Set(user.wishlist || []);
                const validCart = new Set((user.cart || []).map(c => c.id));
                const viewedIds = new Set((user.viewHistory || []).map(v => v.productId));

                // Analyze orders for preferred categories and bought items
                const orderedProductIds = new Set();
                const categoryCounts = {};

                // Helper map for quick lookup
                const productMap = new Map(products.map(p => [p._id.toString(), p]));

                userOrders.forEach(order => {
                    order.items.forEach(item => {
                        if (item.productId) {
                            const pid = item.productId.toString();
                            orderedProductIds.add(pid);

                            // Check if this ordered product is in our current list to find its category
                            const product = productMap.get(pid);
                            if (product && product.category) {
                                categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
                            }
                        }
                    });
                });

                products = products.map(p => {
                    let score = (p.sales || 0) * 1 + (p.views || 0) * 0.1; // Base global popularity
                    const pid = p._id.toString();

                    if (validWishlist.has(pid)) score += 500; // Strong signal
                    if (validCart.has(pid)) score += 100; // In cart
                    if (orderedProductIds.has(pid)) score += 50; // Bought before (convenience)
                    if (viewedIds.has(pid)) score += 10; // Recently viewed

                    // Category Boost
                    if (p.category && categoryCounts[p.category]) {
                        score += categoryCounts[p.category] * 20; // +20 points for each time you bought from this category
                    }

                    // Return object with score for sorting
                    return { product: p, score };
                });

                // Sort Descending by Score
                products.sort((a, b) => b.score - a.score);

                // Unwrap
                products = products.map(item => item.product);
            } else {
                // Fallback to global popularity if user not found
                products.sort((a, b) => ((b.sales || 0) + (b.views || 0) * 0.1) - ((a.sales || 0) + (a.views || 0) * 0.1));
            }
        } else {
            // Standard Sorting options
            let sortOption = { createdAt: -1 };
            if (sort === 'popular') {
                sortOption = { sales: -1, views: -1 };
            } else if (sort === 'recommended') {
                sortOption = { sales: -1, rating: -1, views: -1 };
            } else if (sort === 'price_asc') {
                sortOption = { price: 1 };
            } else if (sort === 'price_desc') {
                sortOption = { price: -1 };
            } else if (sort === 'rating') {
                sortOption = { rating: -1 };
            }

            // Re-fetch with sort if we didn't do manual sort (optimization: we fetched all above. 
            // If data is small, in-memory sort is fine. If large, we should have used .sort() on query.
            // Since we already fetched `products`, let's sort in memory to avoid double DB call.)

            products.sort((a, b) => {
                // Implementing sort logic for in-memory array
                if (sort === 'popular') return (b.sales - a.sales) || (b.views - a.views);
                if (sort === 'price_asc') return a.price - b.price;
                if (sort === 'price_desc') return b.price - a.price;
                if (sort === 'rating') return b.rating - a.rating;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        }

        if (limit) products = products.slice(0, parseInt(limit));

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get single product and increment views
export async function getProductById(req, res) {
    try {
        await connectDB();
        const { id } = req.params;
        const { userId } = req.query; // Optional userId to track history

        const product = await Product.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Track user view history
        if (userId) {
            User.findByIdAndUpdate(userId, {
                $push: { viewHistory: { productId: id, date: new Date() } }
            }).catch(err => console.error("Failed to update view history", err));
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Get Product Error:", error);
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

// Update product
export async function updateProduct(req, res) {
    try {
        await connectDB();
        const { id } = req.query;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Delete product
export async function deleteProduct(req, res) {
    try {
        await connectDB();
        const { id } = req.query;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
