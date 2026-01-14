# HealthyBite Platform 🍎🥗

HealthyBite is a comprehensive, full-stack e-commerce platform designed for selling healthy food and diet plans. It is built with a modern, lightweight tech stack and optimized for deployment on Vercel's serverless infrastructure.

## 🚀 Project Overview

The mission of HealthyBite is to provide a seamless ordering experience for health-conscious consumers. The platform features a robust backend for managing products, orders, and users, coupled with a dynamic, responsive frontend.

### Key Features

*   **User Authentication**: Secure Login/Register with JWT, Email Verification (OTP), and Social Login support (Google).
*   **Product Management**: Browse, search, filter, and view detailed product information.
*   **Shopping Cart**: Persistent cart functionality allowing users to manage items before purchase.
*   **Order System**: Complete checkout flow, order tracking, and history.
*   **Payments**: Integrated Stripe payment gateway for secure transactions.
*   **Personalization**: Smart product sorting based on user interaction history (views, purchases).
*   **Reviews & Ratings**: User-generated reviews with "Verified Client" badges.
*   **Admin Features**: User management, product updates, and order status handling (via API).

---

## 🛠 Tech Stack

*   **Frontend**: Vanilla HTML5, CSS3 (Custom Design System), JavaScript (ES6+). No heavy frameworks ensuring lightning-fast load times.
*   **Backend**: Node.js with Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Deployment**: Vercel (Serverless Functions).
*   **Architecture**: "Grouped Dynamic Routing" to optimize for Vercel's serverless function limits.

---

## 🏗 Vercel Optimization (The 12-Function Bypass)

To adhere to the specific limits of the Vercel Hobby plan (maximum 12 serverless functions), this project uses a specialized API architecture. Instead of one file per endpoint, we group logic into **8 core serverless functions**:

1.  `/api/auth/[action]`: Handles Login, Register, Logout, Me, Verify.
2.  `/api/users/index` & `[action]`: Handles user listing and profile updates.
3.  `/api/products/index` & `[id]`: Handles product CRUD operations.
4.  `/api/orders/index` & `[id]`: Handles order placement and history.
5.  `/api/common/[endpoint]`: A unified handler for Config, Reviews, Stats, Policy, etc.

This structure allows hundreds of logical endpoints to run efficiently without hitting deployment limits.

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB Connection String (URI)

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/healthybite.git
    cd healthybite
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # Install client dependencies if needed (though client is mostly static serve)
    cd client && npm install && cd ..
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/healthybite
    jwt_secret=your_super_secret_key
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_PUBLISHABLE_KEY=pk_test_...
    GOOGLE_CLIENT_ID=...
    FACEBOOK_APP_ID=...
    ```

4.  **Run Locally**
    *   **Standard Local Server**: Runs a single Express server (fastest for dev).
        ```bash
        node server.js
        ```
        Access `http://localhost:3000`.

    *   **Vercel Simulation**: Emulates the serverless environment.
        ```bash
        npx vercel dev
        ```

---

## 📂 Project Structure

```
├── api/                # Vercel Serverless Functions (Grouped)
│   ├── auth/           # Authentication Handler
│   ├── common/         # Shared endpoints (Config, Reviews, etc.)
│   ├── products/       # Product Handlers
│   ├── orders/         # Order Handlers
│   └── users/          # User Handlers
├── client/             # Frontend Application
│   ├── assets/         # Images, Icons
│   ├── components/     # Shared UI Components (Navbar, Footer)
│   ├── pages/          # Individual HTML Pages
│   ├── shared/         # Shared JS Logic (API wrapper, Auth)
│   ├── style.css       # Core Styles
│   └── script.js       # Main Frontend Logic
├── controllers/        # Business Logic (Reused by both server.js and /api)
├── lib/                # Database Connection (Mongoose)
├── vercel.json         # Vercel Routing Configuration
└── server.js           # Local Development Server
```

## 📝 License
This project is licensed under the ISC License.
