// server.js - Complete Express server for Week 2 assignment
require('dotenv').config();

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// ============================================
// CUSTOM ERROR CLASSES (Task 4)
// ============================================

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// ============================================
// CUSTOM MIDDLEWARE (Task 3)
// ============================================

// Logger middleware - logs request method, URL, and timestamp
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  next();
};

// Authentication middleware - checks for API key in headers
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new AuthenticationError('API key is required'));
  }
  
  // Check if API key matches the one in environment variables
  if (apiKey !== process.env.API_KEY) {
    return next(new AuthenticationError('Invalid API key'));
  }
  
  next();
};

// Validation middleware for product creation and updates
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  // Validate description
  if (!description || typeof description !== 'string') {
    errors.push('Description is required and must be a string');
  }

  // Validate price
  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }

  // Validate category
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }

  // Validate inStock (if provided)
  if (inStock !== undefined && typeof inStock !== 'boolean') {
    errors.push('inStock must be a boolean value');
  }

  if (errors.length > 0) {
    return next(new ValidationError(errors.join(', ')));
  }

  next();
};

// Apply logger middleware to all routes
app.use(requestLogger);

// ============================================
// SAMPLE DATA
// ============================================

let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  },
  {
    id: '4',
    name: 'Desk Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 250,
    category: 'furniture',
    inStock: true
  },
  {
    id: '5',
    name: 'Headphones',
    description: 'Noise-canceling wireless headphones',
    price: 150,
    category: 'electronics',
    inStock: true
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Pagination helper
const paginate = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return array.slice(startIndex, endIndex);
};

// Find product by ID
const findProductById = (id) => {
  return products.find(p => p.id === id);
};

// ============================================
// ROUTES (Task 2)
// ============================================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API!',
    endpoints: {
      products: '/api/products',
      health: '/api/health',
      stats: '/api/products/stats'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /api/products - Get all products with filtering, pagination, and search (Task 5)
app.get('/api/products', (req, res, next) => {
  try {
    let filteredProducts = [...products];
    
    // Search by name (Task 5)
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by category (Task 5)
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Filter by inStock status
    if (req.query.inStock !== undefined) {
      const inStockValue = req.query.inStock === 'true';
      filteredProducts = filteredProducts.filter(p => p.inStock === inStockValue);
    }
    
    // Filter by price range
    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    
    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice);
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }
    
    // Sorting
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      
      filteredProducts.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * sortOrder;
        if (a[sortField] > b[sortField]) return 1 * sortOrder;
        return 0;
      });
    }
    
    // Pagination (Task 5)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    
    const paginatedProducts = paginate(filteredProducts, page, limit);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/stats - Get product statistics (Task 5)
app.get('/api/products/stats', (req, res, next) => {
  try {
    const stats = {
      totalProducts: products.length,
      inStock: products.filter(p => p.inStock).length,
      outOfStock: products.filter(p => !p.inStock).length,
      byCategory: {},
      averagePrice: 0,
      totalValue: 0
    };
    
    // Count by category
    products.forEach(product => {
      if (!stats.byCategory[product.category]) {
        stats.byCategory[product.category] = {
          count: 0,
          totalValue: 0
        };
      }
      stats.byCategory[product.category].count++;
      stats.byCategory[product.category].totalValue += product.price;
    });
    
    // Calculate average price and total value
    stats.totalValue = products.reduce((sum, p) => sum + p.price, 0);
    stats.averagePrice = stats.totalProducts > 0 ? stats.totalValue / stats.totalProducts : 0;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res, next) => {
  try {
    const product = findProductById(req.params.id);
    
    if (!product) {
      throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product (requires authentication and validation)
app.post('/api/products', authenticate, validateProduct, (req, res, next) => {
  try {
    const { name, description, price, category, inStock = true } = req.body;
    
    const newProduct = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim().toLowerCase(),
      inStock: inStock
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update an existing product (requires authentication and validation)
app.put('/api/products/:id', authenticate, validateProduct, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    const { name, description, price, category, inStock } = req.body;
    
    products[productIndex] = {
      ...products[productIndex],
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim().toLowerCase(),
      inStock: inStock !== undefined ? inStock : products[productIndex].inStock
    };
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: products[productIndex]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product (requires authentication)
app.delete('/api/products/:id', authenticate, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ERROR HANDLING (Task 4)
// ============================================

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError('Route not found'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export the app for testing purposes
module.exports = app;