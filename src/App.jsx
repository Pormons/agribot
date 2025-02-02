import { useState, useRef, useEffect } from "react"

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, []) // Updated useEffect dependency

  const sendMessage = async () => {
    if (input.trim() === "") return

    const newMessage = { text: input, sender: "user" }
    setMessages([...messages, newMessage])
    setInput("")
    setIsLoading(true)

    try {
      const formdata = new FormData()
      formdata.append("question", input)
      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
      }

      const response = await fetch("https://pormonzkie-agrichat.hf.space/ask", requestOptions)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      const botMessage = { text: data.answer, sender: "bot" }
      setMessages((prevMessages) => [...prevMessages, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = { text: "Sorry, I encountered an error.", sender: "bot" }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-md min-w-sm bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === "user" ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <span className="text-white text-sm font-semibold">{msg.sender === "user" ? "U" : "B"}</span>
                </div>
                <div
                  className={`rounded-lg p-3 ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-semibold">B</span>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 absolute z-50 bottom-0 left-0 max-w-md min-w-sm bg-white p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex space-x-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-500 text-white rounded-md px-4 py-2 flex items-center justify-center transition-colors duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App

