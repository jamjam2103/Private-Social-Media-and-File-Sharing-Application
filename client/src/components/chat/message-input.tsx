import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Send, Unlock } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface MessageInputProps {
  onSendMessage: (content: string, encrypted: boolean) => void;
  disabled: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [encrypted, setEncrypted] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), encrypted);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Toggle
        pressed={encrypted}
        onPressedChange={setEncrypted}
        className="px-3"
        aria-label="Toggle encryption"
      >
        {encrypted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </Toggle>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled || !message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
