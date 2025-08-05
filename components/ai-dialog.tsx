import { FC, useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Sparkles,
  Loader2,
  Send,
  RotateCcw,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChat } from "@ai-sdk/react";
import handleTextAreaHeight from "@/hooks/handle-text-area-height";

const TypingIndicator = () => {
  return (
     
            <div className="size-3 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
         
  );
};

const ErrorMessage: FC<{ error: string; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="flex justify-center my-4">
      <Alert className="max-w-md border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 text-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 px-2 ml-2 text-red-600 hover:text-red-800"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const AIDialog: FC<{ text: string }> = ({ text }) => {
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    reload,
    stop,
  } = useChat({
    api: "/api/chat",
    streamProtocol: "text",
    body: {
      context: text,
    },
    headers: {
      "Content-Type": "application/json",
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error" || !!error;
  const { textareaRef, handleInput } = handleTextAreaHeight();
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      scrollToBottom();
    }
  }, [status]);

  const handleRetry = () => {
    if (messages.length > 0) {
      reload();
    }
  };

  const handleStop = () => {
    if (isLoading) {
      stop();
    }
  };
  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    if (isLoading || text.trim().length < 100 || !input.trim()) return;
    handleSubmit(e);
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
    textareaRef.current?.focus();
    setTimeout(scrollToBottom, 50);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r text-white rounded-full from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 gap-2 flex items-center  "
          disabled={text.length < 100}
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex gap-2 flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Ask Questions about your document
            {(status === "submitted" || status === "streaming") && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                {status === "submitted" ? "Sending..." : "Streaming..."}
              </div>
            )}
          </DialogTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={isLoading}
              className="text-slate-500"
              title="Clear conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 w-full border flex flex-col min-h-[200px]  rounded-lg pt-4 pb-4 px-4"
          >
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ask questions about your document!</p>
                <div className="mt-4 space-y-1 text-xs text-slate-400">
                  <p>• "What are the main points?"</p>
                  <p>• "Can you explain section 2?"</p>
                  <p>• "What conclusions are drawn?"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4  flex flex-col ">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        {message.content && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content.trim()}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* {index < messages.length - 1  && <Separator />} */}
                  </div>
                ))}

                {isLoading && <TypingIndicator />}

                {hasError && (
                  <ErrorMessage
                    error={
                      error?.message ||
                      "Something went wrong. Please try again."
                    }
                    onRetry={handleRetry}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleCustomSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question about your content..."
              disabled={isLoading}
              spellCheck={false}
              ref={textareaRef}
              onInput={handleInput}
              className="flex-1 w-full h-[40px] min-h-[40px] max-h-[100px] bg-background resize-none overflow-hidden"
            />

            {isLoading ? (
              <Button
                type="button"
                onClick={handleStop}
                variant="outline"
                className="px-4"
              >
                <div className="size-2 bg-red-500 rounded-full animate-pulse" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={
                  !input.trim() || isLoading || text.trim().length < 100
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === "submitted"
                    ? "bg-blue-400 animate-pulse"
                    : status === "streaming"
                    ? "bg-yellow-400 animate-pulse"
                    : status === "error"
                    ? "bg-red-400"
                    : status === "ready"
                    ? "bg-green-400"
                    : "bg-slate-400"
                }`}
              />
              <span>
                {status === "submitted"
                  ? "Message sent..."
                  : status === "streaming"
                  ? "Streaming response..."
                  : status === "error"
                  ? "Error occurred"
                  : status === "ready"
                  ? "Ready for new message"
                  : "Idle"}
              </span>
            </div>

            {messages.length > 0 && (
              <span>
                {messages.filter((message) => message.role === "user").length}{" "}
                message{messages.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
