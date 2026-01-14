# Changelog - HealthyBite Platform

## Version 1.4.2 - Recent Refinements (2026-01-09)

### Enhancements
- **Centralized Configuration**: Implemented `client/app.config.js` to manage global settings like `tax` and `deliveryFee`.
- **Popover API Refinement**: Updated `client/plugins/Modal/modal.js` with a robust `Popover` API supporting `alert`, `error`, `warning`, `info`, `success`, `confirm`, and `content`.
- **Dynamic Tax Calculation**: Updated `cart.js` and `payment.js` to dynamically calculate tax based on `AppConfig.tax`.
- **Error Handling**: Added custom 401 Unauthorized error page and improved session expiration handling.

### Bug Fixes
- Resolved `undefined` errors related to `window.AppConfig` by ensuring proper script loading order.
- Fixed calculation inaccuracies in the checkout flow.

---

## Version 1.2.0 - Legal & Security Update (2026-01-07)

### Features
- **Legal Pages**: Added `terms.html` and `privacy.html` pages for compliance.
- **Improved Routing**: Fixed navigation links in the registration and login flows.
- **Dashboard UI**: Enhanced delivery partner and seller dashboard layouts.

---

## Version 1.0.0 - Initial Release (2024)

### Features Implemented

#### ✅ Client-Side Routing
- Created `shared/router.js` for client-side routing without Express
- Handles navigation between pages without full page reloads
- Supports URL parameters and query strings

#### ✅ MongoDB Integration
- Set up MongoDB connection using Mongoose
- Created API endpoints in `api/` directory:
  - `/api/auth/login.js` - User authentication
  - `/api/auth/register.js` - User registration
  - `/api/products/index.js` - Product management
  - `/api/orders/index.js` - Order management
  - `/api/payments/create-intent.js` - Stripe payment intent creation
  - `/api/payments/confirm.js` - Payment confirmation
  - `/api/config/stripe-key.js` - Stripe key configuration

#### ✅ Stripe Payment Integration
- Integrated Stripe Payment Gateway
- Support for LKR (Sri Lankan Rupee) currency
- Secure payment processing with Stripe Elements
- Payment intent creation and confirmation flow

#### ✅ Completed Pages
- **Cart Page** (`pages/cart.html` & `pages/cart.js`)
  - View cart items
  - Update quantities
  - Remove items
  - Calculate totals with tax and delivery fee
  - Proceed to checkout

- **Payment Page** (`pages/payment.html` & `pages/payment.js`)
  - Delivery information form
  - Stripe payment integration
  - Order creation
  - Payment processing

- **Payment Success Page** (`pages/payment-success.html`)
  - Order confirmation
  - Order tracking link

- **Product View Page** (`pages/product-view.html` & `pages/product-view.js`)
  - Detailed product information
  - Nutritional information
  - Ingredients list
  - Add to cart functionality
  - Related products

- **Profile Page** (`pages/profile.html` & `pages/profile.js`)
  - Personal information management
  - Order history
  - Diet plans
  - Account settings

- **About Page** (`pages/about.html`)
  - Company story
  - Mission and vision
  - Team information
  - Values

#### ✅ Shared Utilities
- **`shared/utils.js`** - Utility functions:
  - Price formatting (LKR)
  - Date formatting
  - Email/phone validation
  - URL parameter handling
  - Cart calculations

- **`shared/auth.js`** - Authentication utilities:
  - User management
  - Login/register/logout functions
  - Role-based access control
  - API integration

- **`shared/router.js`** - Client-side routing system

#### ✅ Configuration Files
- **`package.json`** - Updated with all dependencies
- **`vercel.json`** - Vercel deployment configuration
- **`README.md`** - Comprehensive project documentation
- **`SETUP.md`** - Detailed Vercel hosting instructions

### Technical Stack
- Frontend: Raw HTML, CSS, JavaScript (ES6+)
- Backend: Vercel Serverless Functions
- Database: MongoDB with Mongoose
- Payment: Stripe
- Hosting: Vercel

### Database Models
- **User**: Email, password, name, role, phone, address
- **Product**: Name, description, price, calories, category, nutrients, etc.
- **Order**: Order ID, user ID, items, total, status, payment info

### Security Features
- Secure password handling (ready for bcrypt)
- Stripe secure payment processing
- CORS protection
- Input validation
- Environment variable configuration

### Currency Support
- All prices displayed in LKR (Sri Lankan Rupee)
- Stripe configured for LKR currency
- Proper formatting with `formatPrice()` utility

### Responsive Design
- Mobile-first approach
- Works on all device sizes
- Touch-friendly interface

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox

---

## Next Steps for Production

1. **Security Enhancements**
   - Implement bcrypt for password hashing
   - Add JWT tokens for authentication
   - Implement rate limiting
   - Add input sanitization

2. **Performance Optimization**
   - Image optimization
   - Code minification
   - CDN integration
   - Caching strategies

3. **Additional Features**
   - Email notifications
   - SMS notifications
   - Push notifications
   - Advanced analytics
   - Admin dashboard enhancements

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance testing

---

**Last Updated**: January 2026

