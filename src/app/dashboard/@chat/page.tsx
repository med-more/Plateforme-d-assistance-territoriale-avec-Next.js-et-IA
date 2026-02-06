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
  // Always call the hook, but only use it for assistant messages
  const typingEffectHook = useTypingEffect(
    message.role === "assistant" ? message.content : "",
    15
  );
  const typingEffect = message.role === "assistant" 
    ? typingEffectHook
    : { displayedText: message.content, isTyping: false };

  return (
    <motion.div
      className={`group flex gap-2 sm:gap-3 md:gap-4 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {message.role === "assistant" && (
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-openai-green/20 to-openai-green/5 flex items-center justify-center flex-shrink-0 mt-1 ring-2 ring-openai-green/10">
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-openai-green" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-openai-green rounded-full border-2 border-openai-darker animate-pulse" />
        </div>
      )}
      
      <div
        className={`flex flex-col gap-1 sm:gap-1.5 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] ${
          message.role === "user" ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 shadow-lg ${
            message.role === "user"
              ? "bg-gradient-to-br from-openai-green to-openai-green-hover text-white rounded-br-md"
              : "bg-openai-dark text-openai-text rounded-bl-md border border-openai-gray/20"
          }`}
        >
          {message.role === "assistant" ? (
            typingEffect.displayedText || typingEffect.isTyping ? (
              <p className="text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                {typingEffect.displayedText}
                {typingEffect.isTyping && (
                  <span className="inline-block w-0.5 h-3 sm:h-4 ml-1 bg-openai-green animate-pulse" style={{ animationDuration: '1s' }} />
                )}
              </p>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 py-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )
          ) : (
            <p className="text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>
        {mounted && (
          <span className="text-[10px] sm:text-xs text-openai-text-muted px-1.5 sm:px-2">
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {message.role === "user" && (
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-openai-gray to-openai-light-gray flex items-center justify-center flex-shrink-0 mt-1 ring-2 ring-openai-gray/20">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-openai-text" />
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const form = useForm<ChatMessageInput>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: "smooth", 
            block: "nearest",
            inline: "nearest"
          });
        }
      };
      
      // Double requestAnimationFrame for better mobile support
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToBottom);
      });
    }
  }, [messages]);

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

    // Validation supplémentaire pour mobile
    if (!data.message || !data.message.trim()) {
      console.warn("Message vide, soumission ignorée");
      return;
    }

    // Log pour déboguer sur mobile
    console.log("onSubmit appelé avec:", data.message.substring(0, 50));
    
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: data.message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    // Scroll to bottom after user message
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);

    setIsStreaming(true);

    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Scroll to show assistant message placeholder
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 150);

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
            
            // Scroll to bottom after each chunk on mobile
            if (messagesEndRef.current) {
              requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              });
            }
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
    <div className="flex flex-col h-full max-h-full bg-openai-darker/50 backdrop-blur-sm relative rounded-lg sm:rounded-xl border border-openai-gray/30 shadow-xl overflow-hidden min-h-0">
      {/* Header - Very compact on mobile */}
      <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 border-b border-openai-gray/30 bg-openai-dark/50 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-openai-green/10 flex items-center justify-center ring-2 ring-openai-green/20 flex-shrink-0">
            <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-openai-green" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-openai-green rounded-full border-2 border-openai-darker animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-openai-text truncate" style={{ fontFamily: 'var(--font-amiri), serif' }}>
              مساعد الصدقة
            </h3>
            <p className="text-[10px] sm:text-xs text-openai-text-muted truncate">Assistant Sadaqa</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-openai-gray/30 scrollbar-track-transparent min-h-0"
        style={{ 
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          overscrollBehavior: 'contain', // Prevent scroll chaining on mobile
          height: '100%',
          maxHeight: '100%',
          position: 'relative'
        }}
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] text-center space-y-4 sm:space-y-5 md:space-y-6 px-3 sm:px-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-openai-green/20 to-openai-green/5 flex items-center justify-center ring-2 sm:ring-4 ring-openai-green/10">
                  <RamadanMoonIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-openai-green" />
                </div>
                <SparklesIcon className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 text-openai-green/60 animate-pulse" />
              </div>
              <div className="space-y-2 sm:space-y-3 max-w-md">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  مساعد الصدقة
                </h3>
                <h4 className="text-lg sm:text-xl md:text-2xl font-semibold text-openai-text-muted">
                  Assistant Sadaqa
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-openai-text-muted mt-2 sm:mt-4 leading-relaxed px-2">
                  Posez-moi des questions sur les familles nécessiteuses, les dons,
                  les distributions de Quffat Ramadan, ou les guides de Zakat.
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-openai-text-muted mt-2 sm:mt-3 leading-relaxed px-2" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  اسألني عن الأسر المحتاجة، التبرعات، توزيع قفة رمضان، أو أدلة الزكاة
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mt-4 sm:mt-6">
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-openai-green/10 text-openai-green rounded-full border border-openai-green/20">
                  Questions fréquentes
                </span>
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-openai-green/10 text-openai-green rounded-full border border-openai-green/20">
                  Guides Zakat
                </span>
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-openai-green/10 text-openai-green rounded-full border border-openai-green/20">
                  Familles
                </span>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {messages.map((message, index) => (
                <ChatMessage key={message.id} message={message} mounted={mounted} index={index} />
              ))}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-openai-gray/30 bg-openai-dark/80 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 lg:py-5">
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(onSubmit)(e);
              }} 
              className="relative"
              noValidate
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center gap-3">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Posez votre question..."
                            {...field}
                            disabled={form.formState.isSubmitting}
                            className="min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[56px] pr-11 sm:pr-12 md:pr-14 lg:pr-16 py-2 sm:py-2.5 md:py-3 lg:py-4 text-sm sm:text-base bg-openai-dark border-openai-gray/50 text-openai-text placeholder:text-openai-text-muted/60 focus:border-openai-green/50 focus:ring-2 focus:ring-openai-green/20 rounded-lg sm:rounded-xl transition-all"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (field.value?.trim() && !form.formState.isSubmitting) {
                                  form.handleSubmit(onSubmit)();
                                }
                              }
                            }}
                            enterKeyHint="send"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                          />
                          <Button
                            type="submit"
                            disabled={form.formState.isSubmitting || !field.value?.trim()}
                            size="icon"
                            className="absolute right-1 sm:right-1.5 md:right-2 bottom-1 sm:bottom-1.5 md:bottom-2 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 bg-openai-green hover:bg-openai-green-hover active:bg-openai-green-hover text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-md sm:rounded-lg shadow-lg transition-all touch-manipulation z-50 pointer-events-auto"
                            style={{ 
                              touchAction: 'manipulation',
                              WebkitTapHighlightColor: 'transparent'
                            }}
                            onClick={(e) => {
                              console.log("Button clicked, value:", field.value);
                              e.preventDefault();
                              e.stopPropagation();
                              const messageValue = field.value?.trim();
                              if (!form.formState.isSubmitting && messageValue) {
                                console.log("Submitting form with:", messageValue);
                                form.handleSubmit(onSubmit)(e);
                              } else {
                                console.log("Form submission blocked - isSubmitting:", form.formState.isSubmitting, "hasValue:", !!messageValue);
                              }
                            }}
                          >
                            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 pointer-events-none" />
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
          <p className="text-[10px] sm:text-xs text-openai-text-muted/70 mt-2 sm:mt-3 text-center px-2 flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-openai-green/50" />
            <span className="hidden sm:inline">Assistant Sadaqa peut faire des erreurs. Vérifiez les informations importantes.</span>
            <span className="sm:hidden">L'IA peut faire des erreurs.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
