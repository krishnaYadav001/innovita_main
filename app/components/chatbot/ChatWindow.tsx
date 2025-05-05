"use client";

import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoSend } from 'react-icons/io5';
import { BiLoaderCircle } from 'react-icons/bi'; // For loading indicator

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        // Initial bot message
        { sender: 'bot', text: "Hi there! How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false); // To show loading state
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle sending a message (Simulated bot response for now)
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: inputValue };
        // Add user message immediately and clear input
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true); // Show loading indicator for bot response

        let botResponse: Message;

        try {
            // Call the backend API route
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.text }), // Send only the current message
            });

            if (!response.ok) {
                // Handle API errors (e.g., 500 internal server error)
                const errorData = await response.json();
                console.error("API Error:", errorData);
                botResponse = { sender: 'bot', text: `Sorry, something went wrong. ${errorData.error || ''}` };
            } else {
                // Get successful response from backend
                const data = await response.json();
                botResponse = { sender: 'bot', text: data.reply || "Sorry, I couldn't get a response." };
            }
        } catch (error: any) {
            // Handle network errors or other fetch issues
            console.error("Fetch Error:", error);
            botResponse = { sender: 'bot', text: `Sorry, I couldn't connect to the chat service. ${error.message || ''}` };
        } finally {
             // Add the bot's response (or error message) and hide loading
            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-5 z-50 w-[calc(100%-16px)] sm:w-80 h-[60vh] sm:h-96 max-h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col border dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center p-2 sm:p-3 border-b dark:border-b-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base">Support Chat</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Close chat"
                >
                    <IoClose size={22} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-2 sm:p-3 overflow-y-auto space-y-2 sm:space-y-3">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] sm:max-w-[75%] p-2 rounded-lg text-sm sm:text-base ${
                                msg.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {/* Loading indicator */}
                {isLoading && (
                     <div className="flex justify-start">
                         <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600">
                             <BiLoaderCircle className="animate-spin text-black dark:text-white" size={18}/>
                         </div>
                     </div>
                )}
                {/* Dummy div to ensure scroll to bottom */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 sm:p-3 border-t dark:border-t-gray-700 flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-grow px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="ml-2 p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                >
                    <IoSend size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;