import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  Package,
  CreditCard,
  Calendar,
  DollarSign,
  Filter,
  Download,
} from "lucide-react";
import { fetchAdminData } from "../middleware/fetchAdminData";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminData();
        setDashboardData(data);
        console.log('Admin Data:', data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-200">{value}</p>
          {change && (
            <p
              className={`text-sm ${
                change > 0 ? "text-green-600" : "text-red-600"
              } flex items-center gap-1`}
            >
              <TrendingUp className="w-4 h-4" />
              {change > 0 ? "+" : ""}
              {change}%
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading dashboard...</p>
          <p className="text-gray-500 text-sm">Fetching analytics data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-red-400 text-xl mb-2">Error loading dashboard</h2>
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

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">📊</div>
          <h2 className="text-yellow-400 text-xl mb-2">Dashboard data not available</h2>
          <p className="text-gray-400">Could not load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-8 bg-gray-800 p-1 rounded-full w-fit">
          {[
            { id: "overview", label: "General", icon: TrendingUp },
            { id: "products", label: "Products", icon: Package },
            { id: "users", label: "Users", icon: Users },
            { id: "sales", label: "Sales", icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-gray-600 shadow-sm text-white"
                  : "text-gray-600 hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Users"
                value={formatNumber(dashboardData.overview.totalUsers)}
                change={8.2}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Total Sales"
                value={formatCurrency(dashboardData.overview.totalSales)}
                change={dashboardData.overview.salesGrowth}
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="Orders"
                value={formatNumber(dashboardData.overview.totalOrders)}
                change={5.7}
                icon={ShoppingCart}
                color="purple"
              />
              <MetricCard
                title="Average Value"
                value={formatCurrency(dashboardData.overview.averageOrderValue)}
                change={3.2}
                icon={TrendingUp}
                color="orange"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg font-bold mb-4 flex items-center gap-2 text-green-200">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Monthly Revenue
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.sales.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatNumber} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-200">
                  <Users className="w-5 h-5 text-blue-600" />
                  New Users
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.users.newUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).getDate()}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <p className="text-lg text-gray-200 font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Best-Selling Products
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 text-gray-200">Product</th>
                      <th className="text-left py-3 text-gray-200">Category</th>
                      <th className="text-left py-3 text-gray-200">Sold</th>
                      <th className="text-left py-3 text-gray-200">Views</th>
                      <th className="text-left py-3 text-gray-200">Stock</th>
                      <th className="text-left py-3 text-gray-200">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.products
                      .sort((a, b) => b.sold - a.sold)
                      .slice(0, 6)
                      .map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-700 text-gray-300"
                        >
                          <td className="py-3 pl-2">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-200">
                                {product.brand}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 font-medium">{product.sold}</td>
                          <td className="py-3">
                            {formatNumber(product.views)}
                          </td>
                          <td className="py-3">
                            <p
                              className={`px-2 py-1 rounded text-sm ${
                                product.stock < 20
                                  ? "font-semibold text-red-400"
                                  : "font-semibold  text-green-400"
                              }`}
                            >
                              {product.stock}
                            </p>
                          </td>
                          <td className="py-3 font-medium">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-200">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Most Viewed Products
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dashboardData.products
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 6)}
                  >
                    <CartesianGrid strokeDasharray="0 0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tickFormatter={formatNumber} />
                    <Tooltip
                      formatter={(value) => [formatNumber(value), "Views"]}
                    />
                    <Bar dataKey="views" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-200">
                  Stock by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.inventory.categoryStock}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) =>
                        `${category} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#ffffff"
                      dataKey="stock"
                    >
                      {dashboardData.inventory.categoryStock.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-200">
                  <Users className="w-5 h-5 text-blue-600" />
                  Age Distribution
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.users.demographics.ageGroups}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.users.demographics.ageGroups.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatNumber(value), "Users"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg font-bold mb-4 text-gray-200">
                  Users by City
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.users.demographics.locations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis tickFormatter={formatNumber} />
                    <Tooltip
                      formatter={(value) => [formatNumber(value), "Users"]}
                    />
                    <Bar dataKey="users" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sales" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-200">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payment Methods
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.sales.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percentage }) =>
                        `${method} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dashboardData.sales.paymentMethods.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatNumber(value),
                        "Transactions",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg font-bold mb-4 text-gray-200">
                  Monthly Orders
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.sales.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <p className="text-lg font-bold mb-4 text-gray-200">
                Payment Method Details
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-200 border-b">
                      <th className="text-left py-3">Method</th>
                      <th className="text-left py-3">Transactions</th>
                      <th className="text-left py-3">Percentage</th>
                      <th className="text-left py-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.sales.paymentMethods.map((method, index) => (
                      <tr
                        key={method.value}
                        className="text-gray-200 hover:bg-gray-700"
                      >
                        <td className="py-3 font-medium">{method.method}</td>
                        <td className="py-3">{formatNumber(method.count)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-600 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${method.percentage}%`,
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              />
                            </div>
                            <span className="text-sm">
                              {method.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />+
                            {Math.floor(Math.random() * 10)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {dashboardData.inventory && dashboardData.inventory.lowStockAlerts && dashboardData.inventory.lowStockAlerts.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 my-3">
            <p className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Low Stock Alerts
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {dashboardData.inventory.lowStockAlerts.map((alert) => (
                <div key={alert.id} className="bg-gray-600 rounded-lg p-4">
                  <div className="font-medium text-red-400">{alert.name}</div>
                  <div className="text-sm text-red-300">
                    Current Stock: {alert.stock} (Minimum: {alert.threshold})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;