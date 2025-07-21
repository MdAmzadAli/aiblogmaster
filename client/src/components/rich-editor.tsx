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
  const [isInitialized, setIsInitialized] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<string>(content);
  const isUpdatingRef = useRef<boolean>(false);

  // Combine refs
  const combinedRef = useCallback((node: HTMLDivElement) => {
    (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
    
    // Initialize content only once when the element is created
    if (node && !isInitialized) {
      node.innerHTML = content;
      contentRef.current = content;
      setIsInitialized(true);
    }
  }, [ref, content, isInitialized]);

  // Only update content if it changed from external source (not from user typing)
  useEffect(() => {
    if (innerRef.current && isInitialized && content !== contentRef.current && !isUpdatingRef.current && !isComposing) {
      // This is an external content change, update the DOM
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      let needsRestore = false;
      
      // Save selection if this element has focus
      if (document.activeElement === innerRef.current && selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
        needsRestore = true;
      }
      
      innerRef.current.innerHTML = content;
      contentRef.current = content;
      
      // Restore selection
      if (needsRestore && savedRange) {
        try {
          selection?.removeAllRanges();
          selection?.addRange(savedRange);
        } catch (e) {
          // Range might be invalid, place cursor at end
          const range = document.createRange();
          range.selectNodeContents(innerRef.current);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }
  }, [content, isInitialized, isComposing]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!isComposing && innerRef.current) {
      isUpdatingRef.current = true;
      const newContent = innerRef.current.innerHTML;
      contentRef.current = newContent;
      onChange(newContent);
      // Reset the flag after a short delay to allow React to process the change
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 10);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);
    if (innerRef.current) {
      isUpdatingRef.current = true;
      const newContent = innerRef.current.innerHTML;
      contentRef.current = newContent;
      onChange(newContent);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 10);
    }
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
        lineHeight: '1.6',
        // Make empty areas clickable by ensuring the element fills space
        whiteSpace: 'pre-wrap',
        // Ensure clickable gaps between paragraphs
        paddingBottom: '20px'
      }}
      onClick={(e) => {
        // Handle clicks on empty areas between paragraphs
        if (innerRef.current && e.target === innerRef.current) {
          const rect = innerRef.current.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const lineHeight = parseFloat(getComputedStyle(innerRef.current).lineHeight) || 24;
          
          // If clicking in empty space, place cursor at the end
          const selection = window.getSelection();
          const range = document.createRange();
          
          // Try to place cursor at the clicked position
          try {
            if ((document as any).caretPositionFromPoint) {
              const caretPos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
              if (caretPos) {
                range.setStart(caretPos.offsetNode, caretPos.offset);
                range.collapse(true);
              }
            } else if ((document as any).caretRangeFromPoint) {
              const caretRange = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
              if (caretRange) {
                range.setStart(caretRange.startContainer, caretRange.startOffset);
                range.collapse(true);
              }
            } else {
              // Fallback: place cursor at the end of content
              range.selectNodeContents(innerRef.current);
              range.collapse(false);
            }
            
            selection?.removeAllRanges();
            selection?.addRange(range);
          } catch (error) {
            // Fallback: place cursor at the end
            range.selectNodeContents(innerRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      }}
      suppressContentEditableWarning={true}
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
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

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

  // Check active formatting states for selected text
  const checkActiveFormats = useCallback(() => {
    const activeSet = new Set<string>();
    
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
        // Check for basic formatting
        if (document.queryCommandState('bold')) activeSet.add('bold');
        if (document.queryCommandState('italic')) activeSet.add('italic');
        if (document.queryCommandState('underline')) activeSet.add('underline');
        
        // Check for heading formats by examining selected elements
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
        
        if (parent) {
          // Check for our inline heading classes
          if (parent.classList?.contains('h1') || parent.tagName === 'H1') activeSet.add('h1');
          if (parent.classList?.contains('h2') || parent.tagName === 'H2') activeSet.add('h2');
          if (parent.classList?.contains('h3') || parent.tagName === 'H3') activeSet.add('h3');
          
          // Check parent elements for formatting
          let currentElement: Element | null = parent;
          while (currentElement && currentElement !== editorRef.current) {
            if (currentElement.classList?.contains('h1') || currentElement.tagName === 'H1') activeSet.add('h1');
            if (currentElement.classList?.contains('h2') || currentElement.tagName === 'H2') activeSet.add('h2');
            if (currentElement.classList?.contains('h3') || currentElement.tagName === 'H3') activeSet.add('h3');
            currentElement = currentElement.parentElement;
          }
        }
      }
    } catch (error) {
      // Silently handle any errors in format checking
    }
    
    setActiveFormats(activeSet);
    return activeSet;
  }, []);

  // Enhanced command execution that preserves selection
  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    restoreSelection();
    
    if (command === 'formatBlock' && value && ['h1', 'h2', 'h3'].includes(value)) {
      // Custom heading implementation that preserves inline flow
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const selectedText = range.toString();
          if (selectedText.trim()) {
            // Create an inline heading element that doesn't break text flow
            const headingElement = document.createElement('span');
            headingElement.textContent = selectedText;
            headingElement.className = `inline-heading ${value}`;
            
            // Apply appropriate styling based on heading level
            const headingStyles = {
              h1: { fontSize: '2rem', fontWeight: 'bold', lineHeight: '1.2' },
              h2: { fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1.3' },
              h3: { fontSize: '1.25rem', fontWeight: 'bold', lineHeight: '1.4' }
            };
            
            const styles = headingStyles[value as keyof typeof headingStyles];
            Object.assign(headingElement.style, styles);
            
            // Store the original selection for restoration
            const savedRange = range.cloneRange();
            
            range.deleteContents();
            range.insertNode(headingElement);
            
            // Immediately select the new heading element and force toolbar persistence
            const newRange = document.createRange();
            newRange.selectNodeContents(headingElement);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Force immediate state updates
            const persistedRange = newRange.cloneRange();
            setSavedSelection(persistedRange);
            
            // Force toolbar to show immediately
            const rect = headingElement.getBoundingClientRect();
            setFloatingToolbar({
              show: true,
              x: Math.max(10, rect.left + (rect.width / 2) - 200),
              y: Math.max(10, rect.top - 60)
            });
            
            // Multiple aggressive restoration attempts to ensure selection persists
            const restoreSelection = () => {
              const currentSelection = window.getSelection();
              if (currentSelection && headingElement.parentNode) {
                currentSelection.removeAllRanges();
                const restoreRange = document.createRange();
                restoreRange.selectNodeContents(headingElement);
                currentSelection.addRange(restoreRange);
                setSavedSelection(restoreRange.cloneRange());
                
                const newRect = headingElement.getBoundingClientRect();
                setFloatingToolbar({
                  show: true,
                  x: Math.max(10, newRect.left + (newRect.width / 2) - 200),
                  y: Math.max(10, newRect.top - 60)
                });
                checkActiveFormats();
              }
            };
            
            // Restore selection multiple times with different delays
            setTimeout(restoreSelection, 1);
            setTimeout(restoreSelection, 10);
            setTimeout(restoreSelection, 50);
            setTimeout(restoreSelection, 100);
            setTimeout(restoreSelection, 200);
          }
        }
      }
    } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // Enhanced list handling with selection preservation
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }
      
      document.execCommand(command, false, undefined);
      
      // Maintain selection after list creation
      setTimeout(() => {
        if (savedRange) {
          try {
            const selection = window.getSelection();
            if (selection) {
              // Try to restore original selection
              selection.removeAllRanges();
              selection.addRange(savedRange);
              saveSelection();
            }
          } catch (e) {
            // If range is invalid, try to select the list item content
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              saveSelection();
            }
          }
        } else {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            saveSelection();
          }
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
      // For all other commands (bold, italic, underline, etc.)
      // Save current selection, execute command, then restore selection
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }
      
      document.execCommand(command, false, value);
      
      // Restore selection to keep text selected after formatting
      setTimeout(() => {
        if (savedRange) {
          try {
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(savedRange);
              saveSelection();
              checkActiveFormats();
              
              // Update floating toolbar position if visible
              if (floatingToolbar.show) {
                const rect = savedRange.getBoundingClientRect();
                setFloatingToolbar({
                  show: true,
                  x: Math.max(10, rect.left + (rect.width / 2) - 200),
                  y: Math.max(10, rect.top - 60)
                });
              }
            }
          } catch (e) {
            // Range might be invalid, try to reselect similar area
            console.log('Selection restoration failed for command:', command);
          }
        }
      }, 10);
    }
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [restoreSelection, onChange, saveSelection]);

  // Enhanced selection handling that aggressively preserves toolbar visibility
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (!range.collapsed && editorRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        
        const newX = Math.max(10, rect.left + (rect.width / 2) - 200);
        const newY = Math.max(10, rect.top - 60);
        
        // Always force toolbar to show
        setFloatingToolbar({
          show: true,
          x: newX,
          y: newY
        });
        
        saveSelection();
        checkActiveFormats();
      } else if (savedSelection && floatingToolbar.show) {
        // If we have a saved selection and toolbar is showing, try to restore it
        try {
          selection.removeAllRanges();
          selection.addRange(savedSelection);
          const rect = savedSelection.getBoundingClientRect();
          setFloatingToolbar({
            show: true,
            x: Math.max(10, rect.left + (rect.width / 2) - 200),
            y: Math.max(10, rect.top - 60)
          });
          checkActiveFormats();
        } catch (e) {
          // If restoration fails, keep toolbar visible but hide it
          if (!savedSelection) {
            setFloatingToolbar({ show: false, x: 0, y: 0 });
            setActiveFormats(new Set());
          }
        }
      } else if (!savedSelection) {
        // Only hide if we have no saved selection
        setFloatingToolbar({ show: false, x: 0, y: 0 });
        setActiveFormats(new Set());
      }
    } else if (savedSelection && floatingToolbar.show) {
      // Keep toolbar visible if we have a saved selection
      try {
        selection?.removeAllRanges();
        selection?.addRange(savedSelection);
        const rect = savedSelection.getBoundingClientRect();
        setFloatingToolbar({
          show: true,
          x: Math.max(10, rect.left + (rect.width / 2) - 200),
          y: Math.max(10, rect.top - 60)
        });
        checkActiveFormats();
      } catch (e) {
        // Keep toolbar visible even if restoration fails
      }
    } else if (!savedSelection) {
      setFloatingToolbar({ show: false, x: 0, y: 0 });
      setActiveFormats(new Set());
    }
  }, [saveSelection, floatingToolbar.show, checkActiveFormats, savedSelection]);

  // This is now handled by EditorContent component

  // Enhanced click handling with better selection preservation
  const handleDocumentClick = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    
    // Check if click is on toolbar or editor
    const isToolbarClick = target.closest('.floating-toolbar');
    const isEditorClick = editorRef.current?.contains(target as Node);
    
    if (!isToolbarClick && !isEditorClick) {
      // Only hide toolbar if clicking completely outside editor and toolbar
      setFloatingToolbar({ show: false, x: 0, y: 0 });
      setSavedSelection(null);
      setActiveFormats(new Set());
    } else if (isEditorClick && !target.closest('.floating-toolbar')) {
      // If clicking in editor but not on toolbar, be more conservative about hiding toolbar
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
          // Text is still selected, keep toolbar visible and update position
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setFloatingToolbar({
            show: true,
            x: Math.max(10, rect.left + (rect.width / 2) - 200),
            y: Math.max(10, rect.top - 60)
          });
          setSavedSelection(range.cloneRange());
          checkActiveFormats();
        } else if (!savedSelection) {
          // No text selected and no saved selection, hide toolbar
          setFloatingToolbar({ show: false, x: 0, y: 0 });
          setActiveFormats(new Set());
        }
        // If we have a saved selection but no current selection, keep toolbar visible
      }, 10);
    }
  }, [handleSelection, savedSelection, checkActiveFormats]);

  useEffect(() => {
    // Enhanced event listeners for better selection persistence
    const handleSelectionChange = () => {
      // Only update if we're in the editor
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.focusNode as Node)) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          // Save the selection whenever it changes
          setSavedSelection(range.cloneRange());
          checkActiveFormats();
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelection, handleDocumentClick, checkActiveFormats]);

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
    { icon: Bold, command: 'bold', title: 'Bold', format: 'bold' },
    { icon: Italic, command: 'italic', title: 'Italic', format: 'italic' },
    { icon: Underline, command: 'underline', title: 'Underline', format: 'underline' },
    { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1', format: 'h1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2', format: 'h2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3', format: 'h3' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List', format: 'list' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List', format: 'orderedlist' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left', format: 'left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center', format: 'center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right', format: 'right' },
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
                
                // Enhanced selection persistence for toolbar buttons
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
                    // We have a selection, ensure toolbar stays visible
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setFloatingToolbar({
                      show: true,
                      x: Math.max(10, rect.left + (rect.width / 2) - 200),
                      y: Math.max(10, rect.top - 60)
                    });
                    setSavedSelection(range.cloneRange());
                    checkActiveFormats();
                  } else {
                    // No selection, trigger normal selection handling
                    handleSelection();
                  }
                }, 10);
                
                // Aggressive selection persistence with multiple attempts
                const ensureSelectionPersists = () => {
                  const selection = window.getSelection();
                  if ((!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) && savedSelection) {
                    try {
                      if (selection && savedSelection) {
                        selection.removeAllRanges();
                        selection.addRange(savedSelection);
                        
                        const rect = savedSelection.getBoundingClientRect();
                        setFloatingToolbar({
                          show: true,
                          x: Math.max(10, rect.left + (rect.width / 2) - 200),
                          y: Math.max(10, rect.top - 60)
                        });
                        checkActiveFormats();
                      }
                    } catch (e) {
                      // Keep trying to maintain toolbar visibility
                      setFloatingToolbar(prev => prev.show ? prev : { show: false, x: 0, y: 0 });
                    }
                  }
                };
                
                // Multiple persistence attempts
                setTimeout(ensureSelectionPersists, 50);
                setTimeout(ensureSelectionPersists, 150);
                setTimeout(ensureSelectionPersists, 300);
              }}
              title={btn.title}
              className={`p-2 h-8 w-8 ${
                activeFormats.has(btn.format) 
                  ? 'bg-gray-200 dark:bg-gray-600' 
                  : ''
              }`}
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
              className={`p-2 ${
                activeFormats.has(btn.format) 
                  ? 'bg-gray-200 dark:bg-gray-600' 
                  : ''
              }`}
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