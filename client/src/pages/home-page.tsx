import { ChatRoom } from "@/components/chat/chat-room";
import { FileBoard } from "@/components/file-board/file-board";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { logoutMutation, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Secure Communications</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Logged in as {user?.username}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Encrypted Chat</h2>
            <ChatRoom />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">File Sharing</h2>
            <FileBoard />
          </div>
        </div>
      </main>
    </div>
  );
}
