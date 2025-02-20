import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEncryption } from "@/hooks/use-encryption";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { encryptMessage } = useEncryption();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Convert to base64
      let binary = '';
      uint8Array.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      const base64 = btoa(binary);

      // Encrypt the base64 data
      const encrypted = await encryptMessage(base64);

      // Send to server with credentials
      await apiRequest("POST", "/api/files", {
        name: file.name,
        data: encrypted,
      });

      toast({
        title: "Success",
        description: "File encrypted and uploaded successfully",
      });

      setFile(null);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="flex-1"
        disabled={isUploading}
      />
      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  );
}