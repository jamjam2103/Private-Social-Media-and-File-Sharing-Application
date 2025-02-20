import { useChat } from "@/hooks/use-chat";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "./message-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ChatRoom() {
  const { messages, sendMessage, connected } = useChat();

  return (
    <Card className="flex flex-col h-[600px]">
      {!connected && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Disconnected from chat server. Trying to reconnect...
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-3 rounded-lg bg-muted"
            >
              <div className="font-medium text-sm text-muted-foreground">
                {message.username}
              </div>
              <div className="mt-1">{message.content}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <MessageInput
        onSendMessage={sendMessage}
        disabled={!connected}
      />
    </Card>
  );
}
