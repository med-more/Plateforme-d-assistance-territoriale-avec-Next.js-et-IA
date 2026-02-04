"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const generateId = () => {
    // Only generate IDs on client side after mount
    // This function is only called in onSubmit which is user-triggered, so it's always client-side
    idCounter.current += 1;
    const randomPart = typeof window !== 'undefined' 
      ? Math.random().toString(36).substr(2, 9)
      : '000000000';
    return `msg-${idCounter.current}-${randomPart}`;
  };

  const onSubmit = async (data: ChatMessageInput) => {
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
    <div className="flex flex-col h-full bg-openai-dark relative rounded-lg border border-openai-gray/30">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center space-y-4 sm:space-y-6 px-4">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-openai-green/10 flex items-center justify-center">
                <RamadanMoonIcon className="w-5 h-5 sm:w-6 sm:h-6 text-openai-green" />
                <SparklesIcon className="absolute -top-1 -right-1 w-3 h-3 text-openai-green/60 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-openai-text" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  مساعد الصدقة
                </h3>
                <h3 className="text-lg sm:text-xl font-semibold text-openai-text-muted">
                  Assistant Sadaqa
                </h3>
                <p className="text-openai-text-muted text-xs sm:text-sm max-w-md mt-3 sm:mt-4 leading-relaxed">
                  Posez-moi des questions sur les familles nécessiteuses, les dons,
                  les distributions de Quffat Ramadan, ou les guides de Zakat.
                </p>
                <p className="text-openai-text-muted text-xs max-w-md mt-2 sm:mt-3 leading-relaxed" style={{ fontFamily: 'var(--font-amiri), serif' }}>
                  اسألني عن الأسر المحتاجة، التبرعات، توزيع قفة رمضان، أو أدلة الزكاة
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`group flex gap-2 sm:gap-4 message-enter ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-openai-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-openai-green" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-openai-green rounded-full animate-pulse" />
                  </div>
                )}
                
                <div
                  className={`flex flex-col gap-1 ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[85%] ${
                      message.role === "user"
                        ? "bg-openai-green text-white rounded-br-md"
                        : "bg-openai-darker text-openai-text rounded-bl-md"
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content || (
                        <div className="flex items-center gap-1.5 py-1">
                          <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-openai-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </p>
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-openai-gray flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-openai-text" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-openai-gray/50 bg-openai-dark">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-end gap-2">
                        <Input
                          placeholder="Message Assistant Sadaqa..."
                          {...field}
                          disabled={form.formState.isSubmitting}
                          className="min-h-[48px] sm:min-h-[52px] pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-openai-darker border-openai-gray/50 text-openai-text placeholder:text-openai-text-muted focus:border-openai-green/50 resize-none"
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
                          className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 h-7 w-7 sm:h-8 sm:w-8 bg-openai-green text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <p className="text-xs text-openai-text-muted mt-2 text-center px-2">
            Assistant Sadaqa peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
