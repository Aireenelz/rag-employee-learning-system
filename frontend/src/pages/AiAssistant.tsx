import { useState } from "react";
import RobotAvatar from "../components/RobotAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I assist you today with company policies, procedures, or products?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call backend API
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      // Add AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not connect to the AI. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full border rounded-lg bg-els-mainpanelbackground p-3">
      {/* Header */}
      <h1 className="border-b pb-3 text-lg font-semibold">
        AI Learning Assistant
      </h1>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && <RobotAvatar />}
            <div
              className={`max-w-md px-4 py-2 rounded-lg text-sm ${
                msg.role === "user"
                  ? "bg-els-chatuser text-white rounded-br-none"
                  : "bg-els-chatrobot border rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user"}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 justify-start">
            <RobotAvatar />
            <div className="max-w-md px-4 py-2 rounded-lg text-sm bg-els-chatrobot border rounded-bl-none">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline bg-els-secondarybackground"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about company policies, procedures, products..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="bg-els-primarybutton text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;