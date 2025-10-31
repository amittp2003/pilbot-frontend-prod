import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Building2, GraduationCap, MapPin, Mail, X, Plus, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import pceLogo from '../assets/pce-logo-new.png';

const API_URL = process.env.REACT_APP_API_URL;

const ChatInterfaceNebula = () => {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState(() => {
    const saved = sessionStorage.getItem('activeTopic');
    return saved || 'general';
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const topics = [
    {
      id: 'general',
      name: 'General',
      icon: MessageSquare,
      endpoint: `${API_URL}/chat/general`,
      description: 'AI-Powered Assistant',
    },
    {
      id: 'academics',
      name: 'Academics',
      icon: GraduationCap,
      endpoint: `${API_URL}/chat/academics`,
      description: 'Programs & Faculty',
    },
    {
      id: 'navigation',
      name: 'Navigation',
      icon: MapPin,
      endpoint: `${API_URL}/chat/campus-nav`,
      description: 'Campus Locations',
    },
    {
      id: 'admissions',
      name: 'Admissions',
      icon: Building2,
      endpoint: `${API_URL}/chat/admissions`,
      description: 'Eligibility & Fees',
    },
  ];

  const genZGreetings = [
    "Hey! What can I help you with?",
    "Hi there! Ask me anything",
    "What's up? How can I help?",
    "Hey! What do you need?",
    "Hi! I'm here to help",
    "Hello! What brings you here?"
  ];

  const loadingMessages = [
    "Getting your answer...",
    "Let me check that for you...",
    "Looking that up...",
    "One moment...",
    "Searching...",
    "Just a sec..."
  ];

  const quickActions = [
    { text: "Campus tour", query: "Give me a campus tour guide" },
    { text: "Food spots", query: "Best food places near PCE?" },
    { text: "Scholarships", query: "What scholarships are available?" },
    { text: "Events", query: "What events happen at PCE?" },
    { text: "Placements", query: "Recent placement stats" },
    { text: "Study tips", query: "Study resources and tips" }
  ];

  const [randomGreeting] = useState(() => genZGreetings[Math.floor(Math.random() * genZGreetings.length)]);
  const [loadingMessage, setLoadingMessage] = useState("");

  const currentTopic = topics.find((t) => t.id === activeTopic);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages and topic to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('activeTopic', activeTopic);
  }, [activeTopic]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Check backend connectivity
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
        setIsBackendConnected(response.status === 200);
      } catch (error) {
        setIsBackendConnected(false);
      }
    };

    // Check immediately on mount
    checkBackendHealth();

    // Check every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

    try {
      const response = await axios.post(currentTopic.endpoint, {
        message: input,
        user_name: "",
        email: ""
      });

      setMessages((prev) => [
        ...prev,
        {
          text: response.data.reply || response.data.message || "I received your message but couldn't generate a proper response.",
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = "I'm having trouble connecting right now. Please try again.";
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 422) {
          errorMessage = "There was an issue with your request. Please try rephrasing your question.";
        } else if (error.response.status === 500) {
          errorMessage = "I encountered an internal error. Please try again in a moment.";
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Cannot reach the server. Please check your connection.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
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
      'What makes PCE unique?',
      'Tell me about campus facilities',
      'Recent placement statistics?',
    ],
    academics: [
      'Available B.Tech programs?',
      'Computer Science curriculum',
      'Faculty qualifications',
    ],
    navigation: [
      'Where is the library?',
      'How to reach the auditorium?',
      'Campus layout guide',
    ],
    admissions: [
      'Admission process overview',
      'Fee structure details',
      'Application deadlines',
    ],
  };

  return (
    <div className="relative flex h-screen bg-neural-900 text-neural-100 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neural-900 via-neural-900 to-neural-850" />
      </div>

      {/* Sidebar - 240px width */}
      <div
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 w-72 md:w-60 h-full transition-transform duration-300 ease-out`}
      >
        <div className="absolute inset-0 bg-neural-850 border-r border-neural-600" />
        <div className="relative flex h-full flex-col">
          {/* Sidebar header */}
          <div className="p-3 md:p-4 border-b border-neural-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={pceLogo}
                  alt="PCE Logo"
                  className="w-10 h-10 object-contain"
                />
                <p className="text-lg font-semibold text-neutral-100">PilBot</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1.5 text-neural-200 hover:text-neural-100 hover:bg-neural-800 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-2.5 md:p-3">
            <button
              onClick={() => {
                setMessages([]);
                setInput('');
                setActiveTopic('general');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-neural-100 bg-neural-700 hover:bg-neural-800 border border-neural-500 rounded-lg transition-all duration-200 hover-scale"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Topics List */}
          <div className="flex-1 overflow-y-auto px-2.5 md:px-3 pb-3 scrollbar-modern">
            <div className="text-xs font-semibold text-neural-300 uppercase tracking-wider mb-2 px-2">Topics</div>
            <div className="space-y-1.5">
              {topics.map((topic) => {
                const Icon = topic.icon;
                const isActive = activeTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveTopic(topic.id);
                      setIsSidebarOpen(false);
                      setMessages([]);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-neural-700 border border-neural-500 text-neural-100'
                        : 'text-neural-200 hover:bg-neural-800 hover:text-neural-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-neural-600' : 'bg-neural-700'}`}>
                      <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-neural-100' : 'text-neural-200'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{topic.name}</div>
                      <div className="text-xs text-neural-300 mt-0.5 hidden sm:block">{topic.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="p-3 md:p-4 border-t border-neural-600">
            <div className="flex items-center gap-2 text-xs text-neural-200">
              <Sparkles className="w-4 h-4 text-neural-100" />
              <span className="font-medium">Powered by AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navigation Bar - Responsive */}
        <div className="sticky top-0 z-10 h-14 px-3 sm:px-6 glass flex items-center justify-between">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-neural-200 hover:text-neural-100 hover:bg-neural-800 rounded-lg transition-all duration-200 flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neural-700 border border-neural-500 flex items-center justify-center flex-shrink-0">
                  <currentTopic.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neural-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-neural-100 tracking-tight truncate">
                    <span className="hidden lg:inline">Pillai College of Engineering </span>
                    <span className="lg:hidden">PCE </span>
                    <span className="text-neural-300 font-medium hidden sm:inline">(Autonomous)</span>
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-neural-200 -mt-0.5 truncate">
                    <span className="hidden sm:inline">PilBot • </span>{currentTopic.name}
                  </p>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border flex-shrink-0 ${
              isBackendConnected 
                ? 'bg-neural-700 border-neural-600' 
                : 'bg-neural-800 border-neural-600'
            }`}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                isBackendConnected 
                  ? 'bg-success status-pulse' 
                  : 'bg-neural-400'
              }`} />
              <span className="text-[10px] sm:text-xs font-medium text-neural-200 hidden xs:inline">
                {isBackendConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scrollbar-modern">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-8 sm:py-12 md:py-16 px-4 sm:px-6">
                {/* Welcome state */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-neural-700 to-neural-800 rounded-2xl shadow-subtle" />
                  <div className="relative w-full h-full rounded-2xl bg-neural-700 border border-neural-600 flex items-center justify-center">
                    <currentTopic.icon className="w-7 h-7 sm:w-9 sm:h-9 text-neural-100" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-neural-100">{randomGreeting}</h2>
                <p className="text-xs sm:text-sm text-neural-200 mb-6 sm:mb-8 max-w-lg mx-auto">
                  Your AI assistant for everything PCE
                </p>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8 max-w-3xl mx-auto">
                  {quickActions.map((action, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setInput(action.query);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-neural-700 hover:bg-neural-800 border border-neural-600 rounded-lg text-xs sm:text-sm text-neural-100 font-medium transition-all duration-200"
                    >
                      {action.text}
                    </motion.button>
                  ))}
                </div>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions[activeTopic].map((question, idx) => (
                    <motion.button
                      key={`${activeTopic}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setInput(question);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className="group text-left p-3 sm:p-4 rounded-xl bg-neural-700 hover:bg-neural-800 border border-neural-600 hover:border-neural-500 transition-all duration-200"
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neural-600 flex items-center justify-center flex-shrink-0">
                          <currentTopic.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neural-200" />
                        </div>
                        <p className="text-xs sm:text-sm text-neural-100 leading-relaxed pt-0.5">{question}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="group"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-4">
                      <div className="flex-shrink-0">
                        {message.sender === 'bot' ? (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neural-700 border border-neural-600 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neural-100" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neural-800 border border-neural-600 flex items-center justify-center">
                            <span className="text-[10px] sm:text-xs font-semibold text-neural-200">You</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <span className="text-xs sm:text-sm font-semibold text-neural-100">
                            {message.sender === 'bot' ? 'PilBot' : 'You'}
                          </span>
                          <span className="text-[10px] sm:text-xs text-neural-300">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`text-xs sm:text-sm text-neural-100 leading-relaxed whitespace-pre-wrap rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                            message.sender === 'bot' 
                              ? 'bg-neural-850 border border-neural-600' 
                              : 'bg-neural-700 border border-neural-600'
                          }`}
                        >
                          {message.text}
                        </motion.div>
                        {message.sender === 'bot' && (
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(message.text);
                              }}
                              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-neural-200 hover:text-neural-100 hover:bg-neural-800 rounded-lg border border-neural-600 transition-all duration-200"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => openEmailModal(message.text)}
                              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-neural-200 hover:text-neural-100 hover:bg-neural-800 rounded-lg border border-neural-600 transition-all duration-200"
                            >
                              <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              Email
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isLoading && (
              <div className="flex items-start gap-2.5 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neural-700 border border-neural-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neural-100 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-neural-100">PilBot</span>
                  </div>
                  <div className="text-xs sm:text-sm text-neural-200 italic">{loadingMessage}</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - Mobile optimized with elegant red accent */}
        <div className="sticky bottom-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 glass">
          <form onSubmit={handleSend} className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-neural-800 to-neural-850 rounded-xl transition-all duration-300 border-2 border-transparent focus-within:border-accent/40">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-11 sm:pr-12 bg-transparent outline-none resize-none text-xs sm:text-sm text-white placeholder-neural-300 scrollbar-hide focus:outline-none"
                rows={1}
                disabled={isLoading}
                style={{ maxHeight: '120px', border: 'none', outline: 'none', boxShadow: 'none' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 p-2 rounded-lg transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-br from-accent to-accent-dark text-white hover:scale-105 active:scale-95'
                    : 'bg-neural-700 text-neural-300 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-neural-300 text-center mt-1.5 sm:mt-2 font-medium">
              Available 24/7 • Verified PCE information
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsEmailModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neural-850 border border-neural-600 rounded-2xl p-8 max-w-xl w-full shadow-elevated"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neural-700 border border-neural-600 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neural-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-neural-100">Email this response</h3>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-2 text-neural-200 hover:text-neural-100 hover:bg-neural-800 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-neural-800 border border-neural-600 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto scrollbar-modern">
                <p className="text-sm text-neural-100 leading-relaxed">{selectedMessage}</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neural-100 mb-2">Recipient email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 bg-neural-800 border ${
                      isEmailValid ? 'border-neural-600 focus:border-neural-400' : 'border-accent focus:border-accent'
                    } rounded-xl text-neural-100 placeholder-neural-300 outline-none focus:ring-1 focus:ring-neural-400 transition-all duration-200`}
                    required
                  />
                  {!isEmailValid && (
                    <p className="text-xs text-accent mt-2 font-medium">Please enter a valid email address</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-neural-700 border border-neural-600 rounded-xl text-neural-100 font-medium hover:bg-neural-800 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isEmailValid || !email || emailSending}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isEmailValid && email && !emailSending
                        ? 'bg-gradient-to-br from-accent to-accent-dark text-white hover:scale-105 active:scale-95'
                        : 'bg-neural-700 text-neural-300 border border-neural-600 cursor-not-allowed'
                    }`}
                  >
                    {emailSending ? 'Sending...' : 'Send Email'}
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

export default ChatInterfaceNebula;
