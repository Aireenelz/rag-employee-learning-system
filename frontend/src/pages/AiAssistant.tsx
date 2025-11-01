import { useState, useRef, useEffect } from "react";
import RobotAvatar from "../components/RobotAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileText, 
    faPaperPlane, 
    faBookmark 
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../context/BookmarkContext";

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
    const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
        
    const { user } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();

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

    // Open source document in new tab
    const handleDocumentClick = (documentId: string) => {
        const documentUrl = `${API_BASE_URL}/api/documents/${documentId}/download`;
        window.open(documentUrl, '_blank');
    };

    // Bookmark source document (toggle bookmark)
    const handleBookmarkToggle = async (e: React.MouseEvent, documentId: string) => {
        // Prevent opening document when clicking bookmark
        e.stopPropagation()

        if (!user?.id) {
            alert("Please sign in to bookmark documents");
            return;
        }

        // Prevent multiple simultaneous requests
        if (bookmarkLoading.has(documentId)) return;
        
        setBookmarkLoading(prev => new Set(prev).add(documentId));

        try {
            await toggleBookmark(documentId);
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            alert("Failed to update bookmark. Please try again.");
        } finally {
            // Remove from loading set
            setBookmarkLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(documentId);
                return newSet;
            });
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
                            className={`min-w-0 max-w-md px-4 py-2 rounded-lg text-sm break-words ${
                                msg.role === "user" 
                                ? "bg-els-chatuser text-white rounded-lg" 
                                : "bg-els-chatrobot rounded-lg"
                            }`}
                        >
                            {msg.content}

                            {/* Render sources if available */}
                            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-gray-200">
                                    <span className="text-xs text-gray-600 font-semibold block mb-2">
                                        Sources:
                                    </span>
                                    <div className="flex flex-col gap-2">
                                        {msg.sources.map((source, sourceIdx) => (
                                            <div
                                                key={sourceIdx}
                                                className="group flex items-start justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                                            >
                                                {/* Document info - clickable */}
                                                <div
                                                    className="flex items-start gap-2 flex-1 cursor-pointer min-w-0"
                                                    onClick={() => handleDocumentClick(source.document_id)}
                                                >
                                                    <FontAwesomeIcon icon={faFileText} className="w-3 h-3 text-blue-600 flex-shrink-0 mt-1" />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-xs font-semibold text-gray-800">
                                                            {source.filename}
                                                        </span>
                                                        {source.tags && (
                                                            <span className="text-xs text-gray-500 break-all">
                                                                {source.tags}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bookmark button */}
                                                <button
                                                    onClick={(e) => handleBookmarkToggle(e, source.document_id)}
                                                    disabled={bookmarkLoading.has(source.document_id)}
                                                    className="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
                                                    title={isBookmarked(source.document_id) ? "Remove bookmark" : "Bookmark this document"}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faBookmark}
                                                        className={`w-3 h-3 transition-colors ${
                                                            bookmarkLoading.has(source.document_id)
                                                                ? "text-gray-400"
                                                                : isBookmarked(source.document_id)
                                                                    ? "text-yellow-400"
                                                                    : "text-gray-400 hover:text-yellow-400"
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Render "Typing..." if API request is being processed */}
                {isLoading && (
                    <div className="flex items-center gap-2 py-2 justify-start">
                        <RobotAvatar/>
                        <div className="w-full sm:max-w-md px-4 py-2 rounded-lg text-sm bg-els-chatrobot rounded-lg">
                            Typing...
                        </div>
                    </div>
                )}

                {/* Placeholder div to trigger scroll */}
                <div ref={messagesEndRef}/>
            </div>

            {/* Input field */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        className="flex-1 border rounded-lg px-4 py-2 text-sm bg-els-secondarybackground focus: outline-none min-w-0"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about company policies, procedures, products..."
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        className="bg-els-primarybutton text-white px-4 py-2 rounded-lg hover:bg-els-primarybuttonhover disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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