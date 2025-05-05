"use client"

import React from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { BsShop } from 'react-icons/bs';
import { FiUsers } from 'react-icons/fi';
import { MdOutlineVideoLibrary } from 'react-icons/md';
import { BiMessageDetail } from 'react-icons/bi';
import { AiOutlineShoppingCart } from 'react-icons/ai';

interface EmptyStateProps {
  type: 'products' | 'users' | 'posts' | 'comments' | 'cart' | 'custom';
  title?: string;
  message?: string;
  actionLink?: string;
  actionText?: string;
  icon?: IconType;
  iconSize?: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionLink,
  actionText,
  icon: CustomIcon,
  iconSize = 60
}) => {
  // Default content based on type
  const defaults: Record<string, { icon: IconType; title: string; message: string; action?: { link: string; text: string } }> = {
    products: {
      icon: BsShop,
      title: 'No products found',
      message: 'There are no products available at the moment.',
      action: { link: '/upload', text: 'Upload a video with products' }
    },
    users: {
      icon: FiUsers,
      title: 'No users found',
      message: 'There are no users matching your criteria.'
    },
    posts: {
      icon: MdOutlineVideoLibrary,
      title: 'No posts found',
      message: 'There are no posts available at the moment.',
      action: { link: '/upload', text: 'Create a post' }
    },
    comments: {
      icon: BiMessageDetail,
      title: 'No comments yet',
      message: 'Be the first to leave a comment!'
    },
    cart: {
      icon: AiOutlineShoppingCart,
      title: 'Your cart is empty',
      message: 'Looks like you haven\'t added any products to your cart yet.',
      action: { link: '/shop', text: 'Browse Products' }
    },
    custom: {
      icon: BsShop,
      title: 'Nothing to show',
      message: 'No content available at the moment.'
    }
  };

  const defaultContent = defaults[type];
  const Icon = CustomIcon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;
  const displayAction = actionLink && actionText 
    ? { link: actionLink, text: actionText } 
    : defaultContent.action;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 animate-fadeIn">
      <div className="text-6xl mb-4 text-gray-700 dark:text-gray-300">
        <Icon size={iconSize} />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200">{displayTitle}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {displayMessage}
      </p>
      {displayAction && (
        <Link href={displayAction.link}>
          <button className="bg-[#F02C56] hover:bg-[#d9254a] text-white font-medium py-2 px-6 rounded-full transition-colors">
            {displayAction.text}
          </button>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
