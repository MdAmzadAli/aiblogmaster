import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

interface FloatingToolbarState {
  show: boolean;
  x: number;
  y: number;
}

interface EditorContentProps {
  content: string;
  onChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(({ content, onChange, onKeyDown }, ref) => {
  const [isComposing, setIsComposing] = useState(false);
  const [lastContent, setLastContent] = useState(content);
  const innerRef = useRef<HTMLDivElement>(null);

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement) => {
    if (innerRef) {
      innerRef.current = node;
    }
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  useEffect(() => {
    // Only update DOM content if it actually changed from outside
    // and we're not currently typing (to avoid cursor jumps)
    if (innerRef.current && content !== lastContent && !isComposing && document.activeElement !== innerRef.current) {
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      
      // Save selection if the element has focus
      if (document.activeElement === innerRef.current && selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }
      
      innerRef.current.innerHTML = content;
      setLastContent(content);
      
      // Restore selection if we had one
      if (savedRange && document.activeElement === innerRef.current) {
        try {
          selection?.removeAllRanges();
          selection?.addRange(savedRange);
        } catch (e) {
          // Range might be invalid after content change, ignore
        }
      }
    }
  }, [content, lastContent, isComposing]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!isComposing) {
      const target = e.target as HTMLDivElement;
      const newContent = target.innerHTML;
      setLastContent(newContent);
      onChange(newContent);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);
    const target = e.target as HTMLDivElement;
    const newContent = target.innerHTML;
    setLastContent(newContent);
    onChange(newContent);
  };

  return (
    <div
      ref={combinedRef}
      contentEditable
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      className="p-4 min-h-[400px] focus:outline-none prose max-w-none"
      style={{ 
        minHeight: '400px',
        lineHeight: '1.6'
      }}
      suppressContentEditableWarning={true}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

export default function RichEditor({ content, onChange, title, onTitleChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [floatingToolbar, setFloatingToolbar] = useState<FloatingToolbarState>({
    show: false,
    x: 0,
    y: 0
  });
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Save and restore selection
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSavedSelection(range.cloneRange());
      return range;
    }
    return null;
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }
  }, [savedSelection]);

  // Enhanced command execution that preserves selection
  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    restoreSelection();
    
    if (command === 'formatBlock' && value && ['h1', 'h2', 'h3'].includes(value)) {
      // Custom heading implementation to handle selected text only
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const selectedText = range.toString();
          if (selectedText.trim()) {
            const headingElement = document.createElement(value);
            headingElement.textContent = selectedText;
            headingElement.style.margin = '16px 0';
            headingElement.style.fontWeight = 'bold';
            
            range.deleteContents();
            range.insertNode(headingElement);
            
            // Keep the heading selected after creation
            const newRange = document.createRange();
            newRange.selectNodeContents(headingElement);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            saveSelection();
          }
        }
      }
    } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // Enhanced list handling
      document.execCommand(command, false, undefined);
      
      // Maintain selection after list creation
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          saveSelection();
        }
      }, 10);
    } else if (command.startsWith('justify')) {
      // Enhanced alignment
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const container = document.createElement('div');
          container.style.textAlign = command.replace('justify', '').toLowerCase();
          
          try {
            container.appendChild(range.extractContents());
            range.insertNode(container);
            
            // Keep selection on the aligned content
            const newRange = document.createRange();
            newRange.selectNodeContents(container);
            selection.removeAllRanges();
            selection.addRange(newRange);
            saveSelection();
          } catch (e) {
            // Fallback to document.execCommand
            document.execCommand(command, false, undefined);
            saveSelection();
          }
        } else {
          document.execCommand(command, false, undefined);
        }
      }
    } else {
      // Use standard execCommand for other operations like bold, italic, underline
      document.execCommand(command, false, value);
      
      // Maintain selection after formatting
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          saveSelection();
        }
      }, 10);
    }
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [restoreSelection, onChange, saveSelection]);

  // Handle text selection and show floating toolbar
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (!range.collapsed && editorRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        
        setFloatingToolbar({
          show: true,
          x: Math.max(10, rect.left + (rect.width / 2) - 200), // Center toolbar above selection
          y: Math.max(10, rect.top - 60) // Position above selection
        });
        
        saveSelection();
      } else {
        setFloatingToolbar({ show: false, x: 0, y: 0 });
      }
    } else {
      setFloatingToolbar({ show: false, x: 0, y: 0 });
    }
  }, [saveSelection]);

  // Handle content changes while preserving cursor position
  const handleContentChange = useCallback((e: any) => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Close floating toolbar when clicking outside
  const handleDocumentClick = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    if (target && !target.closest('.floating-toolbar') && !editorRef.current?.contains(target as Node)) {
      setFloatingToolbar({ show: false, x: 0, y: 0 });
      setSavedSelection(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [handleSelection, handleDocumentClick]);

  const insertLink = () => {
    if (linkUrl) {
      restoreSelection();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        // If we have selected text, use it as the link text
        // If no text is selected or user provided custom link text, use that
        const finalLinkText = selectedText.trim() 
          ? selectedText 
          : (linkText.trim() || linkUrl);
        
        const linkElement = document.createElement('a');
        linkElement.href = linkUrl;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.style.color = '#3b82f6';
        linkElement.style.textDecoration = 'underline';
        linkElement.textContent = finalLinkText;
        
        // If there's selected text, replace it with the link
        if (!range.collapsed) {
          range.deleteContents();
        }
        
        range.insertNode(linkElement);
        
        // Place cursor after the link
        range.setStartAfter(linkElement);
        range.setEndAfter(linkElement);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      
      setLinkUrl("");
      setLinkText("");
      setShowLinkDialog(false);
      editorRef.current?.focus();
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      restoreSelection();
      const imgHTML = `<div style="text-align: center; margin: 20px 0;"><img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`;
      
      document.execCommand('insertHTML', false, imgHTML);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      
      setImageUrl("");
      setImageAlt("");
      setShowImageDialog(false);
      editorRef.current?.focus();
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <div className="space-y-4 relative">
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

      {/* Floating Toolbar */}
      {floatingToolbar.show && (
        <div 
          className="floating-toolbar fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1"
          style={{ 
            left: `${floatingToolbar.x}px`, 
            top: `${floatingToolbar.y}px`,
            maxWidth: '400px'
          }}
        >
          {toolbarButtons.map((btn, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                executeCommand(btn.command, btn.value);
                // Keep the toolbar visible and re-trigger selection check
                setTimeout(() => {
                  handleSelection();
                }, 50);
              }}
              title={btn.title}
              className="p-2 h-8 w-8"
            >
              <btn.icon className="w-3 h-3" />
            </Button>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Save selection and pre-fill link text if there's selected text
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = range.toString();
                if (selectedText.trim()) {
                  setLinkText(selectedText.trim());
                }
              }
              
              saveSelection();
              setShowLinkDialog(true);
            }}
            title="Insert Link"
            className="p-2 h-8 w-8"
          >
            <Link className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              saveSelection();
              setShowImageDialog(true);
            }}
            title="Insert Image"
            className="p-2 h-8 w-8"
          >
            <Image className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="border rounded-lg">
        {/* Static Toolbar */}
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
            onClick={() => {
              // Save selection and pre-fill link text if there's selected text
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = range.toString();
                if (selectedText.trim()) {
                  setLinkText(selectedText.trim());
                }
              }
              
              saveSelection();
              setShowLinkDialog(true);
            }}
            title="Insert Link"
            className="p-2"
          >
            <Link className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              saveSelection();
              setShowImageDialog(true);
            }}
            title="Insert Image"
            className="p-2"
          >
            <Image className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor Content */}
        <EditorContent
          ref={editorRef}
          content={content}
          onChange={onChange}
          onKeyDown={(e) => {
            // Prevent default behavior for formatting shortcuts
            if (e.ctrlKey || e.metaKey) {
              switch (e.key) {
                case 'b':
                  e.preventDefault();
                  executeCommand('bold');
                  break;
                case 'i':
                  e.preventDefault();
                  executeCommand('italic');
                  break;
                case 'u':
                  e.preventDefault();
                  executeCommand('underline');
                  break;
              }
            }
          }}
        />
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Link Text (optional)</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text</label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Description of the image"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertImage} disabled={!imageUrl}>
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}