'use client';

import React from 'react';
import { FaEdit, FaEye } from 'react-icons/fa';

interface RichTextPreviewButtonProps {
  onClick: () => void;
  hasContent: boolean;
  isAuthor: boolean;
  layout?: 'vertical' | 'horizontal';
}

const RichTextPreviewButton: React.FC<RichTextPreviewButtonProps> = ({
  onClick,
  hasContent,
  isAuthor,
  layout = 'vertical'
}) => {
  // Determine the icon and tooltip based on content and authorship
  const icon = isAuthor ? <FaEdit size="22" className="text-white" /> : <FaEye size="22" className="text-white" />;

  // Determine the tooltip text
  let tooltipText = '';
  if (isAuthor) {
    tooltipText = hasContent ? 'Edit additional content' : 'Add additional content';
  } else {
    tooltipText = hasContent ? 'View additional content' : 'No additional content';
  }

  // Determine button style based on content
  const buttonStyle = hasContent
    ? "rounded-full bg-[#F02C56] bg-opacity-90 p-3 cursor-pointer hover:bg-opacity-100 transition-opacity duration-200 flex items-center justify-center"
    : "rounded-full bg-gray-900 bg-opacity-70 p-3 cursor-pointer hover:bg-opacity-90 transition-opacity duration-200 flex items-center justify-center";

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center`}
        aria-label={tooltipText}
      >
        <div className={buttonStyle}>
          {icon}
        </div>

        {/* Optional indicator for content presence */}
        {hasContent && (
          <span className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></span>
        )}
      </button>

      {/* Tooltip removed - now using the Tooltip component wrapper */}
    </div>
  );
};

export default RichTextPreviewButton;
