"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Link, Image } from "lucide-react"

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertText = (before: string, after = "") => {
    const textarea = document.getElementById("rich-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
  }

  const formatBold = () => insertText("<strong>", "</strong>")
  const formatItalic = () => insertText("<em>", "</em>")
  const insertLink = () => insertText('<a href="">', "</a>")
  const insertImage = () => insertText('<img src="" alt="" />')

  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-2 p-2 border-b">
        <Button type="button" variant="ghost" size="sm" onClick={formatBold}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={formatItalic}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertLink}>
          <Link className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertImage}>
          <Image className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {isPreview ? (
          <div 
            className="min-h-[200px] prose max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <Textarea
            id="rich-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] border-0 resize-none focus-visible:ring-0"
          />
        )}
      </div>
    </div>
  )
}