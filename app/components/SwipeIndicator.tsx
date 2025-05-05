"use client";

import React, { useEffect, useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

interface SwipeIndicatorProps {
    direction: 'up' | 'down';
    show: boolean;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ direction, show }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!visible) return null;

    return (
        <div 
            className={`fixed z-50 left-1/2 transform -translate-x-1/2 
                ${direction === 'up' ? 'bottom-10' : 'top-24'} 
                bg-black bg-opacity-70 text-white rounded-full p-3 
                animate-pulse shadow-lg`}
        >
            {direction === 'up' ? (
                <div className="flex flex-col items-center">
                    <FaChevronUp size={24} className="animate-bounce" />
                    <span className="text-sm mt-1">Swipe up for next</span>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <FaChevronDown size={24} className="animate-bounce" />
                    <span className="text-sm mt-1">Swipe down for previous</span>
                </div>
            )}
        </div>
    );
};

export default SwipeIndicator;
