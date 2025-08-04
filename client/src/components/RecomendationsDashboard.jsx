import React, { useEffect, useState } from 'react'
import { ShoppingCart, Heart, Star, Eye, TrendingUp, User, Filter } from 'lucide-react';
import { fetchUsersData } from '../middleware/fetchUserData';
import { fetchItemsData } from '../middleware/fetchItemData';

const RecomendationsDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [userDataResponse, productsDataResponse] = await Promise.all([
          fetchUsersData(),
          fetchItemsData()
        ]);
        
        setUserData(userDataResponse);
        setProducts(productsDataResponse);
        
        console.log('User Data:', userDataResponse);
        console.log('Products Data:', productsDataResponse);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateRecommendations = () => {
    if (!userData || !products) return [];
    
    const { preferences, behavior } = userData;
    
    const scoredProducts = products.map(product => {
      let score = 0;
      
      if (preferences.categories.includes(product.category)) score += 30;
      if (preferences.brands.includes(product.brand)) score += 25;
      if (product.price >= preferences.priceRange.min && product.price <= preferences.priceRange.max) score += 20;
      
      const matchingFeatures = product.features.filter(feature => preferences.features.includes(feature));
      score += matchingFeatures.length * 15;
      
      const categoryViewWeight = behavior.categoryViews[product.category] || 0;
      score += categoryViewWeight * 0.5;
      
      if (product.isNew) score += 10;
      if (product.discount) score += product.discount;
      
      const alreadyPurchased = behavior.purchases.some(p => p.productId === product.id);
      if (alreadyPurchased) score -= 50;
      
      score += product.rating * 5;
      
      return { ...product, recommendationScore: score };
    });
    
    return scoredProducts
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 4);
  };

  const getRecentlyViewed = () => {
    if (!userData || !products) return [];
    
    const recentIds = userData.behavior.recentlyViewed.map(rv => rv.productId);
    return products.filter(p => recentIds.includes(p.id)).slice(0, 4);
  };

  const getNewProducts = () => {
    if (!products) return [];
    
    return products.filter(p => p.isNew).slice(0, 4);
  };

  const handleProductClick = (productId) => {
    if (!products) return;
    
    const newView = {
      productId,
      timestamp: new Date().toISOString(),
      category: products.find(p => p.id === productId)?.category
    };
    
    setUserData(prev => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        recentlyViewed: [newView, ...prev.behavior.recentlyViewed.slice(0, 9)]
      }
    }));
  };

  const ProductCard = ({ product, showScore = false }) => (
    <div 
      className="bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer transform hover:-translate-y-1"
      onClick={() => handleProductClick(product.id)}
    >
      <div className="relative">
        <div className="text-6xl mb-4 text-center">{product.image}</div>
        {product.isNew && (
          <span className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            NEW
          </span>
        )}
        {product.discount && (
          <span className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </span>
        )}
      </div>
      
      <h3 className="font-bold text-lg mb-2 text-gray-200">{product.name}</h3>
      <p className="text-blue-300 font-semibold mb-2">{product.brand}</p>
      
      <div className="flex items-center mb-3">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="ml-1 text-sm text-gray-200">{product.rating} ({product.reviews})</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-gray-200">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through ml-2">${product.originalPrice}</span>
          )}
        </div>
      </div>
      
      {showScore && (
        <div className="mb-3 text-xs text-blue-400">
          Relevance: {Math.round(product.recommendationScore)}%
        </div>
      )}
      

    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading data...</p>
          <p className="text-gray-500 text-sm">Fetching user and product information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-red-400 text-xl mb-2">Error loading data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData || !products) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">📦</div>
          <h2 className="text-yellow-400 text-xl mb-2">Data not available</h2>
          <p className="text-gray-400">Could not load necessary data</p>
        </div>
      </div>
    );
  }

  const recommendations = generateRecommendations();
  const recentlyViewed = getRecentlyViewed();
  const newProducts = getNewProducts();

  return (
    <div className="min-h-screen ">
      <div className="px-4 py-8">
        <div className="bg-gray-800 text-gray-200 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Your Shopping Profile
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Favorite Categories:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {userData.preferences.categories.map(cat => (
                  <span key={cat} className="bg-blue-600 text-blue-100 px-2 py-1 rounded-full text-xs">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">Preferred Brands:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {userData.preferences.brands.map(brand => (
                  <span key={brand} className="bg-green-600 text-green-100 px-2 py-1 rounded-full text-xs">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">Price Range:</p>
              <div className="text-gray-300 mt-1">
                ${userData.preferences.priceRange.min} - ${userData.preferences.priceRange.max}
              </div>
            </div>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-200">Recommended for You</h2>
            <span className="bg-purple-600 text-purple-100 px-3 py-1 rounded-full text-sm">
              Based on your preferences
            </span>
          </div>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(product => (
                <ProductCard key={product.id} product={product} showScore={true} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recommendations available</p>
          )}
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-gray-200">New Arrivals</h2>
            <span className="bg-green-600 text-green-100 px-3 py-1 rounded-full text-sm">
              Just in
            </span>
          </div>
          {newProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No new products available</p>
          )}
        </section>

        {recentlyViewed.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-200">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default RecomendationsDashboard;