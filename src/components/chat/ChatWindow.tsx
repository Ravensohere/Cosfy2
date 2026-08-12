"use client";

import { useState, useRef, useEffect } from "react";
import { Send, TriangleAlert, Mic, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FormattedAIText } from "@/components/ui/FormattedAIText";
import { CosfyMascot } from "@/components/ui/CosfyMascot";
import { cn } from "@/lib/cn";

type Message = {
  role: "user" | "assistant";
  content: string;
  usedLiveData?: boolean;
  sources?: { title: string; url: string }[];
};

export function ChatWindow({
  greeting = "Hey, I'm Kosh. Whatever's on your mind about money, budgeting, saving, that weird SMS, the latest finance news, ask away. I'm not a licensed advisor, so double check anything big before you act on it.",
  allowVoice = false,
  allowFile = false,
}: {
  greeting?: string;
  allowVoice?: boolean;
  allowFile?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleVoiceFile(file: File) {
    setVoiceError(null);
    setIsTranscribing(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/voice-chat", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setVoiceError(data.error ?? "Couldn't transcribe that.");
        return;
      }
      setInput(data.transcript);
    } catch {
      setVoiceError("Couldn't reach the server.");
    } finally {
      setIsTranscribing(false);
      if (voiceInputRef.current) voiceInputRef.current.value = "";
    }
  }

  async function handleDocFile(file: File) {
    setFileError(null);
    setMessages((prev) => [...prev, { role: "user", content: `📄 Uploaded ${file.name}` }]);
    setIsUploadingDoc(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/insurance-doc", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setFileError(data.error ?? "Couldn't read that document.");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setFileError("Couldn't reach the server. Try again.");
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || isSending) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error ?? "Something went wrong." }]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, usedLiveData: data.usedLiveData, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Couldn't reach the server. Try again." }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} showAvatar={i === 0} />
        ))}
        {isSending || isUploadingDoc ? <ThinkingBubble /> : null}
        <div ref={bottomRef} />
      </div>
      {voiceError ? <p className="text-[11px] text-cosfy-red pb-1.5">{voiceError}</p> : null}
      {fileError ? <p className="text-[11px] text-cosfy-red pb-1.5">{fileError}</p> : null}
      <div className="flex gap-2 pt-2 border-t border-cosfy-border">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={isTranscribing ? "Listening…" : isUploadingDoc ? "Reading document…" : "e.g. How much should I save monthly?"}
          disabled={isSending || isTranscribing || isUploadingDoc}
        />
        {allowFile ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDocFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isTranscribing || isUploadingDoc}
              aria-label="Upload insurance document"
              className="shrink-0 w-[52px] h-[52px] rounded-input bg-cosfy-card-soft text-cosfy-ink-soft flex items-center justify-center disabled:opacity-40"
            >
              <Paperclip size={18} strokeWidth={2.5} />
            </button>
          </>
        ) : null}
        {allowVoice ? (
          <>
            <input
              ref={voiceInputRef}
              type="file"
              accept="audio/*"
              capture="user"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVoiceFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => voiceInputRef.current?.click()}
              disabled={isSending || isTranscribing || isUploadingDoc}
              aria-label="Record voice message"
              className="shrink-0 w-[52px] h-[52px] rounded-input bg-cosfy-card-soft text-cosfy-ink-soft flex items-center justify-center disabled:opacity-40"
            >
              <Mic size={18} strokeWidth={2.5} />
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isSending || isUploadingDoc || !input.trim()}
          aria-label="Send"
          className="shrink-0 w-[52px] h-[52px] rounded-input bg-cosfy-lime text-cosfy-lime-ink flex items-center justify-center disabled:opacity-40"
        >
          <Send size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <CosfyMascot mood="thinking" size={28} interactive={false} />
      <div className="rounded-card px-4 py-3 bg-cosfy-card border border-cosfy-border flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cosfy-muted animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-cosfy-muted animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-cosfy-muted animate-bounce" />
      </div>
    </div>
  );
}

function ChatBubble({ message, showAvatar }: { message: Message; showAvatar: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && showAvatar ? <CosfyMascot mood="happy" size={28} /> : null}
      <div
        className={cn(
          "max-w-[85%] rounded-card px-4 py-3 text-[14px] leading-relaxed",
          isUser ? "bg-cosfy-lime text-cosfy-lime-ink" : "bg-cosfy-card border border-cosfy-border text-cosfy-ink"
        )}
      >
        {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <FormattedAIText text={message.content} />}
        {!isUser ? (
          <div className="mt-2 pt-2 border-t border-cosfy-border flex items-start gap-1.5 text-[11px] text-cosfy-amber">
            <TriangleAlert size={13} className="mt-[1px] shrink-0" />
            <span>
              {message.usedLiveData
                ? "Based on recent headlines, not financial advice. Verify before acting on it."
                : "Not financial advice, so verify before acting on it."}
            </span>
          </div>
        ) : null}
        {message.sources && message.sources.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {message.sources.slice(0, 3).map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cosfy-blue underline underline-offset-2 line-clamp-1"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
