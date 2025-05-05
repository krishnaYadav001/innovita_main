'use client';

import React, { useState } from 'react'
import { BiLoaderCircle } from "react-icons/bi"
import dynamic from 'next/dynamic';
import RichTextDisplay from "./RichTextDisplay"

// Dynamically import RichTextEditor with no SSR
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
});

interface EditorModalProps {
    isSaving: boolean;
    handleSaveContent: (content: string) => void;
    setIsEditorOpen: (isOpen: boolean) => void;
    editingContent: string | undefined;
    currentUser: string;
    contentOwner: string;
    isAuthor: boolean;
}

const EditorModal: React.FC<EditorModalProps> = ({ isSaving, handleSaveContent, setIsEditorOpen, editingContent, currentUser, contentOwner, isAuthor }) => {
    const noOp = () => {};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isAuthor ? "Edit Rich Text Content" : "View Rich Text Content"}</h2>
                {isSaving ? (
                    <div className="flex justify-center items-center h-[300px]">
                        <BiLoaderCircle className="animate-spin" size="40"/>
                    </div>
                ) : isAuthor ? (
                    <RichTextEditor onSave={handleSaveContent} initialContent={editingContent} readOnly={false} />
                ) : (
                    <RichTextDisplay
                        content={editingContent}
                        defaultMessage="The author hasn't added any additional content to this post yet."
                    />
                )}
                <button
                    onClick={() => setIsEditorOpen(false)}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                    {isAuthor ? "Cancel" : "Close"}
                </button>
            </div>
        </div>
    )
}

export default EditorModal;
