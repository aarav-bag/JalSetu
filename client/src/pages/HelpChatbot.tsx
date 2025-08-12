import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, User as UserIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function HelpChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your JalSetu assistant. How can I help you with your farm water management today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Common FAQs for quick access
  const faqs = [
    { id: '1', question: 'How do I optimize my irrigation schedule?' },
    { id: '2', question: 'What do the soil moisture readings mean?' },
    { id: '3', question: 'How to interpret water quality metrics?' },
    { id: '4', question: 'What is the optimal soil moisture level for rice?' },
    { id: '5', question: 'How can I conserve water during drought?' },
    { id: '6', question: 'What are the best watering practices for vegetables?' },
    { id: '7', question: 'How often should I water wheat crops?' },
    { id: '8', question: 'What causes yellow leaves in plants?' },
    { id: '9', question: 'How to prevent crop diseases?' },
    { id: '10', question: 'When is the best time to apply fertilizer?' },
    { id: '11', question: 'How to improve soil quality?' },
    { id: '12', question: 'What are signs of overwatering?' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Predefined responses for common farming and irrigation questions
  const getLocalResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Irrigation scheduling
    if (lowerQuestion.includes('irrigation') && (lowerQuestion.includes('schedule') || lowerQuestion.includes('timing') || lowerQuestion.includes('optimize'))) {
      return "For optimal irrigation scheduling: Water early morning (5-7 AM) or evening (6-8 PM) to minimize evaporation. Check soil moisture at 2-3 inch depth - if dry, it's time to water. Most crops need 1-2 inches of water per week. Use JalSetu's soil moisture sensors to get precise readings for your specific fields.";
    }
    
    // Soil moisture readings
    if (lowerQuestion.includes('soil moisture') || lowerQuestion.includes('moisture reading') || lowerQuestion.includes('moisture mean')) {
      return "Soil moisture levels: 0-30% = Dry (needs immediate watering), 30-60% = Optimal range for most crops, 60-80% = Well watered, 80-100% = Saturated (risk of overwatering). Different crops have different needs - rice prefers 80-90%, wheat 40-60%, vegetables 50-70%. Check readings at multiple depths for best results.";
    }
    
    // Water quality metrics
    if (lowerQuestion.includes('water quality') || lowerQuestion.includes('ph') || lowerQuestion.includes('tds') || lowerQuestion.includes('interpret')) {
      return "Water quality guidelines: pH should be 6.0-7.5 for most crops (slightly acidic to neutral). TDS (Total Dissolved Solids) should be below 1000 ppm for irrigation. Temperature should be 15-25°C for optimal plant absorption. High salinity (>1000 ppm TDS) can damage crops. Test water regularly, especially from bore wells.";
    }
    
    // Rice specific
    if (lowerQuestion.includes('rice') && (lowerQuestion.includes('moisture') || lowerQuestion.includes('optimal'))) {
      return "Rice water management: Maintain 2-5 cm standing water during tillering and flowering stages. Soil moisture should be 80-90%. Drain fields 1-2 weeks before harvest. For direct seeded rice, maintain 90-100% soil moisture for first 3 weeks, then manage like transplanted rice.";
    }
    
    // Wheat specific
    if (lowerQuestion.includes('wheat') && (lowerQuestion.includes('water') || lowerQuestion.includes('often'))) {
      return "Wheat irrigation: Water at sowing, crown root initiation (21 days), tillering (40-45 days), jointing (60-65 days), flowering (85-90 days), and grain filling (100-105 days). Each irrigation should be 4-5 cm deep. Avoid waterlogging. Stop irrigation 2-3 weeks before harvest.";
    }
    
    // Yellow leaves problem
    if (lowerQuestion.includes('yellow') && lowerQuestion.includes('leaves')) {
      return "Yellow leaves causes: 1) Overwatering or poor drainage, 2) Nitrogen deficiency (apply nitrogen fertilizer), 3) Iron deficiency in alkaline soils, 4) Natural aging of lower leaves, 5) Disease or pest damage, 6) Extreme temperatures. Check soil moisture and nutrient levels first.";
    }
    
    // Overwatering signs
    if (lowerQuestion.includes('overwatering') || lowerQuestion.includes('signs')) {
      return "Signs of overwatering: 1) Yellow, wilting leaves despite wet soil, 2) Musty smell from soil, 3) Fungal growth on soil surface, 4) Root rot (black, mushy roots), 5) Stunted growth, 6) Soil that stays wet for days. Reduce watering frequency and improve drainage.";
    }
    
    // Soil quality improvement
    if (lowerQuestion.includes('soil quality') || lowerQuestion.includes('improve soil')) {
      return "Improve soil quality: 1) Add organic compost regularly, 2) Practice crop rotation, 3) Use cover crops, 4) Avoid over-tilling, 5) Add vermicompost for nutrients, 6) Test soil pH and adjust if needed, 7) Mulch to retain moisture, 8) Reduce chemical inputs gradually.";
    }
    
    // Fertilizer timing
    if (lowerQuestion.includes('fertilizer') && (lowerQuestion.includes('time') || lowerQuestion.includes('when') || lowerQuestion.includes('apply'))) {
      return "Fertilizer timing: Apply base fertilizer before sowing. First top-dressing at 20-25 days after sowing. Second at flowering stage. Best time is early morning or evening. Apply when soil is moist but not waterlogged. Water lightly after application to activate nutrients.";
    }
    
    // Drought and water conservation
    if (lowerQuestion.includes('drought') || lowerQuestion.includes('conserve') || lowerQuestion.includes('save water')) {
      return "Water conservation during drought: 1) Use drip irrigation or micro-sprinklers, 2) Apply mulch to reduce evaporation, 3) Water deeply but less frequently, 4) Choose drought-resistant crop varieties, 5) Harvest rainwater when possible, 6) Monitor soil moisture closely with sensors to avoid overwatering.";
    }
    
    // Vegetable farming
    if (lowerQuestion.includes('vegetable') || lowerQuestion.includes('tomato') || lowerQuestion.includes('garden') || lowerQuestion.includes('watering practices')) {
      return "Vegetable irrigation: Leafy greens need frequent light watering (daily in hot weather). Root vegetables like carrots need deep weekly watering. Fruiting vegetables (tomatoes, peppers) need consistent moisture - water when top 2 inches of soil are dry. Avoid wetting leaves to prevent disease.";
    }
    
    // Fertilizer and nutrients
    if (lowerQuestion.includes('fertilizer') || lowerQuestion.includes('nutrient') || lowerQuestion.includes('nitrogen')) {
      return "Nutrient management: Apply nitrogen fertilizer in split doses - 1/3 at planting, 1/3 at tillering, 1/3 at flowering. Phosphorus at planting only. Potassium throughout growing season. Always water after fertilizer application. Soil testing helps determine exact nutrient needs.";
    }
    
    // Crop diseases prevention
    if (lowerQuestion.includes('disease') || lowerQuestion.includes('prevent') || lowerQuestion.includes('fungus') || lowerQuestion.includes('pest')) {
      return "Disease prevention: Avoid overwatering which creates fungal conditions. Water at soil level, not on leaves. Ensure good drainage. Rotate crops annually. Remove infected plant debris. Use resistant varieties when available. Monitor regularly for early detection. Maintain proper plant spacing for air circulation.";
    }
    
    // Weather and seasons
    if (lowerQuestion.includes('weather') || lowerQuestion.includes('season') || lowerQuestion.includes('rain')) {
      return "Weather-based irrigation: Reduce watering before expected rain. Increase frequency during hot, dry periods. Protect crops from heavy rain with drainage. Monitor weather forecasts and adjust irrigation schedules accordingly. Use JalSetu's weather predictions for better planning.";
    }
    
    // Seed germination
    if (lowerQuestion.includes('seed') || lowerQuestion.includes('germination') || lowerQuestion.includes('sprouting')) {
      return "Seed germination tips: Maintain consistent soil moisture (not waterlogged). Soil temperature should be 20-25°C for most crops. Plant at proper depth (2-3 times seed diameter). Ensure good soil contact. Keep soil surface moist until germination. Provide shade in hot weather.";
    }
    
    // Crop rotation
    if (lowerQuestion.includes('rotation') || lowerQuestion.includes('crop rotation')) {
      return "Crop rotation benefits: 1) Breaks pest and disease cycles, 2) Improves soil fertility, 3) Reduces weed pressure, 4) Optimizes nutrient use. Rotate between cereals, legumes, and root crops. Legumes add nitrogen to soil. Avoid planting same family crops consecutively.";
    }
    
    // Pesticide and organic farming
    if (lowerQuestion.includes('organic') || lowerQuestion.includes('pesticide') || lowerQuestion.includes('natural')) {
      return "Organic farming practices: Use neem oil for pest control. Apply compost for nutrients. Encourage beneficial insects with diverse plants. Use crop rotation and companion planting. Apply organic mulch. Use biological pest control methods. Avoid synthetic chemicals.";
    }
    
    // Harvest timing
    if (lowerQuestion.includes('harvest') || lowerQuestion.includes('when to harvest')) {
      return "Harvest timing: Rice - when 80% grains turn golden. Wheat - when moisture is 20-25%. Vegetables - harvest in early morning for best quality. Check maturity indicators specific to each crop. Harvest before overripening to maintain quality and storage life.";
    }
    
    // Plant nutrition deficiency
    if (lowerQuestion.includes('deficiency') || lowerQuestion.includes('nutrition') || lowerQuestion.includes('lacking')) {
      return "Nutrient deficiency signs: Nitrogen - yellowing from bottom leaves. Phosphorus - purple/dark leaves. Potassium - brown leaf edges. Iron - yellow leaves with green veins. Magnesium - yellow between leaf veins. Conduct soil test for accurate diagnosis and treatment.";
    }
    
    // Technology and sensors
    if (lowerQuestion.includes('sensor') || lowerQuestion.includes('technology') || lowerQuestion.includes('jalsetu')) {
      return "JalSetu technology: Our IoT sensors monitor soil moisture, temperature, and humidity in real-time. Data is sent to your smartphone for instant alerts. AI analyzes patterns to suggest optimal watering times. Solar-powered sensors work continuously. Easy to install and maintain.";
    }
    
    // Greeting responses
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
      return "Hello! I'm here to help you with all your farming and irrigation questions. You can ask me about irrigation scheduling, soil moisture, water quality, crop care, or any farming-related topics.";
    }
    
    // Thank you responses
    if (lowerQuestion.includes('thank') || lowerQuestion.includes('thanks')) {
      return "You're welcome! I'm always here to help with your farming and irrigation questions. Feel free to ask me anything about crop care, water management, or JalSetu technology.";
    }
    
    // Default response for unmatched questions
    return "I can help you with questions about irrigation scheduling, soil moisture levels, water quality, crop-specific advice (rice, wheat, vegetables), drought management, fertilizer timing, disease prevention, harvest planning, organic farming, soil improvement, and JalSetu technology. Please ask me about any of these topics for detailed guidance.";
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Prepare conversation history for the API
      const history = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      // Call OpenAI ChatGPT API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          history: history,
          provider: aiProvider
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.response || 'Sorry, I had trouble generating a response.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Fallback to local response if API fails
      const fallbackResponse = getLocalResponse(userMessage.text);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Connection Issue",
        description: "Using offline responses. Check your internet connection.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaqClick = (question: string) => {
    setInputValue(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your JalSetu assistant. How can I help you with your farm water management today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Chat Cleared",
      description: "Your conversation has been reset.",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please log in to access the help chatbot.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 h-8 w-8" 
                onClick={() => navigate('/settings')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-200" />
              </Button>
              Help & FAQ
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-10">Ask any questions about JalSetu</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={clearChat}
            className="h-9 w-9 rounded-full bg-white/10 text-gray-600 dark:text-gray-300"
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* AI Provider Selector */}
      <div className="px-6 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Assistant:</p>
          <select 
            value={aiProvider} 
            onChange={(e) => setAiProvider(e.target.value)}
            className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="openai">ChatGPT (OpenAI)</option>
            <option value="gemini">Gemini</option>
            <option value="perplexity">Perplexity</option>
            <option value="eden">Eden AI</option>
            <option value="local">Offline Mode</option>
          </select>
        </div>
      </div>

      {/* FAQ Quick Access */}
      <div className="px-6 mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Questions:</p>
        <div className="flex flex-wrap gap-2">
          {faqs.slice(0, 3).map((faq) => (
            <button
              key={faq.id}
              onClick={() => handleFaqClick(faq.question)}
              className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {faq.question}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 px-5 py-2 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-primary text-white ml-2' 
                    : 'bg-gray-200 dark:bg-gray-700 mr-2'
                }`}>
                  {message.sender === 'user' 
                    ? <UserIcon className="h-5 w-5" /> 
                    : <Bot className="h-5 w-5 text-primary dark:text-blue-400" />
                  }
                </div>
                <div className={`${
                  message.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                } rounded-2xl p-3 shadow-sm`}>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] flex flex-row">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                  <Bot className="h-5 w-5 text-primary dark:text-blue-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about irrigation, soil moisture, water quality..."
            className="flex-1 rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}