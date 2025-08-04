import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ShoppingCart, Package } from "lucide-react";
import NavBar from "./NavBar";
import { sendMessageToAI, getRecommendations, detectUserIntent, getQuickReplies } from "../middleware/fetchChatService.js";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [lastIntent, setLastIntent] = useState('greeting');
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeChat = () => {
      const welcomeMessage = {
        id: Date.now(),
        text: "Hello! Welcome to TechStore! 👋\n\nI'm your personal shopping assistant. I can help you:\n\n• Check our current inventory\n• Get detailed product information\n• Compare different products\n• Find the best deals for you\n\nHow can I assist you today?",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
        isWelcome: true
      };

      setMessages([welcomeMessage]);
      setQuickReplies(getQuickReplies('greeting'));
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (messageText = inputValue) => {
    if (messageText.trim() === "") return;

    if (!conversationStarted) {
      setConversationStarted(true);
    }

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const intent = detectUserIntent(messageText);
    setLastIntent(intent);

    try {
      const aiResponse = await sendMessageToAI(messageText, 'user_001');
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: aiResponse.message,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          intent: aiResponse.intent,
          success: aiResponse.success,
          isConversational: aiResponse.conversational
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        
        setQuickReplies(getQuickReplies(aiResponse.intent || intent));
      }, 800 + Math.random() * 1200);

    } catch (error) {
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          text: "I apologize, but I'm having trouble processing your request right now. Could you please try asking again? I'm here to help! 😊",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };

        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (message) => {
    if (message.isWelcome) return <Sparkles className="w-4 h-4 text-white" />;
    if (message.intent === 'inventory_count') return <Package className="w-4 h-4 text-white" />;
    if (message.intent === 'product_details' || message.intent === 'product_search') return <ShoppingCart className="w-4 h-4 text-white" />;
    return <Bot className="w-4 h-4 text-white" />;
  };

  return (
    <div className="flex-1 flex flex-col h-screen ">
      <NavBar />

      <div className="flex-1 overflow-y-auto scrollable p-6 max-h-[calc(100vh-180px)]">
        {!conversationStarted ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Your Personal Shopping Assistant
              </h2>
              <p className="text-gray-600 leading-relaxed">
                I'm here to help you find exactly what you need! Ask me about our inventory, 
                get product details, or let me recommend the perfect item for you.
              </p>
              <div className="mt-6 text-sm text-gray-500">
                💬 Try asking: "How many laptops do you have?"
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-6 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}>
                  
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.sender === "bot" 
                      ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                      : "bg-gray-800"
                  }`}>
                    {message.sender === "bot" ? (
                      getMessageIcon(message)
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div className={`relative max-w-lg ${
                    message.sender === "user" ? "ml-3" : "mr-3"
                  }`}>
                    <div
                      className={`p-4 rounded-2xl font-medium shadow-sm ${
                        message.sender === "user"
                          ? "bg-gray-800 text-white rounded-br-md"
                          : message.isError
                          ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md"
                          : message.isWelcome
                          ? "bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 border border-blue-200 rounded-bl-md"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {message.text}
                      </div>
                    </div>
                    
                    <div className={`text-xs text-gray-400 mt-2 flex items-center ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}>
                      {message.sender === "bot" && !message.isError && (
                        <>
                          <Bot className="w-3 h-3 mr-1" />
                          <p>AI Assistant</p>
                          <p className="mx-2">•</p>
                        </>
                      )}
                      <p>{message.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <p className="text-sm text-gray-500">Thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>



      <div className=" ">
        <div className="flex justify-center items-center space-x-4">
          <div className="flex-1 ">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border  rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-500 resize-none min-h-[50px] max-h-32 scrollable transition-all duration-200"
              placeholder="Ask me: 'How many computers are available?' or 'Tell me about the Dell laptop'"
              disabled={isTyping}
              rows={1}
            />

          </div>
          
          <button
            onClick={() => handleSendMessage()}
            className={`flex items-center justify-center w-12 h-12 rounded-xl text-white font-medium transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed transform  ${
              isTyping 
                ? 'bg-gray-400 cursor-not-allowed' 
                : inputValue.trim()
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 '
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!inputValue.trim() || isTyping}
          >
            {isTyping ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-3 text-center">
          {isTyping ? (
            <p className="flex items-center justify-center">
              <Sparkles className="w-3 h-3 mr-1 animate-pulse text-blue-500" />
              Processing your request...
            </p>
          ) : (
            <p>
              💬 Ask about inventory, product details, or get recommendations • Shift+Enter for new line
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;