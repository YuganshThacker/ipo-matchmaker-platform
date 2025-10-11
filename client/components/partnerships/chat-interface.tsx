"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  MessageSquare, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical,
  Clock,
  Check,
  CheckCheck
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  connectionId: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  content: string
  timestamp: string
  readBy: string[]
}

interface MessageThread {
  connectionId: string
  participants: {
    userId: string
    userName: string
  }[]
  messages: Message[]
  lastActivity: string
}

interface Connection {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  status: string
  createdAt: string
}

interface ChatInterfaceProps {
  connections: Connection[]
  onBack: () => void
  initialConnectionId?: string
}

export function ChatInterface({ connections, onBack, initialConnectionId }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Fetch all message threads
  const fetchThreads = async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads || [])
        
        // Calculate unread counts
        const counts: Record<string, number> = {}
        data.threads?.forEach((thread: MessageThread) => {
          const unreadCount = thread.messages.filter(msg => 
            msg.toUserId === user.id && !msg.readBy.includes(user.id)
          ).length
          counts[thread.connectionId] = unreadCount
        })
        setUnreadCounts(counts)
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
    }
  }

  // Fetch specific thread messages
  const fetchThread = async (connectionId: string) => {
    if (!user) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/messages?connectionId=${connectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedThread(data.thread)
        
        // Mark messages as read
        if (data.thread.messages.length > 0) {
          await markAsRead(connectionId)
        }
      }
    } catch (error) {
      console.error("Error fetching thread:", error)
    } finally {
      setLoading(false)
    }
  }

  // Send a message
  const sendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim() || sending) return
    
    setSending(true)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          connectionId: selectedThread.connectionId,
          content: newMessage.trim()
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Add message to current thread
        setSelectedThread(prev => {
          if (!prev) return null
          return {
            ...prev,
            messages: [...prev.messages, data.message],
            lastActivity: data.message.timestamp
          }
        })
        
        setNewMessage("")
        
        // Refresh threads list to update last activity
        fetchThreads()
        
        // Auto-scroll to bottom
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  // Mark messages as read
  const markAsRead = async (connectionId: string) => {
    if (!user) return
    
    try {
      const token = localStorage.getItem("auth-token")
      await fetch("/api/messages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ connectionId })
      })
      
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [connectionId]: 0
      }))
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  // Initial load and polling for new messages
  useEffect(() => {
    fetchThreads()
    
    // If initial connection ID is provided, open that thread
    if (initialConnectionId) {
      fetchThread(initialConnectionId)
    }
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchThreads, 3000)
    return () => clearInterval(interval)
  }, [user, initialConnectionId])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (selectedThread) {
      setTimeout(scrollToBottom, 100)
    }
  }, [selectedThread?.messages?.length])

  // Handle Enter key in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Get other participant in conversation
  const getOtherParticipant = (thread: MessageThread) => {
    return thread.participants.find(p => p.userId !== user?.id)
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get connection for thread
  const getConnectionForThread = (thread: MessageThread) => {
    return connections.find(c => c.id === thread.connectionId)
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Please log in to access messages</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-[600px] flex bg-background border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className={`${selectedThread ? 'hidden md:block md:w-1/3' : 'w-full'} border-r`}>
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold">Messages</h3>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(600px-73px)]">
          {connections.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No connections yet. Connect with investors in the Discover tab to start messaging!
              </p>
            </div>
          ) : (
            <div className="p-2">
              {connections.map((connection) => {
                const thread = threads.find(t => t.connectionId === connection.id)
                const otherUser = connection.fromUserId === user.id 
                  ? { id: connection.toUserId, name: connection.toUserName }
                  : { id: connection.fromUserId, name: connection.fromUserName }
                const unreadCount = unreadCounts[connection.id] || 0
                const lastMessage = thread?.messages[thread.messages.length - 1]
                
                return (
                  <motion.div
                    key={connection.id}
                    whileHover={{ backgroundColor: "hsl(var(--muted))" }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedThread?.connectionId === connection.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => fetchThread(connection.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {otherUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{otherUser.name}</p>
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">
                            {lastMessage 
                              ? `${lastMessage.fromUserId === user.id ? 'You: ' : ''}${lastMessage.content}`
                              : 'No messages yet'
                            }
                          </p>
                          {unreadCount > 0 && (
                            <Badge variant="default" className="h-5 min-w-[20px] text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Window */}
      {selectedThread ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  onClick={() => setSelectedThread(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getOtherParticipant(selectedThread)?.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="font-semibold text-sm">
                    {getOtherParticipant(selectedThread)?.userName}
                  </h4>
                  <p className="text-xs text-muted-foreground">Connected partner</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {selectedThread.messages.map((message) => {
                  const isOwnMessage = message.fromUserId === user.id
                  const isRead = message.readBy.length > 1 // More than just sender
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        isOwnMessage 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      } rounded-lg p-3`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {isOwnMessage && (
                            <div className="text-xs opacity-70">
                              {isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              
              {selectedThread.messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                disabled={sending}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a connection from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
