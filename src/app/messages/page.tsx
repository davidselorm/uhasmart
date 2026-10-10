"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Send,
  Loader2,
  Store,
  User,
} from "lucide-react";

interface InquiryThread {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listings: { id: string; title: string; price_ghs: number } | null;
  buyer_profile?: { display_name: string } | null;
  seller_profile?: { display_name: string; business_name: string | null } | null;
}

interface MessageItem {
  id: string;
  inquiry_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export default function MessagesPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<InquiryThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadThreads() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          setLoading(false);
          return;
        }

        setCurrentUser(authData.user);

        const { data: inqList, error } = await supabase
          .from("inquiries")
          .select("id,listing_id,buyer_id,seller_id,created_at,listings(id,title,price_ghs)")
          .or(`buyer_id.eq.${authData.user.id},seller_id.eq.${authData.user.id}`)
          .order("created_at", { ascending: false });

        if (!error && inqList) {
          setThreads(inqList as unknown as InquiryThread[]);
          if (inqList.length > 0) {
            setActiveThreadId(inqList[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading inquiry threads:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadThreads();
  }, [supabase]);

  const loadMessages = useCallback(async (inquiryId: string) => {
    if (!supabase) return;
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("inquiry_messages")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as MessageItem[]);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (activeThreadId) {
      void loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !currentUser || !activeThreadId || !newMessage.trim()) return;

    setSending(true);
    try {
      const { data: inserted, error } = await supabase
        .from("inquiry_messages")
        .insert({
          inquiry_id: activeThreadId,
          sender_id: currentUser.id,
          body: newMessage.trim(),
        })
        .select()
        .single();

      if (!error && inserted) {
        setMessages((prev) => [...prev, inserted as MessageItem]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Inquiry Messages</span>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900">Buyer &amp; Seller Chats</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-3 text-xs font-medium text-gray-500">Loading your conversations...</p>
            </div>
          ) : !currentUser ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm max-w-md mx-auto">
              <MessageSquare className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">Sign in to view messages</h2>
              <p className="mt-1 text-xs text-gray-500">
                You must be logged into your student account to view and respond to product inquiries.
              </p>
            </div>
          ) : threads.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-base font-bold text-gray-900">No active messages</h3>
              <p className="mt-1 text-xs text-gray-500">
                When you inquire about a product or when a student messages your listing, your chats will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
              {/* Thread List */}
              <div className="border-r border-gray-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Conversations</p>
                <div className="space-y-2">
                  {threads.map((thread) => {
                    const isActive = thread.id === activeThreadId;
                    const isBuyer = thread.buyer_id === currentUser.id;

                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`w-full text-left rounded-2xl p-3.5 transition-all flex items-start gap-3 ${
                          isActive
                            ? "bg-blue-50/80 border border-blue-200 shadow-sm"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm font-bold text-xs">
                          {isBuyer ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {thread.listings?.title ?? "Product Inquiry"}
                          </p>
                          <p className="text-[11px] font-semibold text-blue-600">
                            GHS {Number(thread.listings?.price_ghs ?? 0).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(thread.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="col-span-2 flex flex-col justify-between p-6">
                {activeThread ? (
                  <>
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-extrabold text-gray-900">
                            {activeThread.listings?.title ?? "Listing"}
                          </h2>
                          <p className="text-xs font-bold text-blue-600">
                            GHS {Number(activeThread.listings?.price_ghs ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                          {activeThread.buyer_id === currentUser.id ? "Your Inquiry to Seller" : "Buyer Inquiry on Your Item"}
                        </span>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto py-6 space-y-3">
                      {loadingMessages ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      ) : messages.length === 0 ? (
                        <p className="text-center text-xs text-gray-400">No messages sent yet in this conversation.</p>
                      ) : (
                        messages.map((msg) => {
                          const isMine = msg.sender_id === currentUser.id;
                          return (
                            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-xs ${
                                  isMine
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                                }`}
                              >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                <p className={`text-[9px] mt-1 text-right ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Send Input */}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-gray-100 pt-4">
                      <input
                        type="text"
                        required
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message or arrange a campus meetup..."
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-xs">Select a conversation on the left to start messaging.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
