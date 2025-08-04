const BASE_URL = 'http://localhost:3030';

export const sendMessageToAI = async (message, userId = 'user_001') => {
  try {
    const response = await fetch(`${BASE_URL}/ai/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        query: message,
        userId: userId
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return formatAIResponse(data);

  } catch (error) {
    console.error('Error sending message to AI:', error);
    return {
      success: false,
      message: "Sorry, I couldn't process your message right now. Could you try again?",
      error: error.message
    };
  }
};

export const getRecommendations = async (userId = 'user_001', limit = 4) => {
  try {
    const response = await fetch(`${BASE_URL}/ai/recommendations/${userId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    return formatRecommendationsResponse(data);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      success: false,
      message: "I couldn't get recommendations right now.",
      error: error.message
    };
  }
};

export const compareProducts = async (productIds) => {
  try {
    const response = await fetch(`${BASE_URL}/ai/products/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        productIds: productIds
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    return formatComparisonResponse(data);

  } catch (error) {
    console.error('Error comparing products:', error);
    return {
      success: false,
      message: "I couldn't compare products right now.",
      error: error.message
    };
  }
};

const formatAIResponse = (data) => {
  if (!data.success) {
    return {
      success: false,
      message: data.error || "I couldn't process your query."
    };
  }

  let responseMessage = data.message || "I've processed your query.";
  
  if (data.followUp) {
    responseMessage += `\n\n${data.followUp}`;
  }

  return {
    success: true,
    message: responseMessage,
    intent: data.intent,
    productsCount: data.count || 0,
    conversational: data.conversational || false
  };
};

const formatRecommendationsResponse = (data) => {
  if (!data.success || !data.results || data.results.length === 0) {
    return {
      success: false,
      message: "I couldn't get recommendations right now."
    };
  }

  let message = data.personalized 
    ? "Based on your history, I recommend:\n\n" 
    : "Here are some popular products:\n\n";

  data.results.forEach((product, index) => {
    message += `${index + 1}. ${product.name} - ${product.brand}\n`;
    message += `   💰 $${product.price?.toLocaleString() || 'N/A'}`;
    if (product.discount) {
      message += ` (${product.discount}% off)`;
    }
    message += `\n   ⭐ ${product.rating || 'N/A'}/5\n\n`;
  });

  return {
    success: true,
    message: message,
    personalized: data.personalized
  };
};

const formatComparisonResponse = (data) => {
  if (!data.success || !data.data) {
    return {
      success: false,
      message: "I couldn't make the requested comparison."
    };
  }

  const { products, analysis } = data.data;
  let message = "Product comparison:\n\n";

  products.forEach((product, index) => {
    message += `${index + 1}. ${product.name}\n`;
    message += `• Price: $${product.price?.toLocaleString() || 'N/A'}\n`;
    message += `• Rating: ${product.rating || 'N/A'}/5\n`;
    message += `• Brand: ${product.brand}\n`;
    if (product.features) {
      message += `• Features: ${product.features.join(', ')}\n`;
    }
    message += "\n";
  });

  if (analysis) {
    message += "Analysis:\n";
    if (analysis.bestRated) {
      message += `🏆 Best rated: ${analysis.bestRated.name}\n`;
    }
    if (analysis.mostAffordable) {
      message += `💰 Most affordable: ${analysis.mostAffordable.name}\n`;
    }
    if (analysis.commonFeatures && analysis.commonFeatures.length > 0) {
      message += `🔄 Common features: ${analysis.commonFeatures.join(', ')}\n`;
    }
  }

  return {
    success: true,
    message: message
  };
};

export const detectUserIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(lowerMessage)) {
    return 'greeting';
  }
  if (lowerMessage.includes('how many') || lowerMessage.includes('count') || lowerMessage.includes('available')) {
    return 'inventory_count';
  }
  if (lowerMessage.includes('tell me about') || lowerMessage.includes('details about') || lowerMessage.includes('more about')) {
    return 'product_details';
  }
  if (lowerMessage.includes('do you have') || lowerMessage.includes('is') && lowerMessage.includes('available')) {
    return 'availability_check';
  }
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return 'recommendation';
  }
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs')) {
    return 'comparison';
  }
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('cheap')) {
    return 'price_query';
  }
  if (lowerMessage.includes('search') || lowerMessage.includes('show') || lowerMessage.includes('find')) {
    return 'product_search';
  }
  
  return 'general';
};

export const getQuickReplies = (lastIntent) => {
  const quickReplies = {
    greeting: [
      "How many computers are available?",
      "Show me smartphones",
      "What do you recommend?"
    ],
    inventory_count: [
      "Tell me about the Dell computer",
      "Show me Apple products",
      "What's the cheapest option?"
    ],
    product_details: [
      "Do you have other brands?",
      "Compare with similar products",
      "What's the price?"
    ],
    availability_check: [
      "Tell me more about it",
      "Show me alternatives",
      "Is it in my budget?"
    ],
    product_search: [
      "Tell me more details",
      "Compare prices",
      "Show similar products"
    ],
    price_query: [
      "Show me cheapest options",
      "Any discounts available?",
      "Compare different brands"
    ],
    recommendation: [
      "Tell me more about option 1",
      "Compare these products",
      "Any other recommendations?"
    ],
    general: [
      "How many products available?",
      "What do you recommend?",
      "Show me deals"
    ]
  };

  return quickReplies[lastIntent] || quickReplies.general;
};