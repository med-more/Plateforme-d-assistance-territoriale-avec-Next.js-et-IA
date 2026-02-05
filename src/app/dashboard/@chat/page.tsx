"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Moon, User, Bot, Sparkles as SparklesIcon } from "lucide-react";
import { RamadanMoonIcon } from "@/components/icons/ramadan-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { chatMessageSchema, type ChatMessageInput } from "@/lib/validators/form-schema";
import { useSadaqa } from "@/components/context/sadaqa-context";
import { chatAction } from "@/actions/chat-action";

// Custom hook for typing effect
function useTypingEffect(text: string, speed: number = 15) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef(text);
  const displayedTextRef = useRef("");

  // Update text ref when text changes
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Effect to handle text changes and start/continue typing
  useEffect(() => {
    // Reset when text is empty
    if (text === "") {
      setDisplayedText("");
      displayedTextRef.current = "";
      setIsTyping(false);
      indexRef.current = 0;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // If text is longer than displayed, we need to type more
    if (text.length > displayedTextRef.current.length) {
      setIsTyping(true);
      
      const typeNextChar = () => {
        // Get current values from refs
        const currentText = textRef.current;
        const currentDisplayed = displayedTextRef.current;
        
        if (indexRef.current < currentText.length) {
          const newDisplayed = currentText.slice(0, indexRef.current + 1);
          displayedTextRef.current = newDisplayed;
          setDisplayedText(newDisplayed);
          indexRef.current += 1;
          timeoutRef.current = setTimeout(typeNextChar, speed);
        } else {
          setIsTyping(false);
          timeoutRef.current = null;
        }
      };

      // Start typing from where we left off (only if not already typing)
      if (!timeoutRef.current) {
        indexRef.current = displayedTextRef.current.length;
        typeNextChar();
      }
    } else if (text.length < displayedTextRef.current.length) {
      // Text was shortened (shouldn't happen, but handle it)
      displayedTextRef.current = text;
      setDisplayedText(text);
      indexRef.current = text.length;
      setIsTyping(false);
    } else if (text === displayedTextRef.current && text.length > 0) {
      // Text is complete
      setIsTyping(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [text, speed]); // Removed displayedText from dependencies

  return { displayedText, isTyping };
}

// Message component with typing effect for assistant messages
function ChatMessage({ message, mounted, index }: { message: Message; mounted: boolean; index: number }) {
  const typingEffect = message.role === "assistant" 
    ? useTypingEffect(message.content, 15)
    : { displayedText: message.content, isTyping: false };

  return (
    <motion.div
      className={`group flex gap-3 sm:gap-4 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      {message.role === "assistant" && (
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-openai-green/20 to-openai-green/5 flex items-center justify-center flex-shrink-0 mt-1 ring-2 ring-openai-green/10">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-openai-green" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-openai-green rounded-full border-2 border-openai-darker animate-pulse" />
        </div>
      )}
      
      <div
        className={`flex flex-col gap-1.5 max-w-[85%] sm:max-w-[80%] ${
          message.role === "user" ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-lg ${
            message.role === "user"
              ? "bg-gradient-to-br from-openai-green to-openai-green-hover text-white rounded-br-md"
              : "bg-openai-dark text-openai-text rounded-bl-md border border-openai-gray/20"
          }`}
        >
          {message.role === "assistant" ? (
            typingEffect.displayedText || typingEffect.isTyping ? (
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                {typingEffect.displayedText}
                {typingEffect.isTyping && (
                  <span className="inline-block w-0.5 h-4 ml-1 bg-openai-green animate-pulse" style={{ animationDuration: '1s' }} />
                )}
              </p>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )
          ) : (
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>
        {mounted && (
          <span className="text-xs text-openai-text-muted px-2">
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {message.role === "user" && (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-openai-gray to-openai-light-gray flex items-center justify-center flex-shrink-0 mt-1 ring-2 ring-openai-gray/20">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-openai-text" />
        </div>
      )}
    </motion.div>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mounted, setMounted] = useState(false);
  const { setIsStreaming } = useSadaqa();
  const form = useForm<ChatMessageInput>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const idCounter = useRef(0);
  // Cette fonction ne sera appelée que côté client après le montage
  // car elle n'est utilisée que dans onSubmit qui est déclenché par l'utilisateur
  const generateId = useMemo(() => {
    return () => {
      // Cette fonction ne devrait être appelée que côté client après le montage
      if (typeof window === 'undefined' || !mounted) {
        // Fallback pour SSR (ne devrait jamais être appelé)
        idCounter.current += 1;
        return `msg-ssr-${idCounter.current}`;
      }
      idCounter.current += 1;
      // Utiliser performance.now() pour un ID plus stable côté client uniquement
      const timestamp = window.performance 
        ? Math.floor(window.performance.now() * 1000).toString(36)
        : idCounter.current.toString(36);
      return `msg-${idCounter.current}-${timestamp}`;
    };
  }, [mounted]);

  const onSubmit = async (data: ChatMessageInput) => {
    // S'assurer qu'on est côté client avant de générer l'ID
    if (!mounted) {
      console.warn("onSubmit appelé avant le montage, ignoré");
      return;
    }
    
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: data.message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    setIsStreaming(true);

    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      let fullResponse = "";

      const response = await chatAction(data.message);

      if (response && typeof response === "object" && "text" in response) {
        const reader = response.text.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullResponse, timestamp: new Date() }
                  : msg
              )
            );
          }
        } finally {
          reader.releaseLock();
        }
      } else if (typeof response === "string") {
        // Gestion des erreurs ou messages d'information
        fullResponse = response;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullResponse, timestamp: new Date() }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error streaming response:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Désolé, une erreur s'est produite. Veuillez réessayer." }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-openai-darker/50 backdrop-blur-sm relative rounded-xl border border-openai-gray/30 shadow-xl overflow-hidden min-h-0">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-openai-gray/30 bg-openai-dark/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-openai-green/10 flex items-center justify-center ring-2 ring-openai-green/20">
            <Bot className="w-5 h-5 text-openai-green" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-openai-green rounded-full border-2 border-openai-darker animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
              مساعد الصدقة
            </h3>
            <p className="text-xs text-openai-text-muted">Assistant Sadaqa</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-openai-gray/30 scrollbar-track-transparent min-h-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] sm:min-h-[500px] text-center space-y-6 px-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-openai-green/20 to-openai-green/5 flex items-center justify-center ring-4 ring-openai-green/10">
                  <RamadanMoonIcon className="w-8 h-8 sm:w-10 sm:h-10 text-openai-green" />
                </div>
                <SparklesIcon className="absolute -top-2 -right-2 w-5 h-5 text-openai-green/60 animate-pulse" />
              </div>
              <div className="space-y-3 max-w-md">
                <h3 className="text-2xl sm:text-3xl font-bold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  مساعد الصدقة
                </h3>
                <h4 className="text-xl sm:text-2xl font-semibold text-openai-text-muted">
                  Assistant Sadaqa
                </h4>
                <p className="text-sm sm:text-base text-openai-text-muted mt-4 leading-relaxed">
                  Posez-moi des questions sur les familles nécessiteuses, les dons,
                  les distributions de Quffat Ramadan, ou les guides de Zakat.
                </p>
                <p className="text-xs sm:text-sm text-openai-text-muted mt-3 leading-relaxed" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  اسألني عن الأسر المحتاجة، التبرعات، توزيع قفة رمضان، أو أدلة الزكاة
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                <span className="px-3 py-1.5 text-xs font-medium bg-openai-green/10 text-openai-green rounded-full border border-openai-green/20">
                  Questions fréquentes
                </span>
                <span className="px-3 py-1.5 text-xs font-medium bg-openai-green/10 text-openai-green rounded-full border border-openai-green/20">
                  Guides Zakat
                </span>
                <span className="px-3 py-1.5 text-xs font-medium bg-openai-green/10 text-openai-green rounded-full border border-openai-green/20">
                  Familles
                </span>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            <div className="space-y-6 sm:space-y-8">
              {messages.map((message, index) => (
                <ChatMessage key={message.id} message={message} mounted={mounted} index={index} />
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-openai-gray/30 bg-openai-dark/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center gap-3">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Posez votre question à l'Assistant Sadaqa..."
                            {...field}
                            disabled={form.formState.isSubmitting}
                            className="min-h-[52px] sm:min-h-[56px] pr-14 sm:pr-16 py-3 sm:py-4 text-sm sm:text-base bg-openai-dark border-openai-gray/50 text-openai-text placeholder:text-openai-text-muted/60 focus:border-openai-green/50 focus:ring-2 focus:ring-openai-green/20 rounded-xl transition-all"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                          />
                          <Button
                            type="submit"
                            disabled={form.formState.isSubmitting || !field.value?.trim()}
                            size="icon"
                            className="absolute right-2 bottom-2 h-9 w-9 sm:h-10 sm:w-10 bg-openai-green hover:bg-openai-green-hover text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-lg transition-all"
                          >
                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <p className="text-xs text-openai-text-muted/70 mt-3 text-center px-2 flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-openai-green/50" />
            Assistant Sadaqa peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
