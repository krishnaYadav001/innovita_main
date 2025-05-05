'use client';

import React, { useEffect, useRef, useState } from 'react';
import type QuillType from 'quill'; // Import Quill type only
import 'quill/dist/quill.snow.css'; // Import CSS directly

interface RichTextEditorProps {
  onSave: (content: string) => void;
  initialContent?: string;
  readOnly?: boolean; // Add readOnly prop
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ onSave, initialContent, readOnly }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [quillInstance, setQuillInstance] = useState<QuillType | null>(null); // Use QuillType

  useEffect(() => {
    // Initialize Quill only on the client side after component mounts
    if (typeof window !== 'undefined' && editorRef.current && !quillInstance) {
      import('quill').then((QuillModule) => {
        const Quill = QuillModule.default; // Access the default export which is the Quill constructor
        const quill = new Quill(editorRef.current!, { // Use non-null assertion for editorRef
          theme: 'snow',
          modules: {
            toolbar: readOnly ? false : [
              ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],               // custom button values
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],     // superscript/subscript
              [{ 'indent': '-1' }, { 'indent': '+1' }],         // outdent/indent
              [{ 'direction': 'rtl' }],                         // text direction
              [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['link', 'image', 'video'],                       // link and image, video
              ['clean']                                         // remove formatting button
            ]
          },
          placeholder: readOnly ? '' : 'Compose your content here...', // Remove placeholder in read-only mode
          readOnly: readOnly
        });
        setQuillInstance(quill);
      }).catch(error => {
        console.error("Failed to load Quill:", error);
        // Handle the error appropriately, maybe show a message to the user
      });
    }

    // Cleanup function to destroy Quill instance when component unmounts
    return () => {
      if (quillInstance) {
        // Check if quillInstance has a destroy method before calling it
        // This check might be overly cautious depending on Quill's API guarantees
        // but prevents potential runtime errors if the instance is somehow malformed.
        if (typeof (quillInstance as any).destroy === 'function') {
           // Quill's API might not have a standard 'destroy'. Common practice is to remove listeners
           // or manage the instance lifecycle as needed. If Quill has a specific cleanup method, use it here.
           // For now, we'll just nullify the reference in state, assuming GC handles the rest.
           // If memory leaks occur, specific Quill cleanup steps might be needed.
           // Example: (quillInstance as any).destroy?.();
        }
        setQuillInstance(null); // Clear instance on unmount
      }
    };
  }, [readOnly]); // Dependency array: only re-run if readOnly changes. editorRef and quillInstance refs/state handled internally.

  useEffect(() => {
    if (typeof window !== 'undefined' && quillInstance && initialContent) {
      quillInstance.root.innerHTML = initialContent;
    }
  }, [quillInstance, initialContent]);

  const handleSave = () => {
    if (typeof window !== 'undefined' && quillInstance) {
      const content = quillInstance.root.innerHTML;
      if (content && content !== '<p><br></p>') {
        onSave(content);
      } else {
        alert('Please add some content before saving');
      }
    }
  };

  return (
    <div className="rich-text-editor">
      <div ref={editorRef} style={{ height: '300px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }}></div>
      {!readOnly && (
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#F02C56] text-white rounded-lg hover:bg-opacity-90 transition"
        >
          Save Content
        </button>
      )}
    </div>
  );
};

export default RichTextEditor;
