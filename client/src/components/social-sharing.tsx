import { Share2, Facebook, Twitter, Linkedin, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialSharingProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export function SocialSharing({ url, title, description, className = "" }: SocialSharingProps) {
  const { toast } = useToast();
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The post URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Share2 className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-500 mr-2">Share:</span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openShare(shareLinks.facebook)}
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openShare(shareLinks.twitter)}
        className="text-sky-600 hover:text-sky-800 hover:bg-sky-50"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openShare(shareLinks.linkedin)}
        className="text-blue-700 hover:text-blue-900 hover:bg-blue-50"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openShare(shareLinks.email)}
        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        aria-label="Share via email"
      >
        <Mail className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        aria-label="Copy link"
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}