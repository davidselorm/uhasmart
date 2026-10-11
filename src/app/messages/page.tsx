"use client";

import { useEffect, useState, FormEvent, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useUnreadMessages } from "@/lib/useUnreadMessages";
import {
  MessageSquare,
  Send,
  Loader2,
  Store,
  User,
  ChevronLeft,
  Radio,
  Clock,
  Sparkles,
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
  const { markAllRead } = useUnreadMessages();

  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<InquiryThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Clear unread badge when viewing the messages page
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load threads
  const loadThreads = useCallback(async () => {
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
        if (inqList.length > 0 && !activeThreadId) {
          setActiveThreadId(inqList[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading inquiry threads:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, activeThreadId]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  // Load messages for the selected thread
  const loadMessages = useCallback(
    async (inquiryId: string) => {
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
    },
    [supabase]
  );

  useEffect(() => {
    if (activeThreadId) {
      void loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  // REALTIME: Listen to incoming messages for the active thread
  useEffect(() => {
    if (!supabase || !activeThreadId) return;

    setIsLiveConnected(true);

    const channel = supabase
      .channel(`inquiry_thread_${activeThreadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inquiry_messages",
          filter: `inquiry_id=eq.${activeThreadId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new as unknown as MessageItem;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          markAllRead();
        }
      )
      .subscribe((status: string) => {
        setIsLiveConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
      setIsLiveConnected(false);
    };
  }, [supabase, activeThreadId, markAllRead]);

  // REALTIME: Listen to new inquiry threads created for this user
  useEffect(() => {
    if (!supabase || !currentUser) return;

    const inqChannel = supabase
      .channel(`user_inquiries_realtime_${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inquiries",
        },
        () => {
          void loadThreads();
          markAllRead();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(inqChannel);
    };
  }, [supabase, currentUser, loadThreads, markAllRead]);

  // Send message handler
  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !currentUser || !activeThreadId || !newMessage.trim()) return;

    const trimmedBody = newMessage.trim();
    setSending(true);

    try {
      const { data: inserted, error } = await supabase
        .from("inquiry_messages")
        .insert({
          inquiry_id: activeThreadId,
          sender_id: currentUser.id,
          body: trimmedBody,
        })
        .select()
        .single();

      if (!error && inserted) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === (inserted as MessageItem).id)) return prev;
          return [...prev, inserted as MessageItem];
        });
        setNewMessage("");
        markAllRead();
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

      <main className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Instant Campus Messaging</span>
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Buyer &amp; Seller Chats
              </h1>
            </div>

            {/* Realtime Live Indicator */}
            {isLiveConnected && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <Radio className="h-3.5 w-3.5 text-emerald-600" />
                <span>Real-Time Sync Active</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-3 text-xs font-medium text-gray-500">Connecting to campus channels...</p>
            </div>
          ) : !currentUser ? (
            <div className="rounded-3xl glass-card p-10 text-center shadow-lg max-w-md mx-auto">
              <MessageSquare className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">Sign in to view messages</h2>
              <p className="mt-1 text-xs text-gray-500">
                You must be logged into your student account to view and respond to product inquiries.
              </p>
            </div>
          ) : threads.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 glass-card p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-base font-bold text-gray-900">No active messages</h3>
              <p className="mt-1 text-xs text-gray-500">
                When you inquire about a product or when a student messages your listing, your chats will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl glass-card shadow-sm border border-gray-200/80 grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
              {/* Thread List (Mobile toggled or Desktop left column) */}
              <div
                className={`border-r border-gray-100 p-3 sm:p-4 ${
                  mobileThreadOpen ? "hidden md:block" : "block"
                }`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversations</p>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {threads.length} active
                  </span>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {threads.map((thread) => {
                    const isActive = thread.id === activeThreadId;
                    const isBuyer = thread.buyer_id === currentUser.id;

                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => {
                          setActiveThreadId(thread.id);
                          setMobileThreadOpen(true);
                        }}
                        className={`w-full text-left rounded-2xl p-3.5 transition-all flex items-start gap-3 active:scale-95 ${
                          isActive
                            ? "bg-blue-50/90 border border-blue-200 shadow-sm"
                            : "hover:bg-white/80 border border-transparent"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm font-bold text-xs">
                          {isBuyer ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {thread.listings?.title ?? "Product Inquiry"}
                          </p>
                          <p className="text-[11px] font-semibold text-blue-600">
                            GHS {Number(thread.listings?.price_ghs ?? 0).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Thread (Mobile toggled or Desktop 2-column) */}
              <div
                className={`col-span-2 flex flex-col justify-between p-4 sm:p-6 ${
                  !mobileThreadOpen ? "hidden md:flex" : "flex"
                }`}
              >
                {activeThread ? (
                  <>
                    <div className="border-b border-gray-100 pb-3 sm:pb-4">
                      {/* Mobile Back Button */}
                      <button
                        type="button"
                        onClick={() => setMobileThreadOpen(false)}
                        className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 md:hidden active:scale-95"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Conversations</span>
                      </button>

                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                            {activeThread.listings?.title ?? "Listing"}
                          </h2>
                          <p className="text-xs font-bold text-blue-600">
                            GHS {Number(activeThread.listings?.price_ghs ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-blue-700">
                            {activeThread.buyer_id === currentUser.id ? "Your Inquiry" : "Buyer Chat"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-3 min-h-[300px] max-h-[50vh] sm:max-h-[60vh] no-scrollbar">
                      {loadingMessages ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-semibold text-gray-700">No messages yet</p>
                          <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                            Send a greeting to arrange a meetup at Sokode, Trafalgar, or Dave campus!
                          </p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMine = msg.sender_id === currentUser.id;
                          return (
                            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm transition-all ${
                                  isMine
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white border border-gray-200/80 text-gray-900 rounded-bl-none"
                                }`}
                              >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                <p
                                  className={`text-[9px] mt-1 text-right ${
                                    isMine ? "text-blue-200" : "text-gray-400"
                                  }`}
                                >
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Send Input */}
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2 border-t border-gray-100 pt-3 sm:pt-4"
                    >
                      <input
                        type="text"
                        required
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message or arrange a campus meetup..."
                        className="flex-1 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-xs text-gray-900 focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 active:scale-95 shrink-0"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-16">
                    <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-xs">Select a conversation to start messaging.</p>
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
