import * as React from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your high-impact article content here...",
  minHeight = "400px",
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const [isSourceMode, setIsSourceMode] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync initial content to contentEditable
  React.useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isSourceMode]);

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertHeading = (tag: string) => {
    execCommand("formatBlock", `<${tag}>`);
  };

  const handleInsertLink = () => {
    const url = prompt("Enter link URL (e.g. https://example.com):");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleInsertImage = async (file: File) => {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog-images");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");
      const data = (await res.json()) as { success: boolean; url: string };

      execCommand(
        "insertHTML",
        `<img src="${data.url}" alt="${file.name}" class="rounded-2xl max-w-full my-4 shadow-md" />`,
      );
      toast.success("Image uploaded to Cloudflare R2 and inserted!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="table w-full my-4 border border-base-300 rounded-xl overflow-hidden text-xs">
        <thead>
          <tr class="bg-base-200">
            <th class="border border-base-300 p-2 font-bold">Header 1</th>
            <th class="border border-base-300 p-2 font-bold">Header 2</th>
            <th class="border border-base-300 p-2 font-bold">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-base-300 p-2">Data 1</td>
            <td class="border border-base-300 p-2">Data 2</td>
            <td class="border border-base-300 p-2">Data 3</td>
          </tr>
          <tr>
            <td class="border border-base-300 p-2">Data 4</td>
            <td class="border border-base-300 p-2">Data 5</td>
            <td class="border border-base-300 p-2">Data 6</td>
          </tr>
        </tbody>
      </table>
    `;
    execCommand("insertHTML", tableHtml);
  };

  const handleInsertCallout = () => {
    const calloutHtml = `
      <div class="p-4 my-4 rounded-2xl bg-primary/10 border-l-4 border-primary text-base-content text-sm">
        <strong class="text-primary block font-bold">💡 Pro-Tip:</strong>
        <span>Write your actionable insight or takeaway here.</span>
      </div>
    `;
    execCommand("insertHTML", calloutHtml);
  };

  // Calculate word count
  const textContent = value.replace(/<[^>]*>/g, " ").trim();
  const wordCount = textContent ? textContent.split(/\s+/).length : 0;
  const charCount = textContent.length;

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden flex flex-col">
      {/* CKEditor 5 / Venix Professional Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b border-base-300 bg-base-200/50">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Headings */}
          <select
            onChange={(e) => {
              if (e.target.value) handleInsertHeading(e.target.value);
            }}
            className="select select-bordered select-xs rounded-lg font-bold text-xs h-7 min-h-0 bg-base-100"
            defaultValue=""
          >
            <option value="" disabled>
              Format
            </option>
            <option value="p">Paragraph</option>
            <option value="h2">Heading 2 (H2)</option>
            <option value="h3">Heading 3 (H3)</option>
            <option value="h4">Heading 4 (H4)</option>
            <option value="blockquote">Quote Block</option>
          </select>

          <div className="divider divider-horizontal mx-1 my-1"></div>

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => execCommand("bold")}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 font-black hover:bg-base-300"
            title="Bold (Ctrl+B)"
          >
            <Icon icon="solar:text-bold-bold" className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("italic")}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 font-serif italic hover:bg-base-300"
            title="Italic (Ctrl+I)"
          >
            <Icon icon="solar:text-italic-bold" className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("underline")}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 underline hover:bg-base-300"
            title="Underline (Ctrl+U)"
          >
            <Icon icon="solar:text-underline-bold" className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("strikeThrough")}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 line-through hover:bg-base-300"
            title="Strikethrough"
          >
            <Icon icon="solar:text-cross-bold" className="h-4 w-4" />
          </button>

          <div className="divider divider-horizontal mx-1 my-1"></div>

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCommand("insertUnorderedList")}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 hover:bg-base-300"
            title="Bullet List"
          >
            <Icon icon="solar:list-bold" className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("insertOrderedList")}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 hover:bg-base-300"
            title="Numbered List"
          >
            <Icon
              icon="solar:list-heart-minimalistic-bold"
              className="h-4 w-4"
            />
          </button>

          <div className="divider divider-horizontal mx-1 my-1"></div>

          {/* Inserts: Link, Cloudflare Image, Table, Callout */}
          <button
            type="button"
            onClick={handleInsertLink}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 hover:bg-base-300 gap-1 font-bold text-xs"
            title="Insert Link"
          >
            <Icon
              icon="solar:link-bold-duotone"
              className="h-4 w-4 text-primary"
            />
            <span>Link</span>
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 hover:bg-base-300 gap-1 font-bold text-xs"
            title="Upload R2 Image"
          >
            <Icon
              icon="solar:gallery-send-bold-duotone"
              className="h-4 w-4 text-emerald-500"
            />
            <span>{isUploadingImage ? "Uploading..." : "Image (R2)"}</span>
          </button>

          <button
            type="button"
            onClick={handleInsertTable}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 hover:bg-base-300 gap-1 font-bold text-xs"
            title="Insert Table"
          >
            <Icon
              icon="solar:table-bold-duotone"
              className="h-4 w-4 text-indigo-500"
            />
            <span>Table</span>
          </button>

          <button
            type="button"
            onClick={handleInsertCallout}
            className="btn btn-ghost btn-xs rounded-lg px-2 h-7 hover:bg-base-300 gap-1 font-bold text-xs"
            title="Insert Pro-Tip Callout"
          >
            <Icon
              icon="solar:lightbulb-bold-duotone"
              className="h-4 w-4 text-amber-500"
            />
            <span>Callout</span>
          </button>
        </div>

        {/* Right side: Mode Switch (Visual vs HTML) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`btn btn-xs rounded-lg font-bold gap-1 ${
              isSourceMode ? "btn-primary text-white" : "btn-ghost"
            }`}
          >
            <Icon icon="solar:code-bold" className="h-3.5 w-3.5" />
            <span>{isSourceMode ? "Visual Editor" : "HTML Source"}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {isSourceMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          className="w-full p-4 font-mono text-xs bg-base-200/50 focus:outline-none resize-y border-none"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="w-full p-6 text-sm text-base-content leading-relaxed focus:outline-none overflow-y-auto prose prose-sm max-w-none dark:prose-invert"
        />
      )}

      {/* Editor Footer / Word & Character Counters */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-base-300 bg-base-200/30 text-[11px] text-base-content/60 font-mono">
        <div className="flex items-center gap-4">
          <span>
            <strong>{wordCount}</strong> words
          </span>
          <span>
            <strong>{charCount}</strong> characters
          </span>
          <span>
            <strong>{Math.ceil(wordCount / 200)}</strong> min read
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5" />
          <span>CKEditor 5 Engine Active</span>
        </div>
      </div>

      {/* Hidden File Input for R2 Image Upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            void handleInsertImage(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
