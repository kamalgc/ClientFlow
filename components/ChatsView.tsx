"use client";

import React, { useState } from "react";
import { Search, Paperclip, Image, Send, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";

// Mock data for chats
const mockChats = [
  {
    id: 1,
    name: "William Smith",
    lastMessage:
      "Hi team, just a reminder about our meeting tomorrow at 10 AM. Please come prepared wi...",
    time: "4 hours",
    unread: true,
    avatar: "WS",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    lastMessage:
      "Thanks for the update! I'll review the documents and get back to you by EOD.",
    time: "Yesterday",
    unread: false,
    avatar: "SJ",
  },
  {
    id: 3,
    name: "Mike Chen",
    lastMessage:
      "The project timeline looks good. Let's schedule a call to discuss the next steps.",
    time: "2 days ago",
    unread: false,
    avatar: "MC",
  },
  {
    id: 4,
    name: "Emma Davis",
    lastMessage: "Perfect! I've sent over the contracts for your review.",
    time: "3 days ago",
    unread: false,
    avatar: "ED",
  },
];

// Mock messages
const mockMessages = [
  {
    id: 1,
    sender: "William Smith",
    content:
      "Hi team, just a reminder about our meeting tomorrow at 10 AM. Please come prepared with your project updates.",
    time: "10:23 AM",
    isOwn: false,
    avatar: "WS",
  },
  {
    id: 2,
    sender: "You",
    content: "Thanks for the reminder! I'll have everything ready.",
    time: "10:25 AM",
    isOwn: true,
    avatar: "ME",
  },
  {
    id: 3,
    sender: "William Smith",
    content: "Great! Looking forward to seeing everyone there.",
    time: "10:26 AM",
    isOwn: false,
    avatar: "WS",
  },
];

export function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "You",
        content: messageInput,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        isOwn: true,
        avatar: "ME",
      };
      setMessages([...messages, newMessage]);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <SidebarInset>
      <div className="flex h-screen bg-white">
        {/* Left Panel - Inbox */}
        <div className="flex w-[400px] flex-col border-r border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Unreads</span>
                <div className="relative">
                  <div className="h-6 w-12 cursor-pointer rounded-full bg-gray-200 transition-colors">
                    <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Type to search"
                className="border-gray-200 bg-gray-50 pl-10 focus:bg-white"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {mockChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer px-6 py-4 transition-colors hover:bg-gray-50 ${
                  selectedChat.id === chat.id ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                    {chat.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {chat.name}
                      </h3>
                      <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                        {chat.time}
                      </span>
                    </div>
                    <p className="truncate text-sm text-gray-600">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Messages */}
        <div className="flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <Button variant="ghost" size="sm" className="text-gray-600">
                Tell me more
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.isOwn ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                  {message.avatar}
                </div>
                <div
                  className={`flex max-w-[70%] flex-col ${
                    message.isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.time}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.isOwn
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 px-8 py-6">
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type.."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 pr-24 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    type="button"
                  >
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    type="button"
                  >
                    <Image className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    type="button"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 hover:bg-gray-800"
                type="button"
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}