import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Image, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

export default function RichEditor({ content, onChange, title, onTitleChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      executeCommand('insertHTML', linkHtml);
      setLinkUrl("");
      setLinkText("");
      setShowLinkDialog(false);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const imgHtml = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      executeCommand('insertHTML', imgHtml);
      setImageUrl("");
      setImageAlt("");
      setShowImageDialog(false);
    }
  };

  const toolbarButtons = [
    { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <div className="space-y-4">
      {/* Title Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Title
        </label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter post title..."
          className="text-xl font-bold"
        />
      </div>

      {/* Rich Text Editor */}
      <div className="border rounded-lg">
        {/* Toolbar */}
        <div className="border-b p-2 flex flex-wrap gap-1">
          {toolbarButtons.map((btn, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => executeCommand(btn.command, btn.value)}
              title={btn.title}
              className="p-2"
            >
              <btn.icon className="w-4 h-4" />
            </Button>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            title="Insert Link"
            className="p-2"
          >
            <Link className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            title="Insert Image"
            className="p-2"
          >
            <Image className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor Content */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: content }}
          className="p-4 min-h-[400px] focus:outline-none prose max-w-none"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Insert Link</h3>
            <div className="space-y-3">
              <Input
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <Input
                placeholder="URL (https://example.com)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
                  Insert Link
                </Button>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Insert Image</h3>
            <div className="space-y-3">
              <Input
                placeholder="Image URL (https://example.com/image.jpg)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                placeholder="Alt text (description)"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={insertImage} disabled={!imageUrl}>
                  Insert Image
                </Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}