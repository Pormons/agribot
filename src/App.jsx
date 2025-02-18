"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      // Add user's message to the chat
      const newMessage = {
        id: String(messages.length + 1),
        role: "user",
        content: replyTo ? `Replying to: "${replyTo.content.substring(0, 50)}..."\n\n${input}` : input,
      };
      setMessages([...messages, newMessage]);
      setInput("");
      setIsTyping(true);
      setReplyTo(null);

      try {
        // Send the user's message to the API
        const response = await fetch(import.meta.env.VITE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: newMessage.content, // Pass the user's message as "query"
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response from the server.");
        }

        // Parse the API response
        const data = await response.json();

        // Extract the bot's reply from the API response
        const botReply = {
          id: String(messages.length + 2),
          role: "assistant",
          content: data.answer || "Sorry, I couldn't process that.", // Use the "answer" field from the API
        };

        // Add the bot's reply to the chat
        setMessages((prev) => [...prev, botReply]);
      } catch (error) {
        console.error("Error fetching response:", error);

        // Add an error message to the chat if the API fails
        const errorMessage = {
          id: String(messages.length + 2),
          role: "assistant",
          content: "Oops! Something went wrong. Please try again later.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false); // Stop the typing indicator
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto p-4 sm:p-6 sm:max-w-2xl sm:mx-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center mt-24 justify-center h-full text-center"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-green-100 flex items-center justify-center animate-float">
                  <Sparkles className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Welcome to Agri-Bot!</h2>
                <p className="text-gray-600 mb-4">Start your conversation with our friendly chatbot.</p>
                <p className="text-lg font-medium text-green-500">Try saying &quot;Hi&quot; or asking a question!</p>
              </motion.div>
            )}
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`p-3 rounded-lg ${message.role === "user" ? "bg-green-500 text-white" : "bg-white border border-green-200"
                      }`}
                  >
                    {message.content}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-green-700" />
                  </div>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="p-3 rounded-lg bg-white border border-green-200">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <span className="text-green-500 text-xl">...</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <div className="bg-white border-t border-green-200 p-4 sm:p-6 sm:max-w-2xl sm:mx-auto w-full">
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2 p-2 bg-green-100 rounded-md text-sm text-green-700 flex items-center justify-between"
            >
              <span className="truncate">Replying to: {replyTo.content.substring(0, 50)}...</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
                className="text-green-700 hover:text-green-800 shrink-0"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border-green-200 focus:ring-green-500 focus:border-green-500"
          />
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}