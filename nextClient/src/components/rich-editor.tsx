"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Image, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export default function RichEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className,
  minHeight = "300px"
}: RichEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after = "", placeholder = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const textToInsert = selectedText || placeholder
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    
    onChange(newText)
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (textarea) {
        const newPosition = start + before.length + textToInsert.length
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
      }
    }, 0)
  }

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        insertText('**', '**', 'bold text')
        break
      case 'italic':
        insertText('*', '*', 'italic text')
        break
      case 'underline':
        insertText('<u>', '</u>', 'underlined text')
        break
      case 'link':
        insertText('[', '](url)', 'link text')
        break
      case 'image':
        insertText('![', '](image-url)', 'alt text')
        break
      case 'ul':
        insertText('\n- ', '', 'list item')
        break
      case 'ol':
        insertText('\n1. ', '', 'numbered item')
        break
      case 'quote':
        insertText('\n> ', '', 'quote text')
        break
      case 'code':
        insertText('`', '`', 'code')
        break
      case 'codeblock':
        insertText('\n```\n', '\n```\n', 'code block')
        break
      case 'h1':
        insertText('\n# ', '', 'Heading 1')
        break
      case 'h2':
        insertText('\n## ', '', 'Heading 2')
        break
      case 'h3':
        insertText('\n### ', '', 'Heading 3')
        break
      default:
        break
    }
  }

  const renderPreview = (markdown: string) => {
    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg" />')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$2</li>')
      .replace(/\n/g, '<br>')

    return html
  }

  const toolbarButtons = [
    { icon: Bold, action: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, action: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, action: 'underline', title: 'Underline' },
    { icon: Link, action: 'link', title: 'Insert Link' },
    { icon: Image, action: 'image', title: 'Insert Image' },
    { icon: List, action: 'ul', title: 'Bullet List' },
    { icon: ListOrdered, action: 'ol', title: 'Numbered List' },
    { icon: Quote, action: 'quote', title: 'Quote' },
    { icon: Code, action: 'code', title: 'Inline Code' },
  ]

  const headingButtons = [
    { label: 'H1', action: 'h1' },
    { label: 'H2', action: 'h2' },
    { label: 'H3', action: 'h3' },
  ]

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-1">
          {/* Text formatting buttons */}
          {toolbarButtons.map(({ icon: Icon, action, title }) => (
            <Button
              key={action}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => formatText(action)}
              title={title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
          
          <div className="mx-2 h-4 w-px bg-gray-300 dark:bg-gray-600" />
          
          {/* Heading buttons */}
          {headingButtons.map(({ label, action }) => (
            <Button
              key={action}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-bold"
              onClick={() => formatText(action)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Preview toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-2"
        >
          {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{isPreview ? 'Edit' : 'Preview'}</span>
        </Button>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {isPreview ? (
          <div 
            className="p-4 prose prose-sm max-w-none dark:prose-invert"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="resize-none border-0 focus-visible:ring-0 rounded-none"
            style={{ minHeight }}
            onKeyDown={(e) => {
              // Handle keyboard shortcuts
              if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                  case 'b':
                    e.preventDefault()
                    formatText('bold')
                    break
                  case 'i':
                    e.preventDefault()
                    formatText('italic')
                    break
                  case 'k':
                    e.preventDefault()
                    formatText('link')
                    break
                }
              }
            }}
          />
        )}
      </div>

      {/* Footer with tips */}
      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-t">
        <div className="flex justify-between items-center">
          <span>
            Markdown supported. Use **bold**, *italic*, [links](url), and more.
          </span>
          <span>
            {value.length} characters
          </span>
        </div>
      </div>
    </div>
  )
}