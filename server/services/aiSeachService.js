const Fuse = require('fuse.js');

class EnhancedAISearchService {
  constructor() {
    this.userDB = require('../db/db_user.json');
    this.itemsDB = require('../db/db_items.json');
    this.adminDB = require('../db/db_admin.json');
    
    this.searchConfigs = {
      products: {
        keys: [
          { name: 'name', weight: 0.6 },
          { name: 'brand', weight: 0.3 },
          { name: 'category', weight: 0.2 },
          { name: 'features', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'tags', weight: 0.2 }
        ],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true
      }
    };
    
    this.productsFuse = new Fuse(this.itemsDB, this.searchConfigs.products);
  }

  processQuery(query, userId = null) {
    const cleanQuery = query.toLowerCase().trim();
    const response = {
      intent: this.detectIntent(cleanQuery),
      results: [],
      suggestions: [],
      userContext: userId ? this.getUserContext(userId) : null,
      conversational: true
    };

    switch (response.intent) {
      case 'inventory_check':
        response.results = this.handleInventoryCheck(cleanQuery);
        break;
      
      case 'product_details':
        response.results = this.handleProductDetails(cleanQuery);
        break;
      
      case 'product_selection':
        response.results = this.handleProductSelection(cleanQuery);
        break;
      
      case 'brand_inquiry':
        response.results = this.handleBrandInquiry(cleanQuery);
        break;
      
      case 'availability_check':
        response.results = this.handleAvailabilityCheck(cleanQuery);
        break;
      
      case 'product_search':
        response.results = this.searchProducts(cleanQuery);
        break;
      
      case 'price_query':
        response.results = this.handlePriceQuery(cleanQuery);
        break;
      
      case 'comparison':
        response.results = this.handleComparison(cleanQuery);
        break;
      
      case 'recommendation':
        response.results = this.getPersonalizedRecommendations(userId);
        break;
      
      case 'greeting':
        response.results = this.handleGreeting();
        break;
      
      default:
        response.results = this.handleGeneral(cleanQuery);
    }

    return this.formatConversationalResponse(response);
  }

  detectIntent(query) {
    const patterns = {
      greeting: /^(hi|hello|hey|good morning|good afternoon|good evening)$/,
      inventory_check: /inventory|stock count|how many.*available|total.*stock|check.*inventory/,
      product_details: /tell me (more )?about|details about|information about|specs|specifications|features of/,
      product_selection: /select|choose|pick|i want|show me.*details|more info.*about/,
      brand_inquiry: /(show me|tell me about|what.*have) .*(apple|dell|hp|samsung|sony|asus|lenovo|microsoft|google|nintendo|meta|valve|canon|bose|corsair|framework|garmin|beats)/,
      availability_check: /do you have|is .* available|in stock|available.*stock/,
      product_search: /search|show|find|looking for|browse/,
      price_query: /price|cost|how much|expensive|cheap|budget|affordable|under|over|\$/,
      comparison: /compare|vs|versus|difference|better|which is better|contrast/,
      recommendation: /recommend|suggest|what should i|best option|advice|help me choose/
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(query)) return intent;
    }
    
    return 'general';
  }

  handleInventoryCheck(query) {
    const categoryFilter = this.extractCategory(query);
    const brandFilter = this.extractBrandName(query);
    
    let filteredProducts = this.itemsDB;

    if (categoryFilter) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase().includes(categoryFilter) ||
        product.subcategory.toLowerCase().includes(categoryFilter)
      );
    }

    if (brandFilter) {
      filteredProducts = filteredProducts.filter(product => 
        product.brand.toLowerCase() === brandFilter.toLowerCase()
      );
    }

    const availableProducts = filteredProducts.filter(product => 
      product.stock && product.stock > 0
    );

    const outOfStockProducts = filteredProducts.filter(product => 
      !product.stock || product.stock === 0
    );

    const categoryBreakdown = {};
    const brandBreakdown = {};
    const priceRanges = { under500: 0, '500to1000': 0, '1000to2000': 0, over2000: 0 };

    availableProducts.forEach(product => {
      const category = product.category;
      const brand = product.brand;
      
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      brandBreakdown[brand] = (brandBreakdown[brand] || 0) + 1;

      if (product.price < 500) priceRanges.under500++;
      else if (product.price < 1000) priceRanges['500to1000']++;
      else if (product.price < 2000) priceRanges['1000to2000']++;
      else priceRanges.over2000++;
    });

    return {
      totalAvailable: availableProducts.length,
      totalOutOfStock: outOfStockProducts.length,
      availableProducts: availableProducts,
      outOfStockProducts: outOfStockProducts,
      categoryBreakdown: categoryBreakdown,
      brandBreakdown: brandBreakdown,
      priceRanges: priceRanges,
      filterApplied: categoryFilter || brandFilter || 'all products'
    };
  }

  handleProductSelection(query) {
    const productId = this.extractProductId(query);
    const productName = this.extractProductName(query);
    
    let selectedProduct = null;

    if (productId) {
      selectedProduct = this.itemsDB.find(p => p.id === productId);
    } else if (productName) {
      const searchResults = this.productsFuse.search(productName);
      selectedProduct = searchResults.length > 0 ? searchResults[0].item : null;
    }

    if (selectedProduct) {
      return this.getDetailedProductInfo(selectedProduct);
    }

    return null;
  }

  getDetailedProductInfo(product) {
    const relatedProducts = this.getRelatedProducts(product);
    const stockStatus = this.getStockStatus(product);
    const priceAnalysis = this.getPriceAnalysis(product);

    return {
      ...product,
      stockStatus: stockStatus,
      priceAnalysis: priceAnalysis,
      relatedProducts: relatedProducts,
      availability: {
        inStock: product.stock > 0,
        quantity: product.stock,
        status: stockStatus.message
      },
      pricing: {
        current: product.price,
        original: product.originalPrice || product.price,
        discount: product.discount || 0,
        savings: product.originalPrice ? product.originalPrice - product.price : 0
      },
      specifications: product.specifications || {},
      compatibleAccessories: this.getCompatibleAccessories(product),
      userReviews: {
        rating: product.rating,
        totalReviews: product.reviews,
        summary: this.getReviewSummary(product.rating, product.reviews)
      }
    };
  }

  getStockStatus(product) {
    if (!product.stock || product.stock === 0) {
      return {
        status: 'out_of_stock',
        message: 'Currently out of stock',
        color: 'red',
        eta: 'Contact us for restock information'
      };
    } else if (product.stock <= 5) {
      return {
        status: 'low_stock',
        message: `Only ${product.stock} units remaining`,
        color: 'orange',
        urgency: 'Limited availability'
      };
    } else if (product.stock <= 10) {
      return {
        status: 'moderate_stock',
        message: `${product.stock} units available`,
        color: 'yellow',
        availability: 'In stock'
      };
    } else {
      return {
        status: 'in_stock',
        message: 'In stock and ready to ship',
        color: 'green',
        availability: 'Readily available'
      };
    }
  }

  getPriceAnalysis(product) {
    const categoryProducts = this.itemsDB.filter(p => 
      p.category === product.category && p.id !== product.id
    );
    
    const prices = categoryProducts.map(p => p.price).sort((a, b) => a - b);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const medianPrice = prices[Math.floor(prices.length / 2)];

    let pricePosition = 'average';
    if (product.price < avgPrice * 0.8) pricePosition = 'budget-friendly';
    else if (product.price > avgPrice * 1.2) pricePosition = 'premium';

    return {
      position: pricePosition,
      comparison: {
        vsAverage: ((product.price - avgPrice) / avgPrice * 100).toFixed(1),
        vsMedian: ((product.price - medianPrice) / medianPrice * 100).toFixed(1)
      },
      categoryRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        average: Math.round(avgPrice)
      }
    };
  }

  getRelatedProducts(product) {
    return this.itemsDB
      .filter(p => 
        p.id !== product.id && 
        (p.category === product.category || 
         p.brand === product.brand ||
         p.features.some(f => product.features.includes(f)))
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }

  getCompatibleAccessories(product) {
    const accessories = this.itemsDB.filter(p => 
      p.category === 'accessories' &&
      (p.use_cases.some(use => product.use_cases?.includes(use)) ||
       p.tags.some(tag => product.tags?.includes(tag)))
    );
    
    return accessories.slice(0, 3);
  }

  getReviewSummary(rating, reviewCount) {
    if (!rating || !reviewCount) return 'No reviews yet';
    
    if (rating >= 4.5) return `Excellent (${reviewCount} reviews)`;
    if (rating >= 4.0) return `Very Good (${reviewCount} reviews)`;  
    if (rating >= 3.5) return `Good (${reviewCount} reviews)`;
    if (rating >= 3.0) return `Fair (${reviewCount} reviews)`;
    return `Below Average (${reviewCount} reviews)`;
  }

  handleProductDetails(query) {
    const productName = this.extractProductName(query);
    const brandName = this.extractBrandName(query);

    let targetProduct = null;

    if (brandName && productName) {
      targetProduct = this.itemsDB.find(product => 
        product.brand.toLowerCase() === brandName.toLowerCase() &&
        product.name.toLowerCase().includes(productName.toLowerCase())
      );
    } else if (productName) {
      const searchResults = this.productsFuse.search(productName);
      targetProduct = searchResults.length > 0 ? searchResults[0].item : null;
    }

    return targetProduct ? this.getDetailedProductInfo(targetProduct) : null;
  }

  handleBrandInquiry(query) {
    const brandName = this.extractBrandName(query);
    
    if (brandName) {
      const brandProducts = this.itemsDB.filter(product => 
        product.brand.toLowerCase() === brandName.toLowerCase()
      );

      const brandStats = {
        totalProducts: brandProducts.length,
        categories: [...new Set(brandProducts.map(p => p.category))],
        priceRange: {
          min: Math.min(...brandProducts.map(p => p.price)),
          max: Math.max(...brandProducts.map(p => p.price))
        },
        avgRating: (brandProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / brandProducts.length).toFixed(1),
        inStockCount: brandProducts.filter(p => p.stock > 0).length
      };

      return {
        brand: brandName,
        products: brandProducts,
        stats: brandStats
      };
    }
    
    return [];
  }

  extractCategory(query) {
    const categories = {
      'smartphone': ['smartphone', 'phone', 'mobile'],
      'laptop': ['laptop', 'notebook', 'computer'],
      'tablet': ['tablet', 'ipad'],
      'gaming': ['gaming', 'console', 'game'],
      'headphone': ['headphone', 'headset', 'earbuds'],
      'watch': ['watch', 'smartwatch'],
      'camera': ['camera', 'photography'],
      'accessories': ['accessory', 'accessories', 'keyboard', 'mouse']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return category;
      }
    }
    return null;
  }

  extractProductId(query) {
    const idMatch = query.match(/p\d{3}/);
    return idMatch ? idMatch[0] : null;
  }

  extractBrandName(query) {
    const brands = ['apple', 'dell', 'hp', 'samsung', 'sony', 'asus', 'lenovo', 'microsoft', 'nintendo', 'google', 'meta', 'valve', 'canon', 'bose', 'corsair', 'framework', 'garmin', 'beats'];
    for (const brand of brands) {
      if (query.includes(brand.toLowerCase())) return brand;
    }
    return null;
  }

  extractProductName(query) {
    const words = query.split(' ');
    const stopWords = ['tell', 'me', 'about', 'the', 'more', 'details', 'information', 'specs', 'show', 'select', 'choose', 'want'];
    const relevantWords = words.filter(word => !stopWords.includes(word.toLowerCase()));
    return relevantWords.join(' ');
  }

  searchProducts(query) {
    const results = this.productsFuse.search(query);
    return results.slice(0, 8).map(result => ({
      ...result.item,
      relevanceScore: (1 - result.score).toFixed(2),
      matchedFields: result.matches?.map(match => match.key) || [],
      stockStatus: this.getStockStatus(result.item)
    }));
  }

  handlePriceQuery(query) {
    let products = [...this.itemsDB];
    
    const priceMatch = query.match(/(\d+)/g);
    if (priceMatch) {
      const targetPrice = parseInt(priceMatch[0]);
      products = products.filter(p => 
        Math.abs(p.price - targetPrice) <= targetPrice * 0.3
      );
    }

    if (query.includes('cheap') || query.includes('affordable') || query.includes('budget')) {
      products = products.sort((a, b) => a.price - b.price);
    } else if (query.includes('expensive') || query.includes('premium')) {
      products = products.sort((a, b) => b.price - a.price);
    }

    return products.slice(0, 6).map(product => ({
      ...product,
      stockStatus: this.getStockStatus(product),
      priceAnalysis: this.getPriceAnalysis(product)
    }));
  }

  handleComparison(query) {
    const brands = this.extractBrandName(query);
    const productNames = query.split(/vs|versus|compare/).map(s => s.trim());
    
    let compareProducts = [];
    
    if (productNames.length > 1) {
      productNames.forEach(name => {
        const results = this.productsFuse.search(name);
        if (results.length > 0) {
          compareProducts.push(results[0].item);
        }
      });
    } else if (brands) {
      const brandProducts = this.itemsDB.filter(p => 
        p.brand.toLowerCase() === brands.toLowerCase()
      );
      compareProducts = brandProducts.slice(0, 3);
    }

    return compareProducts.map(product => ({
      ...product,
      stockStatus: this.getStockStatus(product),
      priceAnalysis: this.getPriceAnalysis(product)
    }));
  }

  handleAvailabilityCheck(query) {
    const productName = this.extractProductName(query);
    const brandName = this.extractBrandName(query);

    let searchResults = [];

    if (brandName && productName) {
      searchResults = this.itemsDB.filter(product => 
        product.brand.toLowerCase().includes(brandName.toLowerCase()) &&
        product.name.toLowerCase().includes(productName.toLowerCase())
      );
    } else if (productName) {
      const fuseResults = this.productsFuse.search(productName);
      searchResults = fuseResults.map(result => result.item);
    }

    return searchResults.map(product => ({
      ...product,
      stockStatus: this.getStockStatus(product),
      availabilityInfo: {
        inStock: product.stock > 0,
        quantity: product.stock,
        canOrder: product.stock > 0 || product.preOrder
      }
    }));
  }

  getUserContext(userId) {
    if (this.userDB.userId === userId) {
      return {
        preferences: this.userDB.preferences,
        recentViews: this.userDB.behavior.recentlyViewed,
        searchHistory: this.userDB.behavior.searchHistory,
        categoryViews: this.userDB.behavior.categoryViews
      };
    }
    return null;
  }

  getPersonalizedRecommendations(userId) {
    const userContext = this.getUserContext(userId);
    if (!userContext) return this.getPopularProducts();

    const { preferences, categoryViews } = userContext;
    const topCategories = Object.entries(categoryViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    const recommendations = this.itemsDB.filter(product => {
      const matchesCategory = topCategories.some(cat => 
        product.category.toLowerCase().includes(cat)
      );
      const matchesBrand = preferences.brands.some(brand => 
        product.brand.toLowerCase() === brand.toLowerCase()
      );
      const matchesPrice = product.price >= preferences.priceRange.min && 
                          product.price <= preferences.priceRange.max;
      const inStock = product.stock > 0;

      return (matchesCategory || matchesBrand) && matchesPrice && inStock;
    });

    return recommendations
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6)
      .map(product => ({
        ...product,
        stockStatus: this.getStockStatus(product),
        recommendationReason: this.getRecommendationReason(product, userContext)
      }));
  }

  getRecommendationReason(product, userContext) {
    const reasons = [];
    
    if (userContext.preferences.brands.includes(product.brand.toLowerCase())) {
      reasons.push(`You prefer ${product.brand} products`);
    }
    
    if (userContext.categoryViews[product.category] > 0) {
      reasons.push(`Based on your interest in ${product.category}`);
    }
    
    if (product.rating >= 4.5) {
      reasons.push('Highly rated by customers');
    }
    
    if (product.discount) {
      reasons.push(`${product.discount}% discount available`);
    }

    return reasons.join(', ') || 'Popular choice';
  }

  getPopularProducts() {
    return this.itemsDB
      .filter(product => product.stock > 0)
      .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      .slice(0, 6)
      .map(product => ({
        ...product,
        stockStatus: this.getStockStatus(product)
      }));
  }

  handleGreeting() {
    const totalProducts = this.itemsDB.length;
    const inStockProducts = this.itemsDB.filter(p => p.stock > 0).length;
    const categories = [...new Set(this.itemsDB.map(p => p.category))];
    const brands = [...new Set(this.itemsDB.map(p => p.brand))];
    const featuredDeals = this.itemsDB.filter(p => p.discount > 0).slice(0, 3);

    return {
      greeting: true,
      stats: {
        totalProducts,
        inStockProducts,
        categories: categories.length,
        brands: brands.length
      },
      availableCategories: categories,
      topBrands: brands.slice(0, 8),
      featuredDeals
    };
  }

  handleGeneral(query) {
    const searchResults = this.searchProducts(query);
    
    if (searchResults.length === 0) {
      return this.getPopularProducts();
    }
    
    return searchResults;
  }

  formatConversationalResponse(response) {
    const { intent, results, userContext } = response;
    let message = '';
    let followUp = '';

    switch (intent) {
      case 'greeting':
        message = `Hello! Welcome to our tech store! 🎉\n\n`;
        message += `📊 Current inventory:\n`;  
        message += `• ${results.stats.inStockProducts}/${results.stats.totalProducts} products in stock\n`;
        message += `• ${results.stats.categories} categories available\n`;
        message += `• ${results.stats.brands} brands to choose from\n\n`;
        
        if (results.featuredDeals.length > 0) {
          message += `🔥 Featured deals:\n`;
          results.featuredDeals.forEach(deal => {
            message += `• ${deal.name} - ${deal.discount}% off ($${deal.price})\n`;
          });
        }
        
        followUp = 'What can I help you find today? You can ask about inventory, specific products, or get personalized recommendations!';
        break;

      case 'inventory_check':
        message = `📦 Inventory Report - ${results.filterApplied}\n\n`;
        message += `✅ Available: ${results.totalAvailable} products\n`;
        message += `❌ Out of stock: ${results.totalOutOfStock} products\n\n`;
        
        if (Object.keys(results.categoryBreakdown).length > 0) {
          message += `📱 By category:\n`;
          Object.entries(results.categoryBreakdown).forEach(([category, count]) => {
            message += `• ${category}: ${count} available\n`;
          });
          message += `\n`;
        }
        
        if (Object.keys(results.brandBreakdown).length > 0) {
          message += `🏢 By brand:\n`;
          Object.entries(results.brandBreakdown).slice(0, 5).forEach(([brand, count]) => {
            message += `• ${brand}: ${count} available\n`;
          });
        }
        
        followUp = 'Which category or brand interests you? I can show you specific products and their availability.';
        break;

      case 'product_selection':
      case 'product_details':
        if (results && results.name) {
          message = `📱 ${results.name} by ${results.brand}\n\n`;
          message += `💰 Price: $${results.pricing.current.toLocaleString()}`;
          if (results.pricing.discount > 0) {
            message += ` (${results.pricing.discount}% off - Save $${results.pricing.savings})`;
          }
          message += `\n⭐ Rating: ${results.userReviews.rating}/5 (${results.userReviews.summary})\n`;
          message += `📦 ${results.stockStatus.message}\n\n`;
          
          message += `🔧 Key features:\n`;
          if (results.features && results.features.length > 0) {
            results.features.slice(0, 5).forEach(feature => {
              message += `• ${feature.replace(/_/g, ' ')}\n`;
            });
          }
          
          if (results.specifications && Object.keys(results.specifications).length > 0) {
            message += `\n📋 Specifications:\n`;
            Object.entries(results.specifications).slice(0, 4).forEach(([key, value]) => {
              message += `• ${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
            });
          }
          
          if (results.priceAnalysis) {
            message += `\n💹 Price analysis: ${results.priceAnalysis.position} pricing`;
            message += ` (${results.priceAnalysis.comparison.vsAverage > 0 ? '+' : ''}${results.priceAnalysis.comparison.vsAverage}% vs category average)\n`;
          }
          
          followUp = `Would you like to see compatible accessories, compare with similar products, or do you have any specific questions about this ${results.category}?`;
        } else {
          message = `I couldn't find detailed information about that specific product. Let me show you some alternatives.`;
          const alternatives = this.getPopularProducts().slice(0, 3);
          if (alternatives.length > 0) {
            message += `\n\nHere are some popular options:\n`;
            alternatives.forEach((product, index) => {
              message += `${index + 1}. ${product.name} - $${product.price.toLocaleString()} (${product.stockStatus.message})\n`;
            });
          }
          followUp = `Which product would you like to know more about?`;
        }
        break;

      case 'brand_inquiry':
        if (results && results.products && results.products.length > 0) {
          message = `🏢 ${results.brand.toUpperCase()} Products Collection\n\n`;
          message += `📊 Brand overview:\n`;
          message += `• ${results.stats.totalProducts} total products\n`;
          message += `• ${results.stats.inStockCount} currently in stock\n`;
          message += `• Categories: ${results.stats.categories.join(', ')}\n`;
          message += `• Price range: $${results.stats.priceRange.min.toLocaleString()} - $${results.stats.priceRange.max.toLocaleString()}\n`;
          message += `• Average rating: ${results.stats.avgRating}/5\n\n`;
          
          message += `🛍️ Available products:\n`;
          results.products.slice(0, 5).forEach((product, index) => {
            const stockEmoji = product.stock > 0 ? '✅' : '❌';
            message += `${index + 1}. ${product.name} - $${product.price.toLocaleString()} ${stockEmoji}\n`;
          });
          
          followUp = `Which ${results.brand} product interests you most? I can provide detailed specifications and availability.`;
        } else {
          message = `We don't currently have products from that brand in stock. Would you like me to suggest similar alternatives from other brands?`;
          followUp = `I can recommend products with similar features from our available brands.`;
        }
        break;

      case 'availability_check':
        if (results && results.length > 0) {
          message = `🔍 Availability Check Results\n\n`;
          results.slice(0, 4).forEach((product, index) => {
            const statusEmoji = product.stockStatus.status === 'in_stock' ? '✅' : 
                               product.stockStatus.status === 'low_stock' ? '⚠️' : '❌';
            message += `${index + 1}. ${product.name} ${statusEmoji}\n`;
            message += `   💰 $${product.price.toLocaleString()} | ${product.stockStatus.message}\n\n`;
          });
          
          followUp = `Which product would you like detailed information about? I can also suggest alternatives if something is out of stock.`;
        } else {
          message = `❌ Sorry, those items are currently out of stock. Let me suggest some similar alternatives that are available.`;
          const alternatives = this.getPopularProducts().slice(0, 3);
          if (alternatives.length > 0) {
            message += `\n\n✅ Available alternatives:\n`;
            alternatives.forEach((product, index) => {
              message += `${index + 1}. ${product.name} - $${product.price.toLocaleString()}\n`;
            });
          }
          followUp = `Would you like more details about any of these alternatives?`;
        }
        break;

      case 'product_search':
        if (results && results.length > 0) {
          message = `🔍 Search Results (${results.length} products found)\n\n`;
          results.slice(0, 4).forEach((product, index) => {
            const stockEmoji = product.stockStatus.status === 'in_stock' ? '✅' : 
                               product.stockStatus.status === 'low_stock' ? '⚠️' : '❌';
            message += `${index + 1}. ${product.name} - ${product.brand} ${stockEmoji}\n`;
            message += `   💰 $${product.price.toLocaleString()} | ⭐ ${product.rating}/5 | ${product.stockStatus.message}\n`;
            message += `   🎯 Relevance: ${(product.relevanceScore * 100).toFixed(0)}%\n\n`;
          });
          
          followUp = `Which product catches your interest? I can provide detailed specifications, compare options, or check similar products.`;
        } else {
          message = `🔍 No exact matches found. Let me suggest some popular products that might interest you.`;
          const suggestions = this.getPopularProducts().slice(0, 3);
          if (suggestions.length > 0) {
            message += `\n\n💡 Popular suggestions:\n`;
            suggestions.forEach((product, index) => {
              message += `${index + 1}. ${product.name} - ${product.price.toLocaleString()}\n`;
            });
          }
          followUp = `Try refining your search or ask me about specific categories, brands, or features.`;
        }
        break;

      case 'price_query':
        if (results && results.length > 0) {
          message = `💰 Price-based Product Results\n\n`;
          results.slice(0, 4).forEach((product, index) => {
            const priceLabel = product.priceAnalysis.position === 'budget-friendly' ? '💚 Budget' :
                              product.priceAnalysis.position === 'premium' ? '💎 Premium' : '💙 Mid-range';
            message += `${index + 1}. ${product.name} ${priceLabel}\n`;
            message += `   💰 ${product.price.toLocaleString()}`;
            if (product.discount > 0) {
              message += ` (${product.discount}% off)`;
            }
            message += ` | ⭐ ${product.rating}/5\n`;
            message += `   📦 ${product.stockStatus.message}\n\n`;
          });
          
          followUp = `Which price range works best for you? I can filter results further or suggest financing options for premium products.`;
        } else {
          message = `💰 No products found in that specific price range. Let me show you our best value options across different budgets.`;
          const priceOptions = this.getPopularProducts().slice(0, 4);
          if (priceOptions.length > 0) {
            message += `\n\n💡 Value options:\n`;
            priceOptions.forEach((product, index) => {
              message += `${index + 1}. ${product.name} - ${product.price.toLocaleString()}\n`;
            });
          }
          followUp = `What's your budget range? I can find the best options within your price limit.`;
        }
        break;

      case 'comparison':
        if (results && results.length > 1) {
          message = `⚖️ Product Comparison\n\n`;
          results.forEach((product, index) => {
            message += `${index + 1}. ${product.name} - ${product.brand}\n`;
            message += `   💰 Price: ${product.price.toLocaleString()}`;
            if (product.discount > 0) {
              message += ` (${product.discount}% off)`;
            }
            message += `\n   ⭐ Rating: ${product.rating}/5 (${product.reviews} reviews)\n`;
            message += `   📦 ${product.stockStatus.message}\n`;
            message += `   🏷️ ${product.priceAnalysis.position} pricing\n\n`;
          });
          
          const bestRated = results.reduce((prev, current) => (prev.rating > current.rating) ? prev : current);
          const mostAffordable = results.reduce((prev, current) => (prev.price < current.price) ? prev : current);
          
          message += `🏆 Quick comparison:\n`;
          message += `• Best rated: ${bestRated.name} (${bestRated.rating}/5)\n`;
          message += `• Most affordable: ${mostAffordable.name} (${mostAffordable.price.toLocaleString()})\n`;
          
          followUp = `Which aspect is most important to you: price, features, or brand reputation? I can provide more detailed comparisons.`;
        } else {
          message = `⚖️ I need at least two products to compare. Please specify which products you'd like me to compare.`;
          followUp = `Try asking: "Compare iPhone 15 Pro vs Samsung Galaxy S24" or mention specific product names.`;
        }
        break;

      case 'recommendation':
        if (results && results.length > 0) {
          message = userContext ? 
            `🎯 Personalized Recommendations\n\n` : 
            `⭐ Popular Product Recommendations\n\n`;
            
          results.slice(0, 4).forEach((product, index) => {
            message += `${index + 1}. ${product.name} - ${product.brand}\n`;
            message += `   💰 ${product.price.toLocaleString()} | ⭐ ${product.rating}/5\n`;
            message += `   📦 ${product.stockStatus.message}\n`;
            if (product.recommendationReason) {
              message += `   💡 ${product.recommendationReason}\n`;
            }
            message += `\n`;
          });
          
          followUp = `Any of these recommendations interest you? I can provide detailed information or suggest alternatives based on your specific needs.`;
        } else {
          message = `🤔 To give you better recommendations, could you tell me what type of product you're looking for and your budget range?`;
          followUp = `For example: "I need a laptop under $1500 for work" or "Looking for gaming headphones around $200".`;
        }
        break;

      default:
        if (results && results.length > 0) {
          message = `🔍 Here's what I found:\n\n`;
          results.slice(0, 3).forEach((product, index) => {
            message += `${index + 1}. ${product.name} - ${product.brand}\n`;
            message += `   💰 ${product.price.toLocaleString()} | ⭐ ${product.rating}/5\n`;
            if (product.stockStatus) {
              message += `   📦 ${product.stockStatus.message}\n`;
            }
            message += `\n`;
          });
          followUp = `Would you like more details about any of these products, or are you looking for something more specific?`;
        } else {
          message = `👋 I'm here to help you find the perfect tech product! I can assist with:\n\n`;
          message += `• 📦 Check inventory and stock levels\n`;
          message += `• 📱 Product details and specifications\n`;
          message += `• 💰 Price comparisons and deals\n`;
          message += `• 🎯 Personalized recommendations\n`;
          message += `• ⚖️ Product comparisons\n`;
          message += `• 🔍 Search by brand, category, or features\n`;
          
          followUp = `What are you shopping for today? Try asking about specific products, brands, or your tech needs!`;
        }
    }

    return {
      success: true,
      intent,
      message,
      followUp,
      results: Array.isArray(results) ? results : [results],
      count: Array.isArray(results) ? results.length : (results ? 1 : 0),
      conversational: true,
      userContext: userContext ? {
        hasPreferences: true,
        topCategories: userContext.categoryViews ? Object.keys(userContext.categoryViews).slice(0, 3) : []
      } : null,
      quickActions: this.generateQuickActions(intent, results)
    };
  }

  generateQuickActions(intent, results) {
    const actions = {
      greeting: [
        "Show inventory status",
        "What do you recommend?",
        "Browse smartphones",
        "Check gaming laptops"
      ],
      inventory_check: [
        "Show available laptops", 
        "Check smartphone stock",
        "Browse by brand",
        "Show deals"
      ],
      product_details: [
        "Compare similar products",
        "Check accessories",
        "View specifications",
        "Add to wishlist"
      ],
      product_search: [
        "Filter by price",
        "Sort by rating",
        "Compare top 3",
        "Show alternatives"
      ],
      availability_check: [
        "Check restock date",
        "Show alternatives",
        "Set stock alert",
        "View similar items"
      ],
      price_query: [
        "Show budget options",
        "Check for deals",
        "Compare prices",
        "View financing"
      ],
      recommendation: [
        "Tell me more about #1",
        "Compare top picks",
        "Show more options",
        "Filter by budget"
      ]
    };

    return actions[intent] || [
      "Search products",
      "Check inventory", 
      "Get recommendations",
      "Browse categories"
    ];
  }

  analyzeSentiment(query) {
    const positive = /excellent|good|great|perfect|amazing|love|like|awesome|fantastic/;
    const negative = /bad|terrible|horrible|awful|hate|dislike|worst|disappointing/;
    const urgent = /urgent|asap|immediately|now|quick|fast/;
    
    let sentiment = 'neutral';
    if (positive.test(query)) sentiment = 'positive';
    if (negative.test(query)) sentiment = 'negative';
    
    return {
      sentiment,
      isUrgent: urgent.test(query),
      confidence: 0.8
    };
  }

  getProductRecommendationScore(product, userContext) {
    let score = product.rating * 20;
    
    if (userContext) {
      if (userContext.preferences.brands.includes(product.brand.toLowerCase())) {
        score += 15;
      }
      
      if (userContext.categoryViews[product.category] > 0) {
        score += 10;
      }
      
      const priceMatch = product.price >= userContext.preferences.priceRange.min && 
                        product.price <= userContext.preferences.priceRange.max;
      if (priceMatch) score += 20;
    }
    
    if (product.stock > 0) score += 10;
    if (product.discount > 0) score += 5;
    if (product.isNew) score += 5;
    
    return Math.min(score, 100);
  }

  validateInventoryData() {
    const issues = [];
    
    this.itemsDB.forEach(product => {
      if (!product.id || !product.name || !product.brand) {
        issues.push(`Product missing required fields: ${product.id || 'unknown'}`);
      }
      
      if (typeof product.price !== 'number' || product.price <= 0) {
        issues.push(`Invalid price for product: ${product.name}`);
      }
      
      if (product.stock !== undefined && (typeof product.stock !== 'number' || product.stock < 0)) {
        issues.push(`Invalid stock quantity for product: ${product.name}`);
      }
      
      if (product.rating !== undefined && (product.rating < 0 || product.rating > 5)) {
        issues.push(`Invalid rating for product: ${product.name}`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      totalProducts: this.itemsDB.length,
      validProducts: this.itemsDB.length - issues.length
    };
  }

  getInventoryStats() {
    const total = this.itemsDB.length;
    const inStock = this.itemsDB.filter(p => p.stock > 0).length;
    const outOfStock = this.itemsDB.filter(p => !p.stock || p.stock === 0).length;
    const lowStock = this.itemsDB.filter(p => p.stock > 0 && p.stock <= 5).length;
    
    const totalValue = this.itemsDB.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
    const avgPrice = this.itemsDB.reduce((sum, p) => sum + p.price, 0) / total;
    
    const categoryStats = {};
    const brandStats = {};
    
    this.itemsDB.forEach(product => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
      brandStats[product.brand] = (brandStats[product.brand] || 0) + 1;
    });

    return {
      inventory: {
        total,
        inStock,
        outOfStock,
        lowStock,
        stockRate: ((inStock / total) * 100).toFixed(1)
      },
      financial: {
        totalValue: Math.round(totalValue),
        averagePrice: Math.round(avgPrice),
        totalRevenuePotential: totalValue
      },
      distribution: {
        categories: categoryStats,
        brands: brandStats,
        topCategory: Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0],
        topBrand: Object.entries(brandStats).sort(([,a], [,b]) => b - a)[0]
      }
    };
  }
}

module.exports = EnhancedAISearchService;