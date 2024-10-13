"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { GiRegeneration } from "react-icons/gi";
import { IoMdCloseCircle } from "react-icons/io";
import { FaTrash } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { spinner } from "@/components/spinner";
import remarkGfm from "remark-gfm";
import { MemoizedReactMarkdown } from "@/components/markdown";

export default function Page() {
  const [initialMessages, setInitialMessages] = useState([]);
  useEffect(() => {
    // Load conversation history from local storage on component mount
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      setInitialMessages(JSON.parse(savedMessages));
    }
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setMessages,
  } = useChat({
    keepLastMessageOnError: true,
    streamProtocol: "text",
    initialMessages: initialMessages,
  });

  if (messages.length > 0) {
    console.log(messages[messages.length - 1].content);
  }

  const handleDelete = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  useEffect(() => {
    // Save conversation history to local storage whenever messages change
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
    scrollToBottom();

    // Hide welcome message when there are actual messages
    if (messages.length > 0) {
      setShowWelcomeMessage(false);
    }
  }, [messages]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
    setShowWelcomeMessage(true);
  };

  return (
    <div className="container mx-auto flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto pb-32 mt-12">
        {showWelcomeMessage && (
          <div className="w-full flex justify-center">
            <div className="bg-muted rounded-2xl p-4 max-w-2xl text-center">
              <h2 className="text-xl font-bold mb-2">
                Welcome to Fidexa AI Chat!
              </h2>
              <p>
                I&apos;m here to help you plan your project. Start by telling me
                about your idea, and I&apos;ll guide you through the process of
                clarifying your vision and breaking it down into actionable
                objectives.
              </p>
              <p className="mt-2 italic">
                Just start typing below to begin our conversation!
              </p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "w-full flex py-2",
              message.role === "user" ? "justify-start" : ""
            )}
          >
            <div
              className={cn(
                "flex gap-2  rounded-2xl bg-muted items-center p-3",
                message.role === "user" ? "invert" : ""
              )}
            >
              {message.role === "user" ? (
                <div key={message.id} className="p-2   w-[300px] lg:w-[400px]">
                  <MemoizedReactMarkdown
                    className="prose break-words prose-invert prose-p:leading-relaxed prose-pre:p-0"
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>;
                      },
                    }}
                  >
                    {message.content}
                  </MemoizedReactMarkdown>
                </div>
              ) : (
                <div key={message.id} className="p-2 w-full mx-auto">
                  <MemoizedReactMarkdown
                    className="prose prose-zinc prose-invert break-words  prose-p:leading-relaxed prose-pre:p-0"
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </MemoizedReactMarkdown>
                </div>
              )}
              <div className="flex gap-2 flex-col">
                <IoMdCloseCircle
                  className="cursor-pointer"
                  onClick={() => handleDelete(message.id)}
                />
                {message.role !== "user" && (
                  <GiRegeneration
                    className="cursor-pointer"
                    onClick={() => reload()}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Add clear history button */}
        {messages.length > 0 && (
          <div className="fixed top-4 right-4">
            <Button
              onClick={clearHistory}
              className="flex items-center gap-2"
              variant="destructive"
            >
              <FaTrash /> Clear History
            </Button>
          </div>
        )}
      </div>

      {error && (
        <>
          <div>An error occurred {error.message}</div>
          <Button type="button" onClick={() => reload()}>
            Retry
          </Button>
        </>
      )}

      <form
        ref={formRef}
        onSubmit={(event) => {
          handleSubmit(event);
        }}
      >
        <div className="fixed pb-3 inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/0 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
          {/* Add the loading spinner here */}
          {isLoading && (
            <div className="flex justify-center items-center mb-2">
              {spinner}
            </div>
          )}
          <div className="flex">
            <div className="flex gap-2 items-center flex-grow px-5 ">
              <Textarea
                tabIndex={0}
                onKeyDown={onKeyDown}
                rows={1}
                autoFocus
                placeholder="Tell me about your project..."
                ref={inputRef}
                name="prompt"
                disabled={isLoading}
                className="bg-black outline-2 overflow-hidden text-white resize-none rounded-xl"
                value={input}
                onChange={handleInputChange}
              ></Textarea>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
