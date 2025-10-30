import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Search, MessageSquare, Building2, GraduationCap, MapPin, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState('general');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const topics = [
    { 
      id: 'general', 
      name: 'General', 
      icon: MessageSquare,
      endpoint: `${API_URL}/chat/general`,
      color: 'from-blue-500 to-cyan-500',
      description: 'Ask anything about PCE'
    },
    { 
      id: 'academics', 
      name: 'Academics', 
      icon: GraduationCap,
      endpoint: `${API_URL}/chat/academics`,
      color: 'from-purple-500 to-pink-500',
      description: 'Courses & curriculum'
    },
    { 
      id: 'navigation', 
      name: 'Navigation', 
      icon: MapPin,
      endpoint: `${API_URL}/chat/campus-nav`,
      color: 'from-green-500 to-emerald-500',
      description: 'Find your way around campus'
    },
    { 
      id: 'admissions', 
      name: 'Admissions', 
      icon: Building2,
      endpoint: `${API_URL}/chat/admissions`,
      color: 'from-orange-500 to-red-500',
      description: 'Application & requirements'
    },
  ];

  const currentTopic = topics.find(t => t.id === activeTopic);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      text: input, 
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await axios.post(currentTopic.endpoint, {
        message: input,
      });
      
      setMessages(prev => [...prev, { 
        text: response.data.reply, 
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble connecting. Please try again.", 
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = {
    general: [
      "Tell me about PCE",
      "What facilities does the college have?",
      "What are the placement statistics?",
    ],
    academics: [
      "What B.Tech programs are offered?",
      "Tell me about the Computer Engineering curriculum",
      "What are the eligibility criteria?",
    ],
    navigation: [
      "Where is the library?",
      "How do I get to the canteen?",
      "Where is the Computer lab?",
    ],
    admissions: [
      "What is the admission process?",
      "What are the fees?",
      "When do admissions open?",
    ],
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTopic.color} flex items-center justify-center shadow-lg`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  PilBot AI
                </h1>
                <p className="text-xs text-slate-500">Pillai College Assistant</p>
              </div>
            </div>
            
            {/* Topic Pills */}
            <div className="flex gap-2">
              {topics.map(topic => {
                const Icon = topic.icon;
                return (
                  <motion.button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTopic === topic.id
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4 inline mr-1.5" />
                    {topic.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${currentTopic.color} flex items-center justify-center shadow-2xl`}>
                  <currentTopic.icon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  {currentTopic.description}
                </h2>
                <p className="text-slate-500 mb-8">
                  Ask me anything about Pillai College of Engineering
                </p>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
                  {suggestedQuestions[activeTopic].map((question, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="p-4 bg-white rounded-xl hover:shadow-lg transition-all text-left border border-slate-200 hover:border-slate-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Search className="w-4 h-4 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-700">{question}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTopic.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        message.sender === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTopic.color} flex items-center justify-center mr-3`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-4 sticky bottom-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3 bg-white rounded-2xl border border-slate-300 shadow-lg p-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${currentTopic.name.toLowerCase()}...`}
                className="flex-1 px-4 py-3 bg-transparent outline-none resize-none max-h-32 text-slate-800 placeholder-slate-400"
                rows={1}
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? `bg-gradient-to-r ${currentTopic.color} text-white shadow-lg`
                    : 'bg-slate-100 text-slate-400'
                }`}
                whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
