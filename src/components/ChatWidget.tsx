"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Globe,
  Code2,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage, AgentResponse } from "@/types";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const SUGGESTED_QUESTIONS: Record<Locale, string[]> = {
  en: [
    "How did Brendan help scale a global tech strategy from $500M to $5B?",
    "How did the pandemic and the rise of NVDA shape his investing and AI approach?",
    "Show me Brendan's flagship deployed projects and what each one does.",
    "How did he go from learning Python during the pandemic to shipping GenAI apps?",
  ],
  fr: [
    "Comment Brendan a-t-il contribué à faire passer une stratégie tech de 500 M$ à 5 Md$ ?",
    "Comment la pandémie et l'essor de NVDA ont-ils influencé son approche ?",
    "Montre-moi ses projets déployés et ce que chacun apporte.",
    "Comment est-il passé de Python pendant la pandémie à des apps GenAI déployées ?",
  ],
};

const TOOL_ICONS: Record<string, typeof Globe> = {
  image_generation: ImageIcon,
  web_search: Globe,
  code_interpreter: Code2,
};

interface Props {
  locale: Locale;
}

export default function ChatWidget({ locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [openMode, setOpenMode] = useState<"manual" | "auto">("manual");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const autoOpenDone = useRef(false);
  const autoGreetingInjected = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (open: boolean, source: "manual" | "auto" = "manual") => {
    if (source === "manual") {
      setHasInteracted(true);
    }
    setOpenMode(source);
    setIsOpen(open);
  };

  // Auto-open chat panel once after 5 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted && !autoOpenDone.current) {
        handleToggle(true, "auto");
        autoOpenDone.current = true;

        if (!autoGreetingInjected.current) {
          autoGreetingInjected.current = true;
          setMessages((prev) => {
            if (prev.length > 0) return prev;
            const greeting: ChatMessage = {
              id: `assistant-greeting-${Date.now()}`,
              role: "assistant",
              content:
                locale === "en"
                  ? "Hi — I'm Brendan's AI resume agent, powered by Mistral. Ask me anything about his experience, skills, or career journey. Or pick a question below to get started."
                  : "Bonjour — je suis l'agent CV de Brendan, propulsé par Mistral. Posez-moi vos questions sur son expérience, ses compétences ou son parcours, ou choisissez une question ci-dessous.",
              timestamp: Date.now(),
            };
            return [greeting];
          });
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasInteracted, locale]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          conversationId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data: AgentResponse = await res.json();

      // Update conversation ID for continuity
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content,
        imageUrl: data.imageUrl,
        toolUsed: data.toolUsed as ChatMessage["toolUsed"],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          locale === "en"
            ? "Sorry, I encountered an error. Please try again."
            : "Désolé, une erreur est survenue. Veuillez réessayer.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const resetChatState = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
    setIsLoading(false);
  };

  const showSuggestedQuestions =
    messages.filter((message) => message.role === "user").length === 0;

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => handleToggle(true)}
            aria-label={locale === "en" ? "Open chat assistant" : "Ouvrir l'assistant"}
            title={locale === "en" ? "Open chat assistant" : "Ouvrir l'assistant"}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-mistral-orange text-white shadow-lg shadow-mistral-orange/25 flex items-center justify-center hover:scale-105 transition-transform"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[540px] max-h-[80vh] rounded-2xl overflow-hidden glass shadow-2xl shadow-black/40 flex flex-col"
            initial={
              openMode === "auto"
                ? { opacity: 0, y: 40, scale: 0.9 }
                : { opacity: 0, y: 20, scale: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={
              openMode === "auto"
                ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0.25 }
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-mistral-orange" />
                <span className="text-sm font-medium">
                  {locale === "en" ? "Resume Agent" : "Agent CV"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-mistral-orange/10 text-mistral-orange font-mono">
                  Mistral
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChatState}
                  aria-label={locale === "en" ? "Back to starter questions" : "Retour aux questions initiales"}
                  title={locale === "en" ? "Back to starter questions" : "Retour aux questions initiales"}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetChatState}
                  aria-label={locale === "en" ? "Clear chat and start over" : "Effacer le chat et recommencer"}
                  title={locale === "en" ? "Clear chat and start over" : "Effacer le chat et recommencer"}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggle(false)}
                  aria-label={locale === "en" ? "Close chat panel" : "Fermer le panneau de chat"}
                  title={locale === "en" ? "Close chat panel" : "Fermer le panneau de chat"}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
              {/* Message bubbles */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-mistral-orange text-white"
                        : "bg-white/[0.06] text-foreground/90"
                    )}
                  >
                    {/* Tool usage indicator */}
                    {msg.toolUsed && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mb-1">
                        {TOOL_ICONS[msg.toolUsed] &&
                          (() => {
                            const Icon = TOOL_ICONS[msg.toolUsed!];
                            return <Icon className="w-3 h-3" />;
                          })()}
                        {locale === "en"
                          ? `Used ${msg.toolUsed.replace("_", " ")}`
                          : `Outil utilisé : ${msg.toolUsed.replace("_", " ")}`}
                      </div>
                    )}

                    {/* Content */}
                    <ReactMarkdown
                      className="text-[13px] leading-relaxed max-w-none"
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <span className="font-semibold text-foreground">
                            {children}
                          </span>
                        ),
                        h1: ({ children }) => (
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {children}
                          </p>
                        ),
                        h2: ({ children }) => (
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {children}
                          </p>
                        ),
                        h3: ({ children }) => (
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="pl-4 list-disc space-y-0.5 mb-2 text-[13px]">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="pl-4 list-decimal space-y-0.5 mb-2 text-[13px]">
                            {children}
                          </ol>
                        ),
                        code: ({ children, className }) =>
                          className ? (
                            <code className="block text-[12px] bg-white/[0.08] px-2 py-1.5 rounded font-mono whitespace-pre-wrap">
                              {children}
                            </code>
                          ) : (
                            <code className="text-[12px] bg-white/[0.08] px-1 py-0.5 rounded font-mono">
                              {children}
                            </code>
                          ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {/* Generated image */}
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="AI-generated"
                        className="mt-2 rounded-lg w-full"
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Welcome suggestions */}
              {showSuggestedQuestions && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground/75 mb-3">
                    {locale === "en"
                      ? "Ask about Brendan's real career arc: Boston-based tech investing, pandemic-era coding, and shipped applied AI products."
                      : "Posez vos questions sur son parcours réel : investissement tech à Boston, code appris pendant la pandémie, et produits IA déployés."}
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS[locale].map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground/80 hover:text-foreground transition-colors border border-white/[0.04]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-mistral-orange" />
                    <span className="text-xs text-muted-foreground">
                      {locale === "en" ? "Thinking..." : "Réflexion..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-3 py-3 border-t border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    locale === "en"
                      ? "Ask about Brendan..."
                      : "Posez une question à propos de Brendan..."
                  }
                  disabled={isLoading}
                  className="flex-1 bg-white/[0.04] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-mistral-orange/50 border border-white/[0.06]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label={locale === "en" ? "Send message" : "Envoyer le message"}
                  title={locale === "en" ? "Send message" : "Envoyer le message"}
                  className="w-8 h-8 rounded-lg bg-mistral-orange text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-mistral-orange/90 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
