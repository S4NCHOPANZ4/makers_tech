# 🛒 AI-Powered E-commerce Dashboard & ChatBot

This project is a web platform that combines artificial intelligence and data visualization to enhance the user shopping experience and e-commerce administration. It is built with **React** on the frontend and **Express.js** on the backend.

## 🚀 Key Features

### 🧠 Smart ChatBot
An interactive assistant that:
- Answers questions about inventory and products.
- Recommends personalized items.
- Detects user intent and adapts responses accordingly.

### 📊 Admin Dashboard
An analytics panel that provides:
- Insights into users, sales, and product performance.
- Data visualizations by category, location, payment method, and more.
- Low stock alerts for inventory management.

### 🎯 Personalized Recommendation System
Generates product suggestions based on:
- User preferences, browsing history, and purchase behavior.

## 🛠️ Tech Stack

- **Frontend**: React + TailwindCSS + Recharts
- **Backend**: Express.js + MongoDB (Mongoose)
- **AI/ML**: Intent-based logic and custom scoring algorithm
- **Others**: Session management, rate limiting, security middlewares

## 📂 Project Structure (Backend)

- `server.js` – Main entry point with Express server setup
- `routes/` – Organized API endpoints for users, AI, and data
- `middleware/` – Session management, data fetching, and AI integration
- `config/` – Environment variables and optional DB config
- `package.json` – Dependency management and scripts

Run the server with:
```bash
npm install
npm run dev
