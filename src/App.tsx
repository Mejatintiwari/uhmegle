import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Chat from './components/Chat';
import OnlineStats from './components/OnlineStats';
import { Message, Stats } from './types';
import { MessageCircle } from 'lucide-react';

// Connect to the WebSocket server
const socket = io('wss://chat-backend-k2zv.onrender.com');

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState<Stats>({ onlineUsers: 0, activeChats: 0 });
  
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('findPartner');
    });
  
    socket.on('partnerFound', () => {
      console.log('Partner found');
      setIsConnected(true);
      setMessages([]); // Reset messages when a new partner is found
    });
  
    socket.on('partnerDisconnected', () => {
      console.log('Partner disconnected');
      setIsConnected(false);
      setMessages(prev => [...prev, { text: 'Your partner has disconnected.', isSelf: false }]);
    });
  
    socket.on('message', (message: string) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, { text: message, isSelf: false }]);
    });
  
    socket.on('typing', () => {
      console.log('Partner is typing...');
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    });
  
    socket.on('stats', (newStats: Stats) => {
      console.log('Received stats:', newStats);
      setStats(newStats);
    });
  
    return () => {
      socket.off('connect');
      socket.off('partnerFound');
      socket.off('partnerDisconnected');
      socket.off('message');
      socket.off('typing');
      socket.off('stats');
    };
  }, []);
  

  const handleSendMessage = useCallback((message: string) => {
    socket.emit('message', message);
    setMessages(prev => [...prev, { text: message, isSelf: true }]);
  }, []);

  const handleNewChat = useCallback(() => {
    setIsConnected(false);
    setMessages([]);
    socket.emit('findPartner');
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Uhmegle
              </h1>
            </div>
            <p className="text-sm text-gray-500 hidden sm:block">Talk to strangers!</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              onNewChat={handleNewChat}
              isConnected={isConnected}
              isTyping={isTyping}
            />
          </div>
          <div className="order-first lg:order-last mb-4 lg:mb-0">
            <OnlineStats stats={stats} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Uhmegle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;