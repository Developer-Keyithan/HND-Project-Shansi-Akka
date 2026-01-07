// Dummy Data for healthybite
// User Data
window.users = [
    { email: 'user@example.com', password: 'password123', name: 'John Doe', role: 'consumer' },
    { email: 'admin@healthybite.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    { email: 'seller@healthybite.com', password: 'seller123', name: 'Healthy Seller', role: 'seller' },
    { email: 'delivery@healthybite.com', password: 'delivery123', name: 'Delivery Partner', role: 'delivery-partner' }
];

// Products Data
window.products = [
    {
        id: 1,
        name: "Superfood Salad",
        description: "A nutrient-packed salad with kale, quinoa, avocado, berries, and lemon vinaigrette.",
        price: 1850,
        calories: 320,
        category: "salads",
        rating: 4.8,
        image: "./assets/superfood-salad.avif",
        ingredients: ["Kale", "Quinoa", "Avocado", "Mixed Berries", "Almonds", "Lemon Vinaigrette"],
        nutrients: {
            protein: 15,
            carbs: 35,
            fat: 12,
            fiber: 8
        },
        badge: "Best Seller"
    },
    {
        id: 2,
        name: "Green Power Smoothie",
        description: "Spinach, banana, almond milk, chia seeds, protein powder, and honey.",
        price: 950,
        calories: 280,
        category: "smoothies",
        rating: 4.6,
        image: './assets/green-power-smoothie.jpg',
        ingredients: ["Spinach", "Banana", "Almond Milk", "Chia Seeds", "Protein Powder", "Honey"],
        nutrients: {
            protein: 20,
            carbs: 40,
            fat: 8,
            fiber: 6
        },
        badge: "New"
    },
    {
        id: 3,
        name: "Vegan Buddha Bowl",
        description: "Brown rice, roasted vegetables, chickpeas, avocado, and tahini dressing.",
        price: 2200,
        calories: 450,
        category: "bowls",
        rating: 4.9,
        image: "./assets/vegan-buddha-bowl.avif",
        ingredients: ["Brown Rice", "Roasted Veggies", "Chickpeas", "Avocado", "Tahini Dressing"],
        nutrients: {
            protein: 18,
            carbs: 60,
            fat: 15,
            fiber: 12
        }
    },
    {
        id: 4,
        name: "Protein Energy Ball",
        description: "Healthy snacks made with dates, nuts, protein powder, and coconut.",
        price: 250,
        calories: 180,
        category: "snacks",
        rating: 4.5,
        image: "./assets/protein-energy-balls.jpg",
        ingredients: ["Dates", "Mixed Nuts", "Protein Powder", "Coconut", "Cacao"],
        nutrients: {
            protein: 12,
            carbs: 20,
            fat: 8,
            fiber: 4
        }
    },
    {
        id: 5,
        name: "Grilled Salmon & Veggies",
        description: "Wild-caught salmon with roasted seasonal vegetables and quinoa.",
        price: 3400,
        calories: 520,
        category: "meals",
        rating: 4.7,
        image: "./assets/grilled-salmon-and-veggies.avif",
        ingredients: ["Salmon", "Seasonal Vegetables", "Quinoa", "Lemon", "Herbs"],
        nutrients: {
            protein: 35,
            carbs: 45,
            fat: 20,
            fiber: 7
        },
        badge: "Chef's Special"
    },
    {
        id: 6,
        name: "Acai Superfood Bowl",
        description: "Acai berry base topped with granola, fruits, coconut, and honey.",
        price: 2400,
        calories: 380,
        category: "bowls",
        rating: 4.8,
        image: "./assets/acai-superfood-bowl.avif",
        ingredients: ["Acai Berry", "Granola", "Mixed Fruits", "Coconut", "Honey"],
        nutrients: {
            protein: 8,
            carbs: 65,
            fat: 12,
            fiber: 10
        }
    },
    {
        id: 7,
        name: "Mediterranean Bowl",
        description: "Quinoa, chickpeas, olives, feta, cucumber, tomatoes, and lemon dressing.",
        price: 2100,
        calories: 420,
        category: "bowls",
        rating: 4.6,
        image: "./assets/mediterranean-bowl.avif",
        ingredients: ["Quinoa", "Chickpeas", "Olives", "Feta", "Cucumber", "Tomatoes"],
        nutrients: {
            protein: 16,
            carbs: 55,
            fat: 14,
            fiber: 11
        }
    },
    {
        id: 8,
        name: "Detox Green Juice",
        description: "Kale, cucumber, celery, green apple, lemon, and ginger.",
        price: 850,
        calories: 120,
        category: "smoothies",
        rating: 4.4,
        image: "./assets/detox-green-juice.jpg",
        ingredients: ["Kale", "Cucumber", "Celery", "Green Apple", "Lemon", "Ginger"],
        nutrients: {
            protein: 3,
            carbs: 25,
            fat: 1,
            fiber: 4
        }
    },
    {
        id: 9,
        name: "Protein Power Bowl",
        description: "Brown rice, grilled chicken, black beans, corn, and avocado.",
        price: 1950,
        calories: 480,
        category: "meals",
        rating: 4.9,
        image: "./assets/protein-power-bowl.jpg",
        ingredients: ["Brown Rice", "Grilled Chicken", "Black Beans", "Corn", "Avocado"],
        nutrients: {
            protein: 38,
            carbs: 50,
            fat: 16,
            fiber: 9
        },
        badge: "High Protein"
    },
    {
        id: 10,
        name: "Berry Bliss Smoothie",
        description: "Mixed berries, Greek yogurt, almond milk, honey, and flax seeds.",
        price: 1100,
        calories: 250,
        category: "smoothies",
        rating: 4.7,
        image: "./assets/berry-bliss-smoothie.webp",
        ingredients: ["Mixed Berries", "Greek Yogurt", "Almond Milk", "Honey", "Flax Seeds"],
        nutrients: {
            protein: 15,
            carbs: 35,
            fat: 6,
            fiber: 7
        }
    }
];

// Categories Data
window.categories = [
    { id: 'all', name: 'All', icon: 'fas fa-utensils', count: 10 },
    { id: 'salads', name: 'Salads', icon: 'fas fa-seedling', count: 2 },
    { id: 'smoothies', name: 'Smoothies', icon: 'fas fa-blender', count: 3 },
    { id: 'bowls', name: 'Bowls', icon: 'fas fa-bowl-food', count: 3 },
    { id: 'meals', name: 'Main Meals', icon: 'fas fa-utensils', count: 2 },
    { id: 'snacks', name: 'Snacks', icon: 'fas fa-apple-alt', count: 1 }
];

// Diet Plans Data
window.dietPlans = [
    {
        id: 1,
        name: "Weight Loss Plan",
        description: "A balanced plan focusing on calorie deficit and nutrient density.",
        calories: 1500,
        duration: "4 weeks",
        price: 499.99,
        features: [
            "Custom meal plans",
            "Weekly grocery list",
            "Nutritionist support",
            "Progress tracking"
        ]
    },
    {
        id: 2,
        name: "Muscle Gain Plan",
        description: "High-protein plan for muscle building and strength training.",
        calories: 2500,
        duration: "8 weeks",
        price: 1499.99,
        features: [
            "High-protein meals",
            "Workout recommendations",
            "Supplement guide",
            "Progress photos"
        ]
    },
    {
        id: 3,
        name: "Vegan Lifestyle",
        description: "Plant-based nutrition for optimal health and energy.",
        calories: 1800,
        duration: "6 weeks",
        price: 999.99,
        features: [
            "100% plant-based",
            "Protein balancing",
            "Recipe ebook",
            "Community support"
        ]
    }
];

// User Orders Data
window.orders = [
    {
        id: "HB78241",
        date: "2023-11-15",
        items: [
            { id: 1, name: "Superfood Salad", quantity: 1, price: 12.99 },
            { id: 2, name: "Green Power Smoothie", quantity: 1, price: 8.99 }
        ],
        total: 21.98,
        status: "delivered",
        deliveryAddress: "123 Main St, Apt 4B, Wellness City"
    },
    {
        id: "HB78239",
        date: "2023-11-14",
        items: [
            { id: 3, name: "Vegan Buddha Bowl", quantity: 1, price: 14.99 }
        ],
        total: 14.99,
        status: "delivered",
        deliveryAddress: "123 Main St, Apt 4B, Wellness City"
    },
    {
        id: "HB78235",
        date: "2023-11-13",
        items: [
            { id: 6, name: "Acai Superfood Bowl", quantity: 1, price: 10.99 },
            { id: 4, name: "Protein Energy Balls", quantity: 2, price: 6.99 }
        ],
        total: 17.98,
        status: "preparing",
        deliveryAddress: "123 Main St, Apt 4B, Wellness City"
    }
];

// Delivery Partners Data
window.deliveryPartners = [
    {
        id: 1,
        name: "John Delivery",
        email: "john@healthybite.com",
        phone: "+1 (234) 567-8901",
        status: "active",
        deliveries: 124,
        rating: 4.8
    },
    {
        id: 2,
        name: "Sarah Courier",
        email: "sarah@healthybite.com",
        phone: "+1 (234) 567-8902",
        status: "active",
        deliveries: 89,
        rating: 4.9
    },
    {
        id: 3,
        name: "Mike Rider",
        email: "mike@healthybite.com",
        phone: "+1 (234) 567-8903",
        status: "inactive",
        deliveries: 45,
        rating: 4.7
    }
];

// Admin Statistics Data
window.adminStats = {
    totalOrders: 1247,
    totalRevenue: 45678.90,
    activeUsers: 892,
    pendingDeliveries: 12,
    monthlyGrowth: 23.5,
    popularProducts: [1, 5, 3, 6, 2],
};

// Discount Data
window.ctaOffer = {
    discountRate: 80,
    validTill: "2026-12-31T23:59:59+05:30.000Z",
    minimumOrderValue: 50,
    maxDiscount: 100
};
