# HealthyBite Platform

A comprehensive online platform for HealthyBite (PVT) Ltd that enables owners to sell pure and healthy foods online, customers to purchase products, and join fitness and healthy plans.

## 🌟 Features

### For Customers
- **Browse Healthy Products**: Explore a wide range of organic, nutrient-rich meals and snacks
- **Shopping Cart**: Add items to cart and manage quantities
- **Secure Checkout**: Stripe payment integration with LKR currency support
- **Order Tracking**: Track your orders from confirmation to delivery
- **Diet Planning**: Join personalized fitness and healthy diet plans
- **User Profile**: Manage personal information, view order history, and track diet plans
- **Product Search**: Search for products by name, category, or ingredients

### For Sellers
- **Product Management**: Add, edit, and manage product listings
- **Order Management**: View and process customer orders
- **Sales Analytics**: Track sales and revenue

### For Administrators
- **Dashboard**: Comprehensive overview of platform statistics
- **User Management**: Manage users, sellers, and delivery partners
- **Order Management**: Monitor all orders across the platform
- **Product Oversight**: Manage all products and categories

### For Delivery Partners
- **Delivery Management**: View assigned deliveries
- **Route Optimization**: Efficient delivery tracking
- **Status Updates**: Update delivery status in real-time

## 🛠️ Technology Stack

- **Frontend**: Raw HTML, CSS, and JavaScript (ES6+)
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB with Mongoose ODM
- **Payment**: Stripe Payment Gateway
- **Hosting**: Vercel
- **Routing**: Client-side routing (vanilla JavaScript)

### For All Users
- **Modern UI/UX**: Premium design with smooth animations and responsive layout
- **Popover System**: Custom modal and notification system (Success, Error, Info, Warning, Confirm)
- **Centralized Config**: Easily manage tax, delivery fees, and app settings via `app.config.js`
- **Legal Compliance**: Dedicated Terms and Conditions and Privacy Policy pages

## 📁 Project Structure

```
shansi-akka-hnd-project/
├── api/                    # Vercel serverless functions (Backend)
│   ├── auth/              # Authentication (Login, Register, Social)
│   ├── logs/              # Logging system
│   ├── orders/            # Order management
│   ├── payments/          # Stripe payments
│   ├── products/          # Product management
│   └── users/             # User management
├── client/                 # Frontend application
│   ├── assets/            # Images and static assets
│   ├── auth/              # Auth pages (Login, Register)
│   ├── components/        # Reusable UI components
│   ├── dashboard/         # Role-specific dashboards
│   ├── pages/             # Main application pages
│   │   ├── errors/        # Error pages (401, 404, etc.)
│   │   ├── menu.html
│   │   ├── cart.html
│   │   ├── payment.html
│   │   ├── product-view.html
│   │   ├── terms.html
│   │   └── privacy.html
│   ├── plugins/           # Custom plugins (Modal/Popover, Toast)
│   ├── shared/            # Shared JS (Router, Utils, Auth, Config)
│   ├── app.config.js      # Central application configuration
│   ├── index.html         # Entry point
│   └── script.js          # Core application logic
├── controllers/            # Backend controllers
├── models/                 # Mongoose models
├── middlewares/            # Express middlewares
├── scripts/                # Maintenance scripts (Routing fixes)
├── vercel.json            # Vercel deployment configuration
└── package.json           # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Stripe account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Developer-Keyithan/HND-Project-Shansi-Akka.git
   cd healthybite-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file (for local development) or configure in Vercel:
   ```
   MONGODB_URI=your_mongodb_connection_string
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

## 💳 Payment Integration

The platform uses Stripe for secure payment processing with LKR (Sri Lankan Rupee) currency support. Payment flow:

1. Customer adds items to cart
2. Proceeds to checkout
3. Enters delivery information
4. Stripe Payment Element handles card details securely
5. Payment intent is created and confirmed
6. Order is saved to database with payment status

## 🗄️ Database Schema

### User Model
- Email (unique)
- Password (hashed)
- Name
- Role (consumer, seller, admin, delivery-partner, delivery-man)
- Phone
- Address

### Product Model
- Name
- Description
- Price (in LKR)
- Calories
- Category
- Rating
- Image URL
- Ingredients
- Nutrients (protein, carbs, fat, fiber)
- Seller ID
- Stock

### Order Model
- Order ID (unique)
- User ID
- Items (array)
- Total amount
- Status (pending, confirmed, preparing, ready, out-for-delivery, delivered, cancelled)
- Delivery address
- Payment status
- Payment Intent ID
- Delivery Partner ID

## 🔐 Authentication

The platform uses JWT-based authentication (can be extended) with role-based access control:

- **Consumer**: Browse, purchase, track orders
- **Seller**: Manage products, view sales
- **Admin**: Full platform access
- **Delivery Partner**: Manage deliveries

## 📱 Responsive Design

The platform is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with filters)
- `POST /api/products` - Create new product (seller/admin)

### Orders
- `GET /api/orders` - Get orders (with filters)
- `POST /api/orders` - Create new order
- `PUT /api/orders` - Update order status

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

### Configuration
- `GET /api/config/stripe-key` - Get Stripe publishable key

## 🎨 Design Features

- Modern, clean UI with green color scheme (representing health)
- Smooth animations and transitions
- Intuitive navigation
- Accessible design
- Fast loading times

## 📝 Development Notes

- All pages use vanilla JavaScript (no frameworks)
- Client-side routing for smooth navigation
- LocalStorage for cart persistence
- API calls for data persistence
- Fallback to mock data for development

## 🔒 Security Features

- Secure password handling (should use bcrypt in production)
- Stripe secure payment processing
- CORS protection on API endpoints
- Input validation
- XSS protection

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

HealthyBite (PVT) Ltd Development Team

## 📞 Support

For support, email info@healthybite.com or visit our contact page.

---

**Note**: This is a production-ready platform. Make sure to:
- Use environment variables for sensitive data
- Implement proper password hashing (bcrypt)
- Enable HTTPS in production
- Set up proper error logging
- Configure CORS appropriately
- Use Stripe test keys for development

