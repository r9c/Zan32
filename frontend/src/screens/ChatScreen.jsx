import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import FadeTransition from '../components/FadeTransition';
import SecureButton from '../components/SecureButton';

const ChatScreen = ({ onBackToJoin }) => {
  const [message, setMessage] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to the secure chat!', sender: 'system', timestamp: new Date() },
    { id: 2, text: 'Messages are encrypted end-to-end.', sender: 'system', timestamp: new Date() }
  ]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate initial 6-digit code
    const generateSixDigitCode = () => {
      return Math.floor(100000 + Math.random() * 900000)
        .toString()
        .replace(/(\d{3})(\d{3})/, "$1-$2");
    };

    setCurrentCode(generateSixDigitCode());

    // Timer countdown and code refresh every 30 seconds
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCurrentCode(generateSixDigitCode());
          return 30;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleZan32Click = () => {
    if (onBackToJoin) {
      onBackToJoin();
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* Left Sidebar - Code Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          width: '280px',
          height: '100vh',
          backgroundColor: 'rgba(20, 20, 20, 0.9)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}
      >
        <div 
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            userSelect: 'none'
          }}
          onClick={handleZan32Click}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          ZAN32
        </div>
        <div style={{
          backgroundColor: 'rgba(44, 44, 44, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '1rem 1.5rem',
          fontSize: '1.2rem',
          letterSpacing: '1px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          {currentCode}
        </div>
        <div style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          opacity: 0.7,
          marginBottom: '2rem'
        }}>
          {timeLeft}s
        </div>
      </motion.div>

      {/* Right Section - Chat Interface */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        minWidth: 0
      }}>
        {/* Messages Area - Fixed Height Container */}
        <div style={{
          height: 'calc(100vh - 120px)',
          padding: '2rem',
          paddingBottom: '1rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Messages Container - Fixed Height with Scroll */}
          <div style={{
            height: '100%',
            backgroundColor: 'rgba(44, 44, 44, 0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Scrollable Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    marginBottom: '1rem',
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      maxWidth: '70%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      backgroundColor: msg.sender === 'user' 
                        ? 'rgba(68, 68, 68, 0.8)' 
                        : 'rgba(44, 44, 44, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{ fontSize: '0.9rem' }}>{msg.text}</div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      opacity: 0.6, 
                      marginTop: '0.3rem',
                      textAlign: 'right'
                    }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div style={{
          height: '120px',
          padding: '2rem',
          paddingTop: '1rem',
          backgroundColor: 'rgba(20, 20, 20, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
            height: '80px'
          }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{
                flex: 1,
                height: '60px',
                minHeight: '60px',
                maxHeight: '60px',
                resize: 'none',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(44, 44, 44, 0.8)',
                color: 'white',
                fontSize: '1rem',
                backdropFilter: 'blur(10px)',
                fontFamily: 'inherit',
                lineHeight: '1.4'
              }}
            />
            <SecureButton
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="medium"
              style={{
                height: '60px',
                width: '100px',
                flexShrink: 0
              }}
            >
              Send
            </SecureButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
