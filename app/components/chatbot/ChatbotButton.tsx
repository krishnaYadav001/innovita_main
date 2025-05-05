"use client";

import React, { useState, useEffect, useRef } from 'react';
import { BsChatDotsFill } from 'react-icons/bs';

interface ChatbotButtonProps {
    onClick: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick }) => {
    // State to track position
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [wasDragged, setWasDragged] = useState(false);
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dragThreshold = 5; // Minimum pixels moved to consider it a drag
    const dragStartPos = useRef({ x: 0, y: 0 });

    // Load saved position from localStorage on component mount
    useEffect(() => {
        const savedPosition = localStorage.getItem('chatbotPosition');
        if (savedPosition) {
            setPosition(JSON.parse(savedPosition));
        } else {
            // Default position if none saved
            setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
        }
    }, []);

    // Save position to localStorage when it changes
    useEffect(() => {
        if (position.x !== 0 && position.y !== 0) {
            localStorage.setItem('chatbotPosition', JSON.stringify(position));
        }
    }, [position]);

    // Handle mouse down event to start dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setWasDragged(false); // Reset drag state on mouse down
        // Record initial mouse position and button position
        setInitialPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        // Store the starting position to calculate distance moved
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    // Handle mouse move event to update position while dragging
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging && buttonRef.current) {
            // Prevent default behavior to avoid text selection during drag
            e.preventDefault();

            // Calculate distance moved to determine if this is a drag or just a click
            const distX = Math.abs(e.clientX - dragStartPos.current.x);
            const distY = Math.abs(e.clientY - dragStartPos.current.y);

            // If moved more than threshold, consider it a drag
            if (distX > dragThreshold || distY > dragThreshold) {
                setWasDragged(true);
            }

            // Calculate new position based on mouse movement
            const newX = e.clientX - initialPos.x;
            const newY = e.clientY - initialPos.y;

            // Constrain to window boundaries
            const maxX = window.innerWidth - buttonRef.current.offsetWidth;
            const maxY = window.innerHeight - buttonRef.current.offsetHeight;

            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY))
                });
            });
        }
    };

    // Handle mouse up event to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add and remove event listeners for mouse move and up
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, initialPos]);

    // Handle touch events for mobile devices
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setWasDragged(false); // Reset drag state on touch start
        const touch = e.touches[0];
        setInitialPos({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        });
        // Store the starting position to calculate distance moved
        dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging && buttonRef.current) {
            e.preventDefault(); // Prevent scrolling while dragging
            const touch = e.touches[0];

            // Calculate distance moved to determine if this is a drag or just a tap
            const distX = Math.abs(touch.clientX - dragStartPos.current.x);
            const distY = Math.abs(touch.clientY - dragStartPos.current.y);

            // If moved more than threshold, consider it a drag
            if (distX > dragThreshold || distY > dragThreshold) {
                setWasDragged(true);
            }

            // Calculate new position based on touch movement
            const newX = touch.clientX - initialPos.x;
            const newY = touch.clientY - initialPos.y;

            // Constrain to window boundaries
            const maxX = window.innerWidth - buttonRef.current.offsetWidth;
            const maxY = window.innerHeight - buttonRef.current.offsetHeight;

            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY))
                });
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Add and remove event listeners for touch events
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, initialPos]);

    return (
        <div className="group">
            <button
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={(e) => {
                    // Only trigger onClick if the button wasn't dragged
                    if (!wasDragged) {
                        onClick();
                    }
                }}
                className={`fixed z-40 p-2.5 sm:p-3 text-white rounded-full shadow-lg focus:outline-none transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing
                    ${isDragging
                        ? 'bg-green-600 dark:bg-green-700 scale-110 shadow-xl'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                aria-label="Open Support Chat"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    touchAction: 'none', // Prevent scrolling on touch devices
                    transition: isDragging ? 'none' : 'left 0.3s ease, top 0.3s ease' // Smooth transition when not dragging
                }}
            >
                <BsChatDotsFill size={22} />
            </button>

            {/* Tooltip that appears on hover - hidden on mobile */}
            <div
                className="fixed opacity-0 hidden sm:block group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded py-1.5 px-3 pointer-events-none"
                style={{
                    left: `${position.x - 40}px`,
                    top: `${position.y - 40}px`,
                    width: '120px',
                    textAlign: 'center',
                    zIndex: 49,
                    transition: isDragging ? 'none' : 'opacity 0.3s ease, left 0.3s ease, top 0.3s ease'
                }}
            >
                <span className="block">✋ Grab & Drag</span>
            </div>
        </div>
    );
};

export default ChatbotButton;