import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cake, 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Gift, 
  Crown, 
  CreditCard, 
  MessageSquare,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const BOT_NAME = 'Benny the Baker';
const BOT_TITLE = 'Royal Concierge & Sommelier';

// Knowledge Base with rich navigation actions
const KNOWLEDGE_RESPONSES = [
  {
    triggers: ['hi', 'hello', 'hey', 'start', 'morning', 'evening', 'help'],
    reply: "Greetings! Welcome to **Sweet Haven Royal Bakery**! 🍰\n\nI am Benny, your personal confectionery concierge. How may I sweeten your day? You can explore our royal creations, design a custom celebratory cake, or track an active order.",
    actions: [
      { label: '🛍️ Browse Products', path: '/products' },
      { label: '🎂 Custom Cake Studio', path: '/custom-cake' },
      { label: '🚚 Track Live Order', path: '/track' },
      { label: '🎁 Special Offers', path: '/offers' },
    ]
  },
  {
    triggers: ['order', 'buy', 'purchase', 'shop', 'menu', 'items', 'catalog'],
    reply: "Placing an order is effortless!\n\n1. Browse our handcrafted Belgian cakes, truffles, and cupcakes\n2. Add your favorites to the cart\n3. Apply coupons at checkout for instant savings\n4. Choose instant door delivery or bakery pickup!",
    actions: [
      { label: '🍰 Explore Cake Catalog', path: '/products' },
      { label: '🛒 View My Cart', path: '/cart' },
      { label: '💳 Go to Checkout', path: '/checkout' }
    ]
  },
  {
    triggers: ['track', 'status', 'where is my', 'delivery', 'shipped', 'order status'],
    reply: "Track your treats in real-time!\n\nEnter your order number (e.g. **SH-84920**) on our Live Tracking portal to see live kitchen preparation and courier GPS progress.",
    actions: [
      { label: '🚚 Open Live Tracker', path: '/track' },
      { label: '📋 View My Order History', path: '/my-orders' }
    ]
  },
  {
    triggers: ['custom', 'design', 'personalize', 'tier', 'photo cake', 'wedding cake', 'birthday cake'],
    reply: "Create your dream centerpiece in our **3D Custom Cake Studio**!\n\n• Choose custom sizes & tiers (1kg to 5kg+)\n• Select luxury fillings: Belgian Truffle, Red Velvet, Salted Caramel\n• Customize greeting text & edible photo toppers\n\n*(Requires minimum 24-48 hours advance notice)*",
    actions: [
      { label: '🎂 Design Custom Cake', path: '/custom-cake' },
      { label: '✨ AI Recommendations', path: '/recommendations' }
    ]
  },
  {
    triggers: ['offer', 'discount', 'coupon', 'promo', 'deal', 'sale', 'save', 'code'],
    reply: "🎉 Great savings are currently active!\n\n• Use code **SWEET20** for 20% off all orders over ₹499\n• Free shipping on orders above ₹799\n• Double loyalty points on Belgian artisan chocolates this weekend!",
    actions: [
      { label: '🎁 View All Deals & Offers', path: '/offers' },
      { label: '🛍️ Shop Discounted Delights', path: '/products' }
    ]
  },
  {
    triggers: ['loyalty', 'points', 'reward', 'club', 'coins', 'membership'],
    reply: "👑 Welcome to the **Sweet Haven Digital Loyalty Club**!\n\n• Earn **1 Sweet Point for every ₹10 spent**\n• Redeem 100 points for a flat ₹10 instant discount\n• Unlock tiered perks: Birthday surprises, VIP tastings, and free express delivery!",
    actions: [
      { label: '👑 Check Loyalty Balance', path: '/loyalty' },
      { label: '👤 View Profile & Badges', path: '/profile' }
    ]
  },
  {
    triggers: ['pay', 'payment', 'upi', 'gpay', 'phonepe', 'card', 'cash', 'cod', 'refund', 'cancel'],
    reply: "We support 100% encrypted and hassle-free payment methods:\n\n• **UPI** (Google Pay, PhonePe, Paytm, QR)\n• **Credit / Debit Cards** (Visa, MasterCard, RuPay)\n• **Net Banking** with instant receipt\n• **Cash on Delivery (COD)**\n\n*Cancellations are accepted within 60 minutes of placing.*",
    actions: [
      { label: '💳 View Payment History', path: '/payment-history' },
      { label: '🛍️ Continue Shopping', path: '/products' }
    ]
  },
  {
    triggers: ['chocolate', 'truffle', 'cocoa', 'dark chocolate'],
    reply: "🍫 Calling all chocolate connoisseurs! Our artisan chocolatiers craft single-origin Belgian truffles, molten lava pots, and fudge brownies with 70% dark cocoa.",
    actions: [
      { label: '🍫 Explore Chocolate Collection', path: '/products?category=chocolates' },
      { label: '✨ Chef Recommendations', path: '/recommendations' }
    ]
  },
  {
    triggers: ['hours', 'open', 'close', 'timing', 'time', 'location', 'address', 'store'],
    reply: "📍 **Sweet Haven Flagship Bakery & Suite**:\n• Heritage Plaza, Baker Street, Chennai - 600001\n• Mon – Sat: 8:00 AM – 9:30 PM\n• Sunday: 9:00 AM – 8:00 PM\n\n*Our online delivery platform accepts orders 24/7!*",
    actions: [
      { label: '🛍️ Order for Today', path: '/products' }
    ]
  },
  {
    triggers: ['contact', 'phone', 'call', 'email', 'support', 'message', 'complaint'],
    reply: "We're always here for you! You can submit an instant inquiry using our Web3Forms contact form at the bottom of the page, or reach our hotline:\n\n📞 **+91 98765 43210**\n✉️ **orders@sweethaven.com**",
    actions: [
      { label: '🛍️ Browse Products', path: '/products' },
      { label: '🚚 Track an Order', path: '/track' }
    ]
  },
  {
    triggers: ['vegan', 'eggless', 'gluten', 'allergen', 'nut', 'diet'],
    reply: "🌿 **Dietary Options & Allergen Safety**:\n\n• 100% Pure Eggless cakes available across all categories\n• Vegan-friendly oat-milk and dark chocolate specials\n• Nut-free and gluten-conscious options clearly badged on product cards!",
    actions: [
      { label: '🌿 Browse All Treats', path: '/products' },
      { label: '🎂 Customize Eggless Cake', path: '/custom-cake' }
    ]
  }
];

function getBotReply(input) {
  const query = input.toLowerCase().trim();

  // 1. Check for Order ID pattern (e.g. SH-84920 or similar numbers)
  const orderMatch = query.match(/(SH-?\d{4,8}|\b\d{5,8}\b)/i);
  if (orderMatch) {
    const orderId = orderMatch[1].toUpperCase();
    return {
      reply: `Found order reference **#${orderId}**! Click below to view real-time delivery GPS coordinates and preparation status.`,
      actions: [
        { label: `🚚 Track Order #${orderId}`, path: `/track?orderNumber=${orderId}` },
        { label: '📋 View All Orders', path: '/my-orders' }
      ]
    };
  }

  // 2. Check Knowledge Base
  for (const item of KNOWLEDGE_RESPONSES) {
    if (item.triggers.some(t => query.includes(t))) {
      return {
        reply: item.reply,
        actions: item.actions
      };
    }
  }

  // 3. Smart Default Fallback
  return {
    reply: "I'm delighted to assist! While I master every confectionery recipe, here are direct shortcuts to find what you need across Sweet Haven:",
    actions: [
      { label: '🛍️ Explore Royal Menu', path: '/products' },
      { label: '🎂 3D Custom Cake Studio', path: '/custom-cake' },
      { label: '🚚 Track Existing Order', path: '/track' },
      { label: '🎁 View Today’s Deals', path: '/offers' }
    ]
  };
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hello! 🍰 I am **Benny**, your royal confectionery concierge.\nHow can I help you today?",
      actions: [
        { label: '🛍️ Explore Cakes', path: '/products' },
        { label: '🎂 Custom Studio', path: '/custom-cake' },
        { label: '🚚 Track Order', path: '/track' },
        { label: '🎁 Current Deals', path: '/offers' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current && bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = getBotReply(text);
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: response.reply,
        actions: response.actions
      };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);

      if (!open) {
        setUnread(prev => prev + 1);
      }
    }, 600 + Math.random() * 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = (path) => {
    navigate(path);
    // On small mobile screens, minimize chat so user can see destination immediately
    if (window.innerWidth < 640) {
      setOpen(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'bot',
        text: "Conversation refreshed. 🍰 How can I assist your sweet tooth next?",
        actions: [
          { label: '🛍️ Browse Products', path: '/products' },
          { label: '🎂 Custom Cake Studio', path: '/custom-cake' },
          { label: '🚚 Track Live Order', path: '/track' }
        ]
      }
    ]);
  };

  return (
    <>
      {/* LUXURY FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open Sweet Haven Concierge Chat"
        style={{
          position: 'fixed',
          bottom: 'clamp(14px, 3vw, 24px)',
          right: 'clamp(14px, 3vw, 24px)',
          height: '56px',
          padding: open ? '0 16px' : '0 20px 0 16px',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #5C1329 0%, #3D0919 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.7)',
          boxShadow: '0 8px 30px rgba(92, 19, 41, 0.45), 0 0 15px rgba(212, 175, 55, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          zIndex: 9999,
          color: '#FFFFFF',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(92, 19, 41, 0.55), 0 0 20px rgba(212, 175, 55, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(92, 19, 41, 0.45), 0 0 15px rgba(212, 175, 55, 0.25)';
        }}
      >
        {/* Luxury Gold Avatar Badge */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37 0%, #F3E0A3 50%, #B8860B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2A1710',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          flexShrink: 0
        }}>
          {open ? <X size={20} /> : <Cake size={20} />}
        </div>

        {!open && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ 
              fontSize: '0.88rem', 
              fontWeight: 700, 
              color: '#FDF9F3', 
              letterSpacing: '0.2px',
              fontFamily: 'var(--font-heading, serif)'
            }}>
              Ask Benny
            </span>
            <span style={{ fontSize: '0.68rem', color: '#D4AF37', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Bakery AI • Online
            </span>
          </div>
        )}

        {/* Unread notification badge */}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
            color: '#2A1710',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #5C1329',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* CHATBOT WINDOW */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 'clamp(80px, 11vh, 94px)',
          right: 'clamp(14px, 3vw, 24px)',
          width: 'min(410px, calc(100vw - 28px))',
          height: 'min(580px, calc(100dvh - 115px))',
          backgroundColor: '#1E1210',
          backgroundImage: 'radial-gradient(circle at top right, rgba(92, 19, 41, 0.45), transparent 70%), linear-gradient(180deg, #1C0F0C 0%, #120907 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.65), 0 0 30px rgba(212, 175, 55, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
          animation: 'chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* ROYAL HEADER */}
          <div style={{
            background: 'linear-gradient(135deg, #5C1329 0%, #380B19 100%)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Avatar with Glow Ring */}
              <div style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4AF37 0%, #F3E0A3 50%, #B8860B 100%)',
                padding: '2px',
                boxShadow: '0 0 14px rgba(212, 175, 55, 0.45)',
                flexShrink: 0
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#2A1710',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D4AF37'
                }}>
                  <Cake size={22} />
                </div>
                {/* Active Green Pulse Indicator */}
                <span style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: '2px solid #2A1710',
                  boxShadow: '0 0 6px #22c55e'
                }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    color: '#FDF9F3',
                    fontFamily: 'var(--font-heading, serif)',
                    letterSpacing: '0.3px'
                  }}>
                    {BOT_NAME}
                  </h3>
                  <span style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    color: '#D4AF37',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}>
                    AI Concierge
                  </span>
                </div>
                <p style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.74rem',
                  color: 'rgba(253, 249, 243, 0.7)'
                }}>
                  Sweet Haven Sommelier • Instant Guide
                </p>
              </div>
            </div>

            {/* Action controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={clearChat}
                title="Restart Conversation"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                <RotateCcw size={15} />
              </button>

              <button
                onClick={() => setOpen(false)}
                title="Minimize Chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* MESSAGES SCROLL AREA */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(212, 175, 55, 0.2) transparent'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                {msg.role === 'bot' && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #5C1329, #380B19)',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4AF37',
                    flexShrink: 0,
                    marginTop: '2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <Sparkles size={16} />
                  </div>
                )}

                <div style={{
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {/* Message Bubble */}
                  <div style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                      : 'rgba(255, 255, 255, 0.06)',
                    color: msg.role === 'user' ? '#1A0D08' : '#FDF9F3',
                    fontWeight: msg.role === 'user' ? 600 : 400,
                    padding: '12px 15px',
                    borderRadius: msg.role === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 15px rgba(212, 175, 55, 0.25)'
                      : '0 4px 15px rgba(0,0,0,0.25)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>

                  {/* INTERACTIVE HYPERLINK / ACTION PILLS */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '2px'
                    }}>
                      {msg.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(action.path)}
                          style={{
                            background: 'rgba(212, 175, 55, 0.12)',
                            color: '#F3E0A3',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37, #B8860B)';
                            e.currentTarget.style.color = '#2A1710';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                            e.currentTarget.style.color = '#F3E0A3';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <span>{action.label}</span>
                          <ChevronRight size={13} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* TYPING BOUNCING DOTS */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5C1329, #380B19)',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D4AF37',
                  flexShrink: 0
                }}>
                  <Sparkles size={16} />
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 18px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#D4AF37',
                        display: 'inline-block',
                        animation: `botDot 1.2s ${i * 0.2}s infinite ease-in-out`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* QUICK PROMPT SUGGESTIONS CHIPS */}
          <div style={{
            padding: '8px 14px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            flexShrink: 0,
            scrollbarWidth: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            {[
              { label: '🛍️ Order Cake', query: 'How to order a cake?' },
              { label: '🚚 Track Status', query: 'Track my order' },
              { label: '🎂 Custom Cake', query: 'I want to design a custom cake' },
              { label: '🎁 Deals & Coupons', query: 'What offers and discounts are active?' },
              { label: '👑 Loyalty Club', query: 'How do loyalty points work?' },
              { label: '🍫 Chocolates', query: 'Tell me about your artisan chocolates' },
              { label: '🌿 Eggless / Vegan', query: 'Do you have eggless or vegan options?' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                style={{
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(253, 249, 243, 0.85)',
                  borderRadius: '16px',
                  padding: '5px 11px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                  e.currentTarget.style.color = '#F3E0A3';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'rgba(253, 249, 243, 0.85)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            background: 'rgba(20, 10, 8, 0.95)',
            flexShrink: 0
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Benny about cakes, tracking, offers..."
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '24px',
                padding: '10px 16px',
                fontSize: '0.85rem',
                color: '#FDF9F3',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.6)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.25)'}
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: input.trim()
                  ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: input.trim() ? '#2A1710' : 'rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                boxShadow: input.trim() ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
