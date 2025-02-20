import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function FileShareButton() {
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      const response = await apiRequest("POST", "/api/generate-token", {});
      const { token } = await response.json();
  
      // Open the file-sharing system (5001) with the token
      window.open(`http://localhost:5001`, "_blank");
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access file sharing",
        variant: "destructive",
      });
    }
  };
  

  return (
    <Button onClick={handleClick} className="gap-2">
      <Share2 className="h-4 w-4" />
      Share Files
    </Button>
  );
}
