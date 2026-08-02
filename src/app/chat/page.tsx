import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="px-5 pt-6 pb-28 md:px-10 md:pt-10 md:max-w-2xl md:mx-auto h-dvh flex flex-col">
      <div className="mb-4">
        <p className="text-[13px] text-cosfy-muted">Ask Cosfy</p>
        <p className="text-[18px] font-extrabold text-cosfy-ink">Finance chat</p>
      </div>
      <ChatWindow />
    </div>
  );
}
