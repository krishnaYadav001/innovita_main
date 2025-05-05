"use client"

import { motion } from "framer-motion";
import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function TextInput({ string, placeholder, onUpdate, inputType, error }: { string: string, placeholder: string, onUpdate: any, inputType: string, error: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine the actual input type based on showPassword state
  const actualInputType = inputType === 'password' && showPassword ? 'text' : inputType;

  return (
    <div className="relative w-full mb-3">
      <div className={`
        relative rounded-lg overflow-hidden transition-all duration-300
        ${error ? 'ring-2 ring-red-500' : isFocused ? 'ring-2 ring-[#F02C56]/50' : ''}
      `}>
        <motion.input
            placeholder={placeholder}
            className="
                block
                w-full
                bg-gray-100
                dark:bg-gray-800
                text-gray-800
                dark:text-white
                border
                border-transparent
                dark:border-gray-700
                rounded-lg
                py-3.5
                px-4
                focus:outline-none
                dark:placeholder-gray-400
                transition-all
                duration-300
            "
            value={string || ''}
            onChange={(event) => onUpdate(event.target.value)}
            type={actualInputType}
            autoComplete="off"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        />
        
        {/* Password toggle button */}
        {inputType === 'password' && (
          <motion.button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPassword ? (
              <IoEyeOffOutline size={20} />
            ) : (
              <IoEyeOutline size={20} />
            )}
          </motion.button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <motion.p 
          className="text-red-500 text-xs mt-1 ml-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
