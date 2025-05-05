import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";
import fs from 'fs/promises'; // Import Node.js file system module (promises version)
import path from 'path'; // Import Node.js path module

// Ensure the API key is loaded from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("Gemini API Key not found in environment variables.");
}

// Initialize the Google Generative AI client (only if key exists)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }) : null;

// Define safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Define a system instruction (less critical now context is provided, but good practice)
const systemInstruction = {
    role: "system", // Note: 'system' role might not be directly supported by all generateContent methods/models. Often included as part of the first 'user' turn or specific API parameters. We'll include it in the user prompt for broader compatibility.
    parts: [{ text: "You are a helpful customer support assistant for the Innovita website. Answer the user's question based *only* on the provided context document. If the answer is not found in the context, politely state that you don't have that specific information." }]
};

// Function to read knowledge base content
async function getKnowledgeBaseContent(): Promise<string> {
    try {
        // Construct the full path to the file relative to the project root
        const filePath = path.join(process.cwd(), 'knowledge_base', 'help_info.txt');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return fileContent;
    } catch (error) {
        console.error("Error reading knowledge base file:", error);
        return "Error: Could not load help information."; // Provide fallback content on error
    }
}

export async function POST(request: Request) {
    if (!model) {
        return NextResponse.json({ error: "AI model not initialized. Check API Key." }, { status: 500 });
    }

    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // 1. Get Knowledge Base Content
        const knowledgeContext = await getKnowledgeBaseContent();
        if (knowledgeContext.startsWith("Error:")) {
             // Optionally return error if KB is essential, or let Gemini try without it
             console.warn("Proceeding without knowledge base due to read error.");
             // return NextResponse.json({ error: "Could not load necessary help information." }, { status: 500 });
        }

        // 2. Construct the augmented prompt
        const augmentedPrompt = `
Context document about the Innovita website:
---
${knowledgeContext}
---

Based *only* on the context document above, answer the following user question concisely and politely. If the answer is not found in the context, state that you don't have that specific information.

User Question: ${message}
`;

        console.log("Sending augmented prompt to Gemini..."); // Avoid logging the full prompt in production if context is large/sensitive

         const generationConfig = {
             temperature: 0.5, // Lower temperature for more factual answers based on context
             topK: 1,
             topP: 1,
             maxOutputTokens: 512, // Adjust as needed
         };

         // We send the system instruction implicitly via the augmented prompt structure
         const contents: Content[] = [
             { role: "user", parts: [{ text: augmentedPrompt }] }
         ];

         const result = await model.generateContent({
             contents: contents,
             generationConfig,
             safetySettings,
         });

        if (!result.response) {
             console.error("Gemini API call failed: No response object.");
             return NextResponse.json({ error: "AI service failed to respond." }, { status: 500 });
        }

        const responseText = result.response.text();
        console.log("Gemini Response Text:", responseText);

        return NextResponse.json({ reply: responseText });

    } catch (error: any) {
        console.error("Error in /api/chat:", error);
        return NextResponse.json({ error: `An internal server error occurred: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}