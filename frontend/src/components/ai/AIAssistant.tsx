/**
 * Nexus AI Assistant - LegalNexus Practice Intelligence
 * Floating chat widget powered by AI-driven legal practice analytics
 */

import React, { useState, useRef, useEffect } from 'react';
import { aiAssistantService, Message } from '../../services/ai-assistant.service';
import Button from '../common/Button';
import Loading from '../common/Loading';
import './AIAssistant.css';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Analyze billing inertia and unbilled time',
    'Review matter health and burn rates',
    'Show attorney workload distribution',
    'Which matters need attention today?'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await aiAssistantService.chat(textToSend, messages);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or check if the AI service is configured properly.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);

    // Welcome message on first open
    if (!isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: "Nexus AI activated. I provide real-time analysis of matter health, billing inertia, attorney workload, and practice performance metrics. Ask me about your firm's operational data or request specific insights.",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        className={`ai-assistant-toggle nexus ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        title="Nexus AI - Practice Intelligence"
      >
        {isOpen ? '✕' : '🧠'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-assistant-window">
          <div className="ai-assistant-header nexus-header">
            <div className="ai-assistant-header-title">
              <span className="ai-assistant-icon">🧠</span>
              <div>
                <h3>Nexus AI</h3>
                <span className="nexus-tagline">Practice Intelligence</span>
              </div>
            </div>
            <button
              className="ai-assistant-close"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="ai-assistant-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`ai-assistant-message ${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="message-avatar nexus-avatar">🧠</div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  {message.timestamp && (
                    <div className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="message-avatar user">👤</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-assistant-message assistant">
                <div className="message-avatar nexus-avatar">🧠</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {!loading && suggestions.length > 0 && (
            <div className="ai-assistant-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="ai-assistant-input">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="send-button"
              title="Send"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
