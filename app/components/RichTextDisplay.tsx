'use client';

import React from 'react';

interface RichTextDisplayProps {
  content: string | null | undefined;
  defaultMessage?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  defaultMessage = "No additional content available for this post."
}) => {
  // Check if content is empty, null, undefined, or just a blank paragraph
  const isEmpty = !content || content === '<p><br></p>' || content.trim() === '';

  return (
    <div className="rich-text-display">
      {isEmpty ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">{defaultMessage}</p>
        </div>
      ) : (
        <div
          className="rich-text-content p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
};

export default RichTextDisplay;
