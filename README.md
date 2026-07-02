# JewelsNYou Backend

## Setup Instructions

1. **Install MongoDB** (if not already installed)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```
   MONGODB_URI=mongodb://localhost:27017/jewelsnyou
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/list` - Get categories
- `GET /api/products/featured/list` - Get featured products

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/favorites/:productId` - Toggle favorite
- `GET /api/auth/favorites` - Get favorites

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order

### Admin
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/stats` - Get dashboard stats

## Admin Panel

1. Open `admin-panel/index.html` in browser
2. Enter admin token when prompted
3. Manage products and orders

## Database Models

### Product
- name, price, description, category, image, images
- rating, reviews, stock, featured
- specifications (material, stoneType, etc.)

### User
- name, email, password, role
- favorites, addresses

### Order
- user, items, shippingAddress, paymentMethod
- paymentInfo, shippingMethod, totals
- status, trackingNumber











