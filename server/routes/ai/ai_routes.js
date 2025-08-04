const express = require('express');
const router = express.Router();
const AISearchService = require('../../services/aiSeachService.js');

const aiService = new AISearchService();

const validateQuery = (req, res, next) => {
  const { query } = req.body;
  
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Query is required and must be a valid string'
    });
  }
  
  if (query.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Query too long. Maximum 500 characters'
    });
  }
  
  next();
};

const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { query, userId } = req.body;
  
  console.log(`[${timestamp}] AI Query: "${query}" | User: ${userId || 'anonymous'}`);
  next();
};

router.post('/search', validateQuery, logRequest, async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    const result = aiService.processQuery(query, userId);
    
    result.timestamp = new Date().toISOString();
    result.processingTime = Date.now() - req.startTime;
    
    res.json(result);
    
  } catch (error) {
    console.error('Error in AI search:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Could not process the query'
    });
  }
});

router.get('/recommendations/:userId?', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 6 } = req.query;
    
    const recommendations = userId 
      ? aiService.getPersonalizedRecommendations(userId)
      : aiService.getPopularProducts();
    
    res.json({
      success: true,
      message: 'Recommendations obtained successfully',
      results: recommendations.slice(0, parseInt(limit)),
      count: recommendations.length,
      personalized: !!userId
    });
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting recommendations'
    });
  }
});

router.post('/products/search', validateQuery, (req, res) => {
  try {
    const { query, filters = {} } = req.body;
    
    let results = aiService.searchProducts(query);
    
    if (filters.category) {
      results = results.filter(p => 
        p.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.brand) {
      results = results.filter(p => 
        p.brand.toLowerCase() === filters.brand.toLowerCase()
      );
    }
    
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      results = results.filter(p => p.price >= min && p.price <= max);
    }
    
    if (filters.minRating) {
      results = results.filter(p => p.rating >= filters.minRating);
    }
    
    res.json({
      success: true,
      message: `${results.length} products found`,
      results,
      count: results.length,
      query,
      filters
    });
    
  } catch (error) {
    console.error('Error in product search:', error);
    res.status(500).json({
      success: false,
      error: 'Error in product search'
    });
  }
});

router.post('/products/compare', (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 product IDs are required to compare'
      });
    }
    
    const products = aiService.itemsDB.filter(p => 
      productIds.includes(p.id)
    );
    
    if (products.length < 2) {
      return res.status(404).json({
        success: false,
        error: 'Not enough products found to compare'
      });
    }
    
    const comparison = {
      products,
      analysis: {
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price))
        },
        bestRated: products.reduce((best, current) => 
          current.rating > best.rating ? current : best
        ),
        mostAffordable: products.reduce((cheapest, current) => 
          current.price < cheapest.price ? current : cheapest
        ),
        commonFeatures: products[0].features.filter(feature =>
          products.every(p => p.features.includes(feature))
        )
      }
    };
    
    res.json({
      success: true,
      message: 'Comparison completed successfully',
      results: comparison,
      count: products.length
    });
    
  } catch (error) {
    console.error('Error comparing products:', error);
    res.status(500).json({
      success: false,
      error: 'Error comparing products'
    });
  }
});

router.get('/admin/stats', (req, res) => {
  try {
    const { type } = req.query;
    
    let results;
    
    switch (type) {
      case 'sales':
        results = aiService.adminDB.sales;
        break;
      case 'inventory':
        results = aiService.adminDB.inventory;
        break;
      case 'users':
        results = aiService.adminDB.users;
        break;
      default:
        results = aiService.adminDB.overview;
    }
    
    res.json({
      success: true,
      message: 'Statistics obtained successfully',
      results,
      type: type || 'overview'
    });
    
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting statistics'
    });
  }
});

router.post('/analyze', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    const analysis = {
      intent: aiService.detectIntent(query.toLowerCase()),
      sentiment: aiService.analyzeSentiment(query.toLowerCase()),
      wordCount: query.split(' ').length,
      hasNumbers: /\d/.test(query),
      hasPriceTerms: /price|cost|cheap|expensive|discount/.test(query.toLowerCase()),
      hasBrandMentions: /apple|samsung|dell|asus|sony|hp|google|nintendo|microsoft/.test(query.toLowerCase())
    };
    
    res.json({
      success: true,
      message: 'Analysis completed',
      query,
      results: analysis
    });
    
  } catch (error) {
    console.error('Error analyzing query:', error);
    res.status(500).json({
      success: false,
      error: 'Error analyzing query'
    });
  }
});

router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'AI Search Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;