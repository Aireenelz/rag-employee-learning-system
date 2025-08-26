import { useState, useRef, useEffect } from "react";
import RobotAvatar from "../components/RobotAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileText, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface SourceInfo {
    document_id: string;
    filename: string;
    tags: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: SourceInfo[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AiAssistant = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! How can I assist you today with company policies, procedures, or products?",
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Add userMessage to messages array
        const userMessage: Message = {
            role: "user",
            content: input
        }
        setMessages([...messages, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Send POST request to backend API to get AI response
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ message: input}),
            });

            // Parse API response as JSON
            const data = await response.json();

            // Update messages array by adding the AI's response
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.response,
                    sources: data.sources || []
                }
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Error: Could not connect to the AI. Please try again later."
                }
            ]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    // Open document in new tab
    const handleDocumentClick = (documentId: string) => {
        try {
            const documentUrl = `${API_BASE_URL}/api/documents/${documentId}/download`;
            window.open(documentUrl, '_blank');
        } catch (error) {
            console.error("Error opening document:", error);
            alert("Error opening document. Please try again later.");
        }
    };

    // Focus input on component mount and after messages update
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Scroll to the latest message when messages or isLoading changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth"});
    }, [messages, isLoading]);

    // Global keydown handler for auto focus
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Focus input if user starts typing (alphabet/number)
            if (
                !isLoading &&
                inputRef.current &&
                document.activeElement !== inputRef.current &&
                e.key.length === 1 &&
                !e.ctrlKey &&
                !e.altKey &&
                !e.metaKey
            ) {
                inputRef.current.focus();
                setInput(e.key);
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);

    }, [isLoading]);

    return (
        <div className="flex flex-col h-full w-full border rounded-lg bg-els-mainpanelbackground p-3">
            {/* Header */}
            <h1 className="border-b pb-2 pl-2 text-lg font-semibold">
                AI Learning Assistant
            </h1>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* Maps over the messages array to render each message */}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-2 py-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {/* Render robot avatar if role is assistant */}
                        {msg.role === "assistant" && (
                            <div className="flex-shrink-0">
                                <RobotAvatar/>
                            </div>
                        )}

                        {/* Render the message content */}
                        <div
                            className={`max-w-md px-4 py-2 rounded-lg text-sm ${
                                msg.role === "user" 
                                ? "bg-els-chatuser text-white rounded-lg" 
                                : "bg-els-chatrobot rounded-lg"
                            }`}
                        >
                            {msg.content}
                            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1 max-w-md">
                                    <span className="text-xs text-gray-600 mr-1">
                                        Sources:
                                    </span>
                                    {msg.sources.map((source, sourceIdx) => (
                                        <div
                                            key={sourceIdx}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-els-secondarybutton text-blue-800 text-xs rounded-full border border-blue-200 hover:bg-els-secondarybuttonhover transition-colors cursor-pointer"
                                            title={`Click to open in new tab ↗\nSource: ${source.filename}\nTags: ${source.tags}`}
                                            onClick={() => handleDocumentClick(source.document_id)}
                                        >
                                            <FontAwesomeIcon icon={faFileText} className="w-3 h-3" />
                                            <span className="truncate max-w-24">
                                                {source.filename}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Render "Typing..." if API request is being processed */}
                {isLoading && (
                    <div className="flex items-center gap-2 py-2 justify-start">
                        <RobotAvatar/>
                        <div className="max-w-md px-4 py-2 rounded-lg text-sm bg-els-chatrobot rounded-lg">
                            Typing...
                        </div>
                    </div>
                )}

                {/* Placeholder div to trigger scroll */}
                <div ref={messagesEndRef}/>
            </div>

            {/* Input field */}
            <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                    <input
                        ref={inputRef}
                        className="flex-1 border rounded-lg px-4 py-2 text-sm bg-els-secondarybackground"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about company policies, procedures, products..."
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        className="bg-els-primarybutton text-white px-4 py-2 rounded-lg hover:bg-els-primarybuttonhover"
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={faPaperPlane}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiAssistant;