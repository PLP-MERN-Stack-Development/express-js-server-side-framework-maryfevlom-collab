# Express.js RESTful API - Week 2 Assignment

A complete RESTful API built with Express.js featuring CRUD operations, authentication, validation, filtering, pagination, and comprehensive error handling.

## 📋 Features Implemented

✅ **Task 1: Express.js Setup**
- Node.js project initialized
- Express.js server running on port 3000
- Root endpoint with welcome message

✅ **Task 2: RESTful API Routes**
- Complete CRUD operations for products
- All required endpoints implemented

✅ **Task 3: Middleware Implementation**
- Custom request logger with timestamps
- Authentication middleware (API key validation)
- JSON body parser
- Product validation middleware

✅ **Task 4: Error Handling**
- Custom error classes (NotFoundError, ValidationError, AuthenticationError)
- Global error handling middleware
- Proper HTTP status codes
- Async error handling with try/catch

✅ **Task 5: Advanced Features**
- Query parameter filtering by category
- Pagination support
- Search functionality by name/description
- Product statistics endpoint

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd express-js-server-side-framework-maryfevlom-collab
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
# Already copied from .env.example
# Edit the file with your values
```

Add to `.env`:
```
PORT=3000
NODE_ENV=development
API_KEY=your_secret_api_key_here
```

4. Start the server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

Server will be available at: `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Root Endpoint
```http
GET /
```

**Response:**
```json
{
  "message": "Welcome to the Product API!",
  "endpoints": {
    "products": "/api/products",
    "health": "/api/health",
    "stats": "/api/products/stats"
  }
}
```

#### 2. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-04T10:30:00.000Z",
  "uptime": 123.456
}
```

#### 3. Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `search` - Search products by name or description
- `category` - Filter by category (electronics, kitchen, furniture)
- `inStock` - Filter by stock status (true/false)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sortBy` - Sort by field (name, price, category)
- `order` - Sort order (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example Requests:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Search for laptops
curl http://localhost:3000/api/products?search=laptop

# Filter by category
curl http://localhost:3000/api/products?category=electronics

# Filter by stock status
curl http://localhost:3000/api/products?inStock=true

# Price range
curl http://localhost:3000/api/products?minPrice=100&maxPrice=500

# Sort by price
curl http://localhost:3000/api/products?sortBy=price&order=desc

# Pagination
curl http://localhost:3000/api/products?page=1&limit=5

# Combined filters
curl "http://localhost:3000/api/products?category=electronics&inStock=true&sortBy=price&page=1"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop with 16GB RAM",
      "price": 1200,
      "category": "electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalProducts": 5,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### 4. Get Product Statistics
```http
GET /api/products/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 5,
    "inStock": 4,
    "outOfStock": 1,
    "byCategory": {
      "electronics": {
        "count": 3,
        "totalValue": 2150
      },
      "kitchen": {
        "count": 1,
        "totalValue": 50
      },
      "furniture": {
        "count": 1,
        "totalValue": 250
      }
    },
    "averagePrice": 490,
    "totalValue": 2450
  }
}
```

#### 5. Get Single Product
```http
GET /api/products/:id
```

**Example:**
```bash
curl http://localhost:3000/api/products/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Laptop",
    "description": "High-performance laptop with 16GB RAM",
    "price": 1200,
    "category": "electronics",
    "inStock": true
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Product with ID 999 not found"
}
```

#### 6. Create Product
```http
POST /api/products
```

**Authentication Required:** Yes

**Headers:**
```
Content-Type: application/json
x-api-key: your_secret_api_key_here
```

**Request Body:**
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "category": "electronics",
  "inStock": true
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_api_key_here" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver",
    "price": 29.99,
    "category": "electronics",
    "inStock": true
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver",
    "price": 29.99,
    "category": "electronics",
    "inStock": true
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Name is required and must be a non-empty string, Price is required and must be a non-negative number"
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": "API key is required"
}
```

#### 7. Update Product
```http
PUT /api/products/:id
```

**Authentication Required:** Yes

**Headers:**
```
Content-Type: application/json
x-api-key: your_secret_api_key_here
```

**Request Body:**
```json
{
  "name": "Updated Laptop",
  "description": "Updated high-performance laptop",
  "price": 1100,
  "category": "electronics",
  "inStock": true
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secret_api_key_here" \
  -d '{
    "name": "Updated Laptop",
    "description": "Updated high-performance laptop",
    "price": 1100,
    "category": "electronics",
    "inStock": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "1",
    "name": "Updated Laptop",
    "description": "Updated high-performance laptop",
    "price": 1100,
    "category": "electronics",
    "inStock": true
  }
}
```

#### 8. Delete Product
```http
DELETE /api/products/:id
```

**Authentication Required:** Yes

**Headers:**
```
x-api-key: your_secret_api_key_here
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "x-api-key: your_secret_api_key_here"
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": "1",
    "name": "Laptop",
    "description": "High-performance laptop with 16GB RAM",
    "price": 1200,
    "category": "electronics",
    "inStock": true
  }
}
```

## 🔐 Authentication

Protected routes (POST, PUT, DELETE) require an API key in the request headers:

```
x-api-key: your_secret_api_key_here
```

Set your API key in the `.env` file:
```
API_KEY=your_secret_api_key_here
```

## ✅ Validation Rules

When creating or updating products:

- **name**: Required, non-empty string
- **description**: Required, string
- **price**: Required, non-negative number
- **category**: Required, non-empty string
- **inStock**: Optional, boolean (defaults to true)

## 🚨 Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🧪 Testing with Postman

### Setup
1. Open Postman
2. Create a new collection
3. Set base URL: `http://localhost:3000`

### For Protected Routes
Add header:
- **Key**: `x-api-key`
- **Value**: `your_secret_api_key_here`

### Sample Test Cases

1. **Get all products**
   - Method: GET
   - URL: `{{baseUrl}}/api/products`

2. **Search products**
   - Method: GET
   - URL: `{{baseUrl}}/api/products?search=laptop`

3. **Create product**
   - Method: POST
   - URL: `{{baseUrl}}/api/products`
   - Headers: `x-api-key: your_key`
   - Body: Raw JSON

4. **Update product**
   - Method: PUT
   - URL: `{{baseUrl}}/api/products/1`
   - Headers: `x-api-key: your_key`
   - Body: Raw JSON

5. **Delete product**
   - Method: DELETE
   - URL: `{{baseUrl}}/api/products/1`
   - Headers: `x-api-key: your_key`

## 📁 Project Structure

```
.
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment variables
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── Week2-Assignment.md   # Assignment requirements
```

## 🛠️ Technologies Used

- **Express.js** - Web framework
- **body-parser** - JSON parsing middleware
- **uuid** - Unique ID generation
- **dotenv** - Environment variable management

## 📝 Assignment Checklist

- [x] Task 1: Express.js Setup
- [x] Task 2: RESTful API Routes (all 5 endpoints)
- [x] Task 3: Middleware Implementation
  - [x] Request logger
  - [x] JSON parser
  - [x] Authentication
  - [x] Validation
- [x] Task 4: Error Handling
  - [x] Custom error classes
  - [x] Global error handler
  - [x] Proper status codes
  - [x] Async error handling
- [x] Task 5: Advanced Features
  - [x] Category filtering
  - [x] Pagination
  - [x] Search functionality
  - [x] Statistics endpoint

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up proper logging
4. Use a real database instead of in-memory storage
5. Implement rate limiting
6. Add CORS configuration

## 📄 License

ISC

## 👤 Author

Mary Fevlom