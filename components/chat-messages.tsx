import type { ChatMessage, QueryResult } from "@/lib/types"
import { User, Database, Clock } from "lucide-react"

interface ChatMessagesProps {
  messages: ChatMessage[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
        <Database size={48} className="mb-4 opacity-50" />
        <p>No queries yet. Start by asking a question or running a SQL query.</p>
      </div>
    )
  }

  // Group messages by conversation
  const conversations: ChatMessage[][] = []
  let currentConversation: ChatMessage[] = []

  messages.forEach((message, index) => {
    // Start a new conversation if this is a user message and the previous message was also from a user
    if (message.role === "user" && index > 0 && messages[index - 1].role === "user") {
      if (currentConversation.length > 0) {
        conversations.push([...currentConversation])
        currentConversation = []
      }
    }

    currentConversation.push(message)

    // If this is the last message or the next message is from a user, end the conversation
    if (
      index === messages.length - 1 ||
      (index < messages.length - 1 && messages[index + 1].role === "user" && message.role === "assistant")
    ) {
      conversations.push([...currentConversation])
      currentConversation = []
    }
  })

  return (
    <div className="space-y-8">
      {conversations.map((conversation, i) => (
        <div key={i} className="bg-[#1a1a1a] rounded-lg p-4 shadow-md">
          {conversation.map((message) => (
            <div key={message.id} className={`mb-4 last:mb-0`}>
              <div
                className={`flex items-center gap-2 mb-2 ${message.role === "user" ? "text-primary" : "text-gray-300"}`}
              >
                {message.role === "user" ? (
                  <>
                    <User size={16} />
                    <span className="font-medium">You</span>
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    <span className="font-medium">Assistant</span>
                  </>
                )}
                <span className="text-xs text-gray-500 flex items-center ml-auto">
                  <Clock size={12} className="mr-1" />
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className={`pl-6 ${message.role === "assistant" ? "text-gray-100" : ""}`}>
                {message.type === "text" && <div>{message.content}</div>}

                {message.type === "sql" && (
                  <div className="font-mono text-sm bg-[#1a1a1a] p-3 rounded overflow-x-auto border border-[#3a3a3a]">
                    {message.content}
                  </div>
                )}

                {message.type === "result" && (
                  <div>{message.content }</div>
                )}

                {message.type === "error" && <div className="text-red-400">{message.content}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

interface ResultTableProps {
  result: QueryResult
}

function ResultTable({ result }: ResultTableProps) {
  if (!result.rows || result.rows.length === 0) {
    return <div className="text-gray-400">No results found</div>
  }

  return (
    <div className="overflow-x-auto mt-2 border border-[#3a3a3a] rounded-md">
      <table className="min-w-full divide-y divide-[#3a3a3a]">
        <thead className="bg-[#2a2a2a]">
          <tr>
            {result.columns.map((column, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3a3a3a] bg-[#1a1a1a]">
          {result.rows.map((row, i) => (
            <tr key={i}>
              {result.columns.map((column, j) => (
                <td key={j} className="px-3 py-2 text-sm">
                  {row[column] !== null ? String(row[column]) : "NULL"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

