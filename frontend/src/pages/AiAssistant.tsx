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
import { useGamification } from "../context/GamificationContext";
import { useAuthFetch } from "../utils/useAuthFetch";

interface SourceInfo {
    document_id: string;
    filename: string;
    tags: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: SourceInfo[];
    isStreaming?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AiAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! How can I assist you today with company policies, procedures, or products?",
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");

    const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());
    const [isOpeningDocument, setIsOpeningDocument] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
        
    const { user } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { trackActivity } = useGamification();
    const { authFetch } = useAuthFetch();

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Add userMessage to messages array
        const userMessage: Message = {
            role: "user",
            content: input
        };

        const questionText = input; // For tracking question_asked
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setStreamingContent("");

        const startTime = Date.now();

        // Abort controller for request cancellation
        abortControllerRef.current = new AbortController();

        try {
            const response = await authFetch(`${API_BASE_URL}/api/chat-streaming`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: questionText }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response is streaming (SSE)
            const contentType = response.headers.get("content-type");
            const isStreamResponse = contentType?.includes("text/event-stream");

            if (isStreamResponse) {
                // Handle streaming response
                await handleStreamingResponse(response, questionText, startTime);
            } else {
                // Handle non-streaming (regular JSON) response
                await handleRegularResponse(response, questionText, startTime);
            }

        } catch (error: any) {
            const endTime = Date.now();
            const responseTimeMs = endTime - startTime;
            
            if (error.name === "AbortError") {
                console.log("Request cancelled by user");
            } else {
                console.error("Chat error:", error);

                // Track failed activity
                if (user?.id) {
                    await trackActivity("question_asked", {
                        question: questionText,
                        response_time_ms: responseTimeMs,
                        success: false,
                        sources_count: 0,
                        timestamp: new Date().toISOString()
                    });
                }

                setMessages(prev => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Sorry, I encountered an error. Please try again."
                    }
                ]);
            }
        } finally {
            setIsLoading(false);
            setStreamingContent("");
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    // Handle SSE streaming response
    const handleStreamingResponse = async (response: Response, questionText: string, startTime: number) => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let fullContent = "";
        let sources: SourceInfo[] = [];
        let firstTokenTime: number | null = null;

        if (reader) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const jsonStr = line.slice(6).trim();
                                if (!jsonStr) continue;

                                const data = JSON.parse(jsonStr);

                                // Track time to first token
                                if (data.content && !firstTokenTime) {
                                    firstTokenTime = Date.now();
                                }

                                // Accumulate streaming content
                                if (data.content) {
                                    fullContent += data.content;
                                    setStreamingContent(fullContent);
                                }

                                // Capture sources
                                if (data.sources) {
                                    sources = data.sources;
                                }

                                // Finalise when done
                                if (data.done) {
                                    const endTime = Date.now();
                                    const responseTimeMs = endTime - startTime;
                                    const timeToFirstToken = firstTokenTime ? firstTokenTime - startTime : responseTimeMs;

                                    // Track successful activity
                                    if (user?.id) {
                                        await trackActivity("question_asked", {
                                            question: questionText,
                                            response_time_ms: responseTimeMs,
                                            time_to_first_token_ms: timeToFirstToken,
                                            success: sources.length > 0,
                                            sources_count: sources.length,
                                            streaming: true,
                                            timestamp: new Date().toISOString()
                                        });
                                    }

                                    // Add final message to chat
                                    setMessages(prev => [...prev, {
                                        role: "assistant",
                                        content: fullContent,
                                        sources: sources
                                    }]);

                                    setStreamingContent("");
                                }
                            } catch (parseError) {
                                console.error("Error parsing SSE data:", parseError);
                            }
                        }
                    }
                }
            } catch (readError) {
                console.error("Error reading stream:", readError);
                throw readError;
            }
        }
    };

    // Handle regular JSON response (fallback)
    const handleRegularResponse = async (response: Response, questionText: string, startTime: number) => {
        const endTime = Date.now();
        const responseTimeMs = endTime - startTime;

        const data = await response.json();

        // Track question_asked activity
        if (user?.id) {
            await trackActivity("question_asked", {
                question: questionText,
                response_time_ms: responseTimeMs,
                success: data.sources?.length > 0,
                sources_count: data.sources?.length || 0,
                streaming: false,
                timestamp: new Date().toISOString()
            });
        }

        // Update messages array with AI response
        const assistantMessage: Message = {
            role: "assistant",
            content: data.response,
            sources: data.sources || []
        };

        setMessages(prev => [...prev, assistantMessage]);
    };

    // Open source document in new tab
    const handleDocumentClick = async (documentId: string) => {
        setIsOpeningDocument(true);
        
        try {
            const response = await authFetch(`${API_BASE_URL}/api/documents/${documentId}/download`);

            if (response.ok) {
                // Create blob and open in new tab
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");

                // Cleanup blob url after a delay
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            } else {
                const error = await response.json();
                console.error("Failed to open document:", error);
                alert("Failed to open document");
            }
        } catch (error) {
            console.error("Error opening document:", error);
            alert("Failed to open document. Please try again.");
        } finally {
            setIsOpeningDocument(false);
        }
    };

    // Bookmark source document (toggle bookmark)
    const handleBookmarkToggle = async (e: React.MouseEvent, documentId: string) => {
        // Prevent opening document when clicking bookmark
        e.stopPropagation();

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

    // Scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

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

        document.addEventListener("keydown", handleGlobalKeyDown);
        return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isLoading]);

    return (
        <div className="flex flex-col h-full w-full border rounded-lg bg-els-mainpanelbackground p-3">
            {/* Header */}
            <h1 className="border-b pb-2 pl-2 text-xl font-bold">
                AI Learning Assistant
            </h1>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Maps over the messages array to render each message */}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-2 py-2 ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
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
                                                <button
                                                    className="flex items-start gap-2 flex-1 cursor-pointer min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handleDocumentClick(source.document_id)}
                                                    disabled={isOpeningDocument}
                                                >
                                                    <FontAwesomeIcon 
                                                        icon={faFileText} 
                                                        className="w-3 h-3 text-blue-600 flex-shrink-0 mt-1" 
                                                    />
                                                    <div className="flex flex-col items-start min-w-0 flex-1">
                                                        <span className="text-start text-xs font-semibold text-gray-800">
                                                            {source.filename}
                                                        </span>
                                                        {source.tags && (
                                                            <span className="text-xs text-gray-500 break-all">
                                                                {source.tags}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>

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

                {/* Streaming message */}
                {isLoading && streamingContent && (
                    <div className="flex items-start gap-2 py-2 justify-start">
                        <div className="flex-shrink-0">
                            <RobotAvatar/>
                        </div>
                        <div className="min-w-0 max-w-md px-4 py-2 rounded-lg text-sm bg-els-chatrobot break-words">
                            {streamingContent}
                            <span className="inline-block w-1 h-4 bg-gray-600 ml-1 animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingContent && (
                    <div className="flex items-center gap-2 py-2 justify-start">
                        <RobotAvatar/>
                        <div className="max-w-md px-4 py-2 rounded-lg text-sm bg-els-chatrobot">
                            Thinking...
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
                        className="flex-1 border rounded-lg px-4 py-2 text-sm bg-els-secondarybackground focus:outline-none min-w-0"
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