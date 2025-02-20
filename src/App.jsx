"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatePresence, motion } from "framer-motion"
import { Send, Sparkles, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Header from "./components/navbar"
import useLanguageStore from "./store/LanguageStore"
import useAuthStore from "./store/useAuthStore"
import { supabase } from "@/lib/supabase"
import { Client } from "@gradio/client";
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function App() {
  const setSignedIn = useAuthStore(state => state.setSignedIn);
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const language = useLanguageStore(state => state.language);
  const gen = useLanguageStore(state => state.gen);

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => scrollToBottom(), [messages])

  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (data.user) { // Check if `user` exists and has a valid `id`
      console.log('true', data.user);

      const { data: history, error: history_error } = await supabase.from('Conversations').select("*").eq('user_uid', data.user.id).order('created_at', {
        ascending: true
      })

      setMessages(history);
      console.log(history)
      setSignedIn(true);
    } else {
      console.log('false', data.user);
      setSignedIn(false);
    }
  }


  useEffect(() => {
    checkAuth()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (input.trim()) {

      const { data: user_data, error: user_error } = await supabase.auth.getUser();


      try {
        let newMessage;
        if (user_data.user) {
          const { data, error } = await supabase
            .from('Conversations')
            .insert([
              { role: 'user', content: input, user_uid: user_data.user.id },
            ])
            .select('*')

          if (error) {
            console.log('user error', error);
          }

          if (data) {
            newMessage = data[0];
          }
        } else {
          newMessage = {
            id: String(messages.length + 1),
            role: "user",
            content: input,
          }
        }

        setMessages([...messages, newMessage])
        setInput("")
        setIsTyping(true)


        let data;
        if (gen) {
          const client = await Client.connect("Qwen/Qwen2.5-Max-Demo");
          const result = await client.predict("/model_chat", {
            query: input,
            history: [],
            system: `You are a friendly Farmer Chatbot based in the Philippines, Who Speaks ${language}, Youre only knowledge is about Farming, all query that are not related to farming will be ignored or be asked again`,
          });

          data = result.data[1][0][1]
        } else {
          const response = await fetch(`${import.meta.env.VITE_URL}/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: newMessage.content,
              language: language,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to fetch response from the server.")
          }
          const bt = await response.json()
          data = bt.answer;
        }



        let botReply;
        if (user_data.user) {
          const { data: bot, error } = await supabase
            .from('Conversations')
            .insert([
              { role: 'assistant', content: data || "Sorry, I couldn't process that.", user_uid: user_data.user.id },
            ])
            .select('*')

          if (error) {
            console.log('user error', error);
          }

          if (data) {
            console.log('bot', bot[0])
            botReply = bot[0];
          }
        } else {
          botReply = {
            id: String(messages.length + 2),
            role: "assistant",
            content: data || "Sorry, I couldn't process that.",
          }
        }

        setMessages((prev) => [...prev, botReply])
      } catch (error) {

        let error_message;
        if (user_data.user) {
          const { data, error } = await supabase
            .from('Conversations')
            .insert([
              { role: 'assistant', content: "Oops! Something went wrong. Please try again later.", user_uid: user_data.user.id },
            ])
            .select('*')

          if (error) {
            console.log('user error', error);
          }

          if (data) {
            error_message = data[0];
          }
        } else {
          error_message = {
            id: String(messages.length + 2),
            role: "assistant",
            content: "Oops! Something went wrong. Please try again later.",
          }
        }
        console.error("Error fetching response:", error)
        setMessages((prev) => [...prev, error_message])
      } finally {
        setIsTyping(false)
      }
    }
  }



  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow overflow-hidden bg-gradient-to-br from-green-50 to-white">
        <div className="h-full overflow-y-auto p-4 sm:p-6 sm:max-w-2xl sm:mx-auto mt-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col grow items-center justify-center h-full text-center"
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
                    <Markdown remarkPlugins={[remarkGfm]}>

                      {message.content}
                    </Markdown>

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
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
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
  )
}

