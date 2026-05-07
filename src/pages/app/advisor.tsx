import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Should I buy VTI this week?",
    "How do I start investing with $100?",
    "What is a dividend and why does it matter?",
    "Is now a good time to add to QQQ?"
  ];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setUserId(session.user.id);

      // Load user context
      const { data: profile } = await supabase
        .from("profiles")
        .select("invest_monthly, child_age, college_goal")
        .eq("id", session.user.id)
        .single();

      const { data: watchlist } = await supabase
        .from("watchlist")
        .select("ticker")
        .eq("user_id", session.user.id);

      setUserContext({
        investMonthly: profile?.invest_monthly || 0,
        childAge: profile?.child_age,
        collegeGoal: profile?.college_goal || 0,
        watchlist: watchlist?.map(w => w.ticker) || []
      });

      // Load conversation history
      const { data: history } = await supabase
        .from("advisor_conversations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (history) {
        setMessages(history as Message[]);
      }
    };

    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !userId || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId,
          userContext
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Send message error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!userId || !confirm("Clear all conversation history?")) return;

    await supabase
      .from("advisor_conversations")
      .delete()
      .eq("user_id", userId);

    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl text-sage-800 mb-2">Bloom Advisor</h1>
            <p className="text-slate-600">Your personal AI financial guide</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="text-terracotta-600 border-terracotta-300 hover:bg-terracotta-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="mb-6">
          <div className="text-sm text-slate-600 mb-3">Try asking:</div>
          <div className="grid md:grid-cols-2 gap-3">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(question)}
                className="text-left p-4 bg-white rounded-lg border border-sage-200 hover:border-sage-400 hover:bg-sage-50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-champagne-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-sage-900">{question}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white rounded-xl border border-sage-200 mb-6" style={{ height: "500px" }}>
        <div className="h-full overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-sage-600" />
              </div>
              <h3 className="font-serif text-xl text-sage-800 mb-2">Hi! I'm Bloom Advisor</h3>
              <p className="text-slate-600 max-w-md">
                I'm here to answer your investing questions in plain English. Ask me anything about ETFs, stocks, budgeting, or how to get started.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-sage-800 text-white"
                        : "bg-sage-50 text-sage-900 border border-sage-200"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-champagne-500" />
                        <span className="text-xs font-semibold text-sage-700">Bloom Advisor</span>
                      </div>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-sage-50 border border-sage-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sage-600">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                      <span className="text-xs">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-xl border border-sage-200 p-4">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about investing..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-sage-800 hover:bg-sage-900 text-white px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </AppLayout>
  );
}