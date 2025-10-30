import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Building2, GraduationCap, MapPin, Menu, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState('general');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const topics = [
    { 
      id: 'general', 
      name: 'General', 
      icon: MessageSquare,
      endpoint: `${API_URL}/chat/general`,
      color: 'text-cyan-400',
      bgActive: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      hoverBg: 'hover:bg-cyan-500/5',
    },
    { 
      id: 'academics', 
      name: 'Academics', 
      icon: GraduationCap,
      endpoint: `${API_URL}/chat/academics`,
      color: 'text-blue-400',
      bgActive: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      hoverBg: 'hover:bg-blue-500/5',
    },
    { 
      id: 'navigation', 
      name: 'Navigation', 
      icon: MapPin,
      endpoint: `${API_URL}/chat/campus-nav`,
      color: 'text-cyan-400',
      bgActive: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      hoverBg: 'hover:bg-cyan-500/5',
    },
    { 
      id: 'admissions', 
      name: 'Admissions', 
      icon: Building2,
      endpoint: `${API_URL}/chat/admissions`,
      color: 'text-blue-400',
      bgActive: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      hoverBg: 'hover:bg-blue-500/5',
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

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail) || newEmail === '');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid || !email || !selectedMessage) return;

    setEmailSending(true);
    try {
      await axios.post(`${API_URL}/chat/mail`, {
        message: selectedMessage,
        email: email,
      });
      setIsEmailModalOpen(false);
      setEmail('');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Email error:', error);
    } finally {
      setEmailSending(false);
    }
  };

  const openEmailModal = (message) => {
    setSelectedMessage(message);
    setIsEmailModalOpen(true);
  };

  const suggestedQuestions = {
    general: [
      "What makes PCE unique?",
      "Tell me about campus facilities",
      "Recent placement statistics?",
    ],
    academics: [
      "B.Tech programs available",
      "Computer Engineering curriculum",
      "Eligibility requirements?",
    ],
    navigation: [
      "Where is the library located?",
      "Guide me to the canteen",
      "Find Computer Engineering lab",
    ],
    admissions: [
      "Admission process overview",
      "Fee structure details",
      "When do admissions start?",
    ],
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden">
      {/* Sidebar - Mobile & Desktop */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative z-30 w-72 h-full bg-black/40 backdrop-blur-xl border-r border-gray-800/50 transition-transform duration-300 ease-in-out flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800/50 bg-gradient-to-br from-cyan-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-cyan-500/20 p-2.5 border border-cyan-500/30 backdrop-blur-sm">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/PCECroppedLogo.png/512px-PCECroppedLogo.png" 
                    alt="PCE Logo" 
                    className="w-full h-full object-contain brightness-125 contrast-125 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                  />
                </div>
                <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">PilBot AI</h1>
                <p className="text-xs text-gray-500 font-medium">PCE Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-cyan-500/10 rounded-lg transition-colors border border-gray-800/50"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Explore Topics</div>
          <div className="space-y-2">
            {topics.map(topic => {
              const Icon = topic.icon;
              const isActive = activeTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setActiveTopic(topic.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${topic.color === 'text-cyan-400' ? 'from-cyan-500/20 to-blue-500/20' : 'from-blue-500/20 to-cyan-500/20'} ${topic.color} border border-cyan-500/30 shadow-lg shadow-cyan-500/10`
                      : `text-gray-400 hover:text-gray-200 hover:bg-white/5`
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-cyan-500/20' : 'bg-white/5 group-hover:bg-white/10'} transition-colors`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span>{topic.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>Powered by Advanced AI</span>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-black/50 via-cyan-950/10 to-black/50 backdrop-blur-xl border-b border-cyan-500/10 px-4 lg:px-6 py-4 sticky top-0 z-10">
          {/* Animated gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-cyan-500/10 rounded-xl transition-colors border border-gray-800/50"
              >
                <Menu className="w-5 h-5 text-cyan-400" />
              </button>
              
              {/* Logo & Branding */}
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-2 border border-cyan-500/20 backdrop-blur-sm">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/PCECroppedLogo.png/512px-PCECroppedLogo.png" 
                      alt="PCE Logo" 
                      className="w-full h-full object-contain brightness-110 contrast-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {currentTopic.name}
                    </h2>
                    <div className={`w-2 h-2 rounded-full ${currentTopic.color.replace('text-', 'bg-')} animate-pulse`}></div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-500" />
                    AI-Powered Assistant
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-xs font-medium text-cyan-400">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="relative flex-1 overflow-y-auto px-4 lg:px-6 py-6 lg:py-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12 lg:py-20 px-4">
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 lg:mb-8">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center`}>
                    <currentTopic.icon className={`w-10 h-10 lg:w-12 lg:h-12 ${currentTopic.color}`} />
                  </div>
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"></div>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {currentTopic.name} Assistant
                </h2>
                <p className="text-base lg:text-lg text-gray-400 mb-12 lg:mb-16 max-w-2xl mx-auto">
                  Ask me anything about Pillai College of Engineering
                </p>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 lg:mt-8">
                  {suggestedQuestions[activeTopic].map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(question)}
                      className="group relative p-5 bg-black/40 backdrop-blur-sm rounded-2xl hover:bg-black/60 transition-all text-left border border-gray-800/50 hover:border-cyan-500/30 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center mb-4`}>
                        <currentTopic.icon className={`w-5 h-5 ${currentTopic.color}`} />
                      </div>
                      <p className="relative text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                        {question}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="relative flex-shrink-0">
                        <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center`}>
                          <Sparkles className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${currentTopic.color}`} />
                        </div>
                        <div className="absolute inset-0 bg-cyan-500/10 blur-lg rounded-xl"></div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
                      <div
                        className={`rounded-2xl px-5 py-3.5 backdrop-blur-sm ${
                          message.sender === 'user'
                            ? `bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 ${currentTopic.color} shadow-lg shadow-cyan-500/5`
                            : 'bg-black/40 border border-gray-800/50 text-gray-100'
                        }`}
                      >
                        <p className="text-sm lg:text-[15px] leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      </div>
                      {message.sender === 'bot' && (
                        <button
                          onClick={() => openEmailModal(message.text)}
                          className={`flex items-center gap-2 text-xs ${currentTopic.color} hover:text-cyan-300 transition-colors px-1`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email this response</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center`}>
                    <Sparkles className={`w-4 h-4 ${currentTopic.color}`} />
                  </div>
                  <div className="absolute inset-0 bg-cyan-500/10 blur-lg rounded-xl"></div>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl px-5 py-3.5">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{ 
                          duration: 1.2, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="relative bg-black/40 backdrop-blur-xl border-t border-gray-800/50 px-4 lg:px-6 py-4 lg:py-5 sticky bottom-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-2 bg-black/60 rounded-2xl border border-gray-800/50 p-2.5 hover:border-cyan-500/30 transition-all focus-within:border-cyan-500/50 focus-within:shadow-lg focus-within:shadow-cyan-500/10">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${currentTopic.name.toLowerCase()}...`}
                className="flex-1 px-4 py-3 bg-transparent outline-none resize-none max-h-32 text-sm lg:text-base text-white placeholder-gray-500"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`relative p-3 rounded-xl transition-all flex-shrink-0 overflow-hidden ${
                  input.trim() && !isLoading
                    ? `bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30`
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                <Send className="w-5 h-5 relative z-10" />
                {input.trim() && !isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 hover:opacity-20 transition-opacity"></div>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 text-center mt-3 hidden sm:block">
              Press <kbd className="px-2 py-1 bg-white/5 border border-gray-800 rounded text-gray-500 text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-white/5 border border-gray-800 rounded text-gray-500 text-xs">Shift + Enter</kbd> for new line
            </p>
          </form>
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsEmailModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-black/60 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-6 lg:p-8 max-w-md w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 pointer-events-none"></div>
              
              <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Email Response</h3>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="relative bg-black/40 border border-gray-800/50 rounded-2xl p-4 mb-6 max-h-40 overflow-y-auto scrollbar-thin">
                <p className="text-sm text-gray-300 leading-relaxed">{selectedMessage}</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="relative">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 bg-black/40 border ${
                      isEmailValid ? 'border-gray-800/50 focus:border-cyan-500/50' : 'border-red-500/50'
                    } rounded-xl text-white placeholder-gray-600 outline-none transition-colors`}
                    required
                  />
                  {!isEmailValid && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 transition-colors text-sm font-medium border border-gray-800/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isEmailValid || !email || emailSending}
                    className={`flex-1 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                      isEmailValid && email && !emailSending
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30'
                        : 'bg-gray-800 text-gray-600'
                    }`}
                  >
                    {emailSending ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⚡
                        </motion.span>
                        Sending...
                      </span>
                    ) : 'Send Email'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
