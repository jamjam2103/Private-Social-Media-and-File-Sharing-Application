import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "./file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEncryption } from "@/hooks/use-encryption";
import { FileShare } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function FileBoard() {
  const queryClient = useQueryClient();
  const { decryptMessage } = useEncryption();
  const { toast } = useToast();

  const { data: files = [], isLoading, isError } = useQuery<FileShare[]>({
    queryKey: ["/api/files"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/files");
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading files</div>;
  }

  const handleDownload = async (file: FileShare) => {
    try {
      // Get the file data from IPFS
      const response = await apiRequest("GET", `/api/files/${file.id}`);
      const { data } = await response.json();

      // Decrypt the file data
      const decrypted = await decryptMessage(data);

      // Convert base64 to blob
      const byteCharacters = atob(decrypted);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/octet-stream' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File decrypted and downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encrypted File Board</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["/api/files"] })}
        />

        <ScrollArea className="h-[400px] border rounded-md p-4">
          <div className="space-y-4">
            {Array.isArray(files) && files.length > 0 ? (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Shared by {file.username} • {new Date(file.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(file)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No files shared yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}