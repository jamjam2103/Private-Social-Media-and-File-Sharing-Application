import { useState, useEffect, useCallback } from 'react';
import { Message } from '@shared/schema';
import { useEncryption } from './use-encryption';
import { useAuth } from './use-auth';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { encryptMessage, decryptMessage } = useEncryption();
  const { user } = useAuth();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      setConnected(false);
      setSocket(null);
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'history') {
        const decryptedMessages = await Promise.all(
          data.messages.map(async (msg: Message) => ({
            ...msg,
            content: msg.encrypted ? await decryptMessage(msg.content) : msg.content,
          }))
        );
        setMessages(decryptedMessages);
      } else if (data.type === 'message') {
        const message = data.message;
        const decryptedMessage = {
          ...message,
          content: message.encrypted ? await decryptMessage(message.content) : message.content,
        };
        setMessages(prev => [...prev, decryptedMessage]);
      }
    };

    return () => {
      ws.close();
    };
  }, [decryptMessage]);

  const sendMessage = useCallback(async (content: string, encrypted: boolean = true) => {
    if (!socket || !user) return;

    const finalContent = encrypted ? await encryptMessage(content) : content;
    
    socket.send(JSON.stringify({
      type: 'chat',
      username: user.username,
      content: finalContent,
      encrypted,
    }));
  }, [socket, user, encryptMessage]);

  return {
    messages,
    sendMessage,
    connected,
  };
}
