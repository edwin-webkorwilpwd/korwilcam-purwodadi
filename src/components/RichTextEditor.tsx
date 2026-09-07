import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Link2, 
  Image as ImageIcon, 
  RotateCcw, 
  RotateCw, 
  Highlighter, 
  Eraser,
  Heading1,
  Heading2,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Mulai menulis isi naskah berita lengkap di lembar kerja ini...'
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Synchronize initial or external content changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!value) {
        editorRef.current.innerHTML = '';
      } else if (!value.includes('<') && !value.includes('>')) {
        // Wrap plain text lines into paragraphs
        editorRef.current.innerHTML = value
          .split('\n\n')
          .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
          .join('');
      } else {
        editorRef.current.innerHTML = value;
      }
      updateCounts();
    }
  }, [value]);

  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateCounts();
  };

  const executeCommand = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleBlockFormat = (tag: string) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  const handleInsertLink = () => {
    const url = prompt('Masukkan tautan link (URL):', 'https://');
    if (url && url !== 'https://') {
      executeCommand('createLink', url);
    }
  };

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      if (imgUrl) {
        executeCommand('insertImage', imgUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const textColors = [
    { name: 'Default', value: '#1e293b' },
    { name: 'Biru Korwil', value: '#1d4ed8' },
    { name: 'Merah Dinas', value: '#b91c1c' },
    { name: 'Hijau', value: '#15803d' },
    { name: 'Abu-abu', value: '#64748b' }
  ];

  const highlightColors = [
    { name: 'Tanpa Sorot', value: 'transparent' },
    { name: 'Kuning', value: '#fef08a' },
    { name: 'Hijau Muda', value: '#bbf7d0' },
    { name: 'Biru Muda', value: '#bae6fd' },
    { name: 'Merah Muda', value: '#fbcfe8' }
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
      {/* Top Document Toolbar (Sesuai Gambar 2 Pengguna) */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 sm:p-2.5 flex flex-wrap items-center gap-1 sm:gap-1.5 text-slate-700 sticky top-0 z-10 select-none">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
            title="Urungkan (Undo - Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
            title="Ulangi (Redo - Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Heading Style */}
        <div className="flex items-center gap-1 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => handleBlockFormat('p')}
            className="px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 text-slate-700 flex items-center gap-1"
            title="Paragraf Normal"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Normal</span>
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('h2')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"
            title="Judul Bab (H2)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('h3')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"
            title="Sub Judul (H3)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"
            title="Tebal (Bold - Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic"
            title="Miring (Italic - Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 underline"
            title="Garis Bawah (Underline - Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 line-through"
            title="Coret (Strikethrough)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Color & Highlight */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-0.5"
              title="Warna Huruf"
            >
              <span className="font-bold text-xs underline decoration-blue-600 decoration-2">A</span>
            </button>
            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 flex gap-1.5">
                {textColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      executeCommand('foreColor', c.value);
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
              title="Sorot Warna (Highlighter)"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            </button>
            {showHighlightPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 flex gap-1.5">
                {highlightColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      executeCommand('hiliteColor', c.value);
                      setShowHighlightPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Rata Kiri"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Rata Tengah"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Rata Kanan"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Rata Kanan Kiri (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Daftar Butir (Bullet List)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Daftar Angka (Numbered List)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleBlockFormat('blockquote')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Kutipan (Blockquote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertHorizontalRule')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Garis Pemisah (Horizontal Line)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Media & Link */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Sisipkan Tautan (Link)"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => inlineImageInputRef.current?.click()}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1"
            title="Sisipkan Gambar ke Lembar Naskah"
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-semibold hidden md:inline">Sisipkan Foto</span>
          </button>
          <input
            ref={inlineImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleInlineImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-500"
            title="Hapus Format (Clear Formatting)"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Document Canvas / Kertas Lembaran Dokumen Putih (Persis Gambar 2) */}
      <div className="bg-slate-100/90 p-3 sm:p-6 lg:p-8 flex justify-center min-h-[520px] overflow-x-auto">
        <div 
          className="bg-white max-w-3xl w-full min-h-[500px] p-6 sm:p-10 lg:p-12 rounded-xl shadow-lg border border-slate-200/90 text-slate-800 leading-relaxed prose prose-slate focus:ring-0"
          style={{
            minHeight: '500px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
            className="outline-none min-h-[460px] text-sm sm:text-base leading-relaxed text-slate-800"
          />
        </div>
      </div>

      {/* Document Editor Bottom Status Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3 font-medium">
          <span>{wordCount} Kata</span>
          <span>•</span>
          <span>{charCount} Karakter</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Lembar Kerja Dokumen Naskah Berita Resmi Korwilcam
        </div>
      </div>
    </div>
  );
};
