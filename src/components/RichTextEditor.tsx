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
  Type,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import { isSafeUrl } from '../lib/sanitizeHtml';

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
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  const scrollToTop = () => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollTo({
        top: canvasContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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
    // Bersihkan penanda visual seleksi aktif sebelum menyimpan ke HTML
    const clone = editorRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('img').forEach((img) => {
      img.classList.remove('selected-img-active');
      img.style.outline = '';
      img.style.outlineOffset = '';
    });
    const html = clone.innerHTML;
    onChange(html);
    updateCounts();
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      if (editorRef.current) {
        editorRef.current.querySelectorAll('img').forEach((el) => {
          el.classList.remove('selected-img-active');
        });
      }
      img.classList.add('selected-img-active');
      setSelectedImage(img);
    } else {
      if (selectedImage) {
        selectedImage.classList.remove('selected-img-active');
        setSelectedImage(null);
      }
    }
  };

  const handleAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    // 1. Jika ada gambar yang sedang diklik/dipilih
    if (selectedImage) {
      if (align === 'center') {
        selectedImage.style.display = 'block';
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = 'auto';
        selectedImage.setAttribute('data-align', 'center');
        if (selectedImage.parentElement) {
          selectedImage.parentElement.style.textAlign = 'center';
        }
      } else if (align === 'left') {
        selectedImage.style.display = 'block';
        selectedImage.style.marginLeft = '0';
        selectedImage.style.marginRight = 'auto';
        selectedImage.setAttribute('data-align', 'left');
        if (selectedImage.parentElement) {
          selectedImage.parentElement.style.textAlign = 'left';
        }
      } else if (align === 'right') {
        selectedImage.style.display = 'block';
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = '0';
        selectedImage.setAttribute('data-align', 'right');
        if (selectedImage.parentElement) {
          selectedImage.parentElement.style.textAlign = 'right';
        }
      } else if (align === 'justify') {
        selectedImage.style.display = 'block';
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = 'auto';
        selectedImage.style.width = '100%';
        selectedImage.setAttribute('data-align', 'center');
        selectedImage.setAttribute('data-size', 'full');
      }
      handleInput();
      return;
    }

    // 2. Jika kursor berada di dekat atau di dalam blok gambar
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
      const img = el?.tagName === 'IMG' ? (el as HTMLImageElement) : el?.querySelector('img');
      if (img) {
        if (align === 'center') {
          img.style.display = 'block';
          img.style.marginLeft = 'auto';
          img.style.marginRight = 'auto';
          img.setAttribute('data-align', 'center');
          if (img.parentElement) img.parentElement.style.textAlign = 'center';
        } else if (align === 'left') {
          img.style.display = 'block';
          img.style.marginLeft = '0';
          img.style.marginRight = 'auto';
          img.setAttribute('data-align', 'left');
          if (img.parentElement) img.parentElement.style.textAlign = 'left';
        } else if (align === 'right') {
          img.style.display = 'block';
          img.style.marginLeft = 'auto';
          img.style.marginRight = '0';
          img.setAttribute('data-align', 'right');
          if (img.parentElement) img.parentElement.style.textAlign = 'right';
        }
        handleInput();
        return;
      }
    }

    // 3. Rata paragraf teks biasa
    const cmdMap: Record<string, string> = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    };
    executeCommand(cmdMap[align]);
  };

  const handleImageSize = (size: 'medium' | 'large' | 'full') => {
    if (!selectedImage) return;
    if (size === 'medium') {
      selectedImage.style.width = '60%';
      selectedImage.setAttribute('data-size', 'medium');
    } else if (size === 'large') {
      selectedImage.style.width = '85%';
      selectedImage.setAttribute('data-size', 'large');
    } else if (size === 'full') {
      selectedImage.style.width = '100%';
      selectedImage.setAttribute('data-size', 'full');
    }
    handleInput();
  };

  const handleDeleteSelectedImage = () => {
    if (!selectedImage) return;
    const parent = selectedImage.parentElement;
    selectedImage.remove();
    if (parent && parent.childNodes.length === 0 && parent.tagName.toLowerCase() === 'p') {
      parent.remove();
    }
    setSelectedImage(null);
    handleInput();
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
    if (url && url.trim() !== '' && url.trim() !== 'https://') {
      const cleanUrl = url.trim();
      if (!isSafeUrl(cleanUrl)) {
        alert('Tautan tidak valid atau menggunakan protokol yang tidak aman!');
        return;
      }
      executeCommand('createLink', cleanUrl);
    }
  };

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      if (imgUrl && editorRef.current) {
        editorRef.current.focus();

        // Format gambar disisipkan: Otomatis RATA TENGAH, ukuran proporsional BESAR (85%), border-radius, dan shadow halus
        const imgHtml = `<p style="text-align: center; margin: 24px 0;" class="article-img-wrapper"><img src="${imgUrl}" alt="Dokumentasi Berita" data-align="center" data-size="large" style="display: block; margin-left: auto; margin-right: auto; width: 85%; max-width: 100%; height: auto; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" /></p><p><br></p>`;

        let inserted = false;
        try {
          inserted = document.execCommand('insertHTML', false, imgHtml);
        } catch {}

        if (!inserted && editorRef.current) {
          const div = document.createElement('div');
          div.innerHTML = imgHtml;
          while (div.firstChild) {
            editorRef.current.appendChild(div.firstChild);
          }
        }

        handleInput();

        // Otomatis aktifkan seleksi gambar baru agar admin bisa langsung atur jika diinginkan
        setTimeout(() => {
          if (!editorRef.current) return;
          const imgs = editorRef.current.querySelectorAll('img');
          const lastImg = imgs[imgs.length - 1];
          if (lastImg) {
            editorRef.current.querySelectorAll('img').forEach((el) => el.classList.remove('selected-img-active'));
            lastImg.classList.add('selected-img-active');
            setSelectedImage(lastImg);
            lastImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const textColors = [
    { name: 'Default', value: '#1e293b' },
    { name: 'Biru Korwil', value: '#2467ea' },
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('undo')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
            title="Urungkan (Undo - Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleBlockFormat('p')}
            className="px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 text-slate-700 flex items-center gap-1"
            title="Paragraf Normal"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Normal</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleBlockFormat('h2')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"
            title="Judul Bab (H2)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"
            title="Tebal (Bold - Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic"
            title="Miring (Italic - Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 underline"
            title="Garis Bawah (Underline - Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
              onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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
              onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAlignment('left')}
            className={`p-1.5 rounded transition-colors ${
              selectedImage && selectedImage.getAttribute('data-align') === 'left'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Rata Kiri"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAlignment('center')}
            className={`p-1.5 rounded transition-colors ${
              selectedImage && (!selectedImage.getAttribute('data-align') || selectedImage.getAttribute('data-align') === 'center')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Rata Tengah (Untuk Teks & Gambar)"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAlignment('right')}
            className={`p-1.5 rounded transition-colors ${
              selectedImage && selectedImage.getAttribute('data-align') === 'right'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
            title="Rata Kanan"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAlignment('justify')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors"
            title="Rata Kanan Kiri (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-300">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Daftar Butir (Bullet List)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Daftar Angka (Numbered List)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleBlockFormat('blockquote')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Kutipan (Blockquote)"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertLink}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            title="Sisipkan Tautan (Link)"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-500"
            title="Hapus Format (Clear Formatting)"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Scroll Canvas Navigation Buttons */}
        <div className="ml-auto flex items-center gap-1 pl-2 border-l border-slate-300">
          <button
            type="button"
            onClick={scrollToTop}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-blue-700 flex items-center gap-1 text-xs font-semibold transition-colors"
            title="Scroll Dokumen ke Paling Atas"
          >
            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden xl:inline text-[11px]">Ke Atas</span>
          </button>
          <button
            type="button"
            onClick={scrollToBottom}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-blue-700 flex items-center gap-1 text-xs font-semibold transition-colors"
            title="Scroll Dokumen ke Paling Bawah"
          >
            <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden xl:inline text-[11px]">Ke Bawah</span>
          </button>
        </div>
      </div>

      {/* Dedicated Image Action Bar when an image is clicked/selected */}
      {selectedImage && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-blue-200 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs text-blue-900 select-none shadow-xs z-10 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <span className="p-1 rounded-md bg-blue-600 text-white">
              <ImageIcon className="w-3.5 h-3.5" />
            </span>
            <span>Pengaturan Foto:</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Alignment Controls */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-blue-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase">Posisi:</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAlignment('left')}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  selectedImage.getAttribute('data-align') === 'left' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Rata Kiri"
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kiri</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAlignment('center')}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  !selectedImage.getAttribute('data-align') || selectedImage.getAttribute('data-align') === 'center' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Rata Tengah (Bawaan)"
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tengah</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAlignment('right')}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  selectedImage.getAttribute('data-align') === 'right' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Rata Kanan"
              >
                <AlignRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanan</span>
              </button>
            </div>

            {/* Size Controls */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-blue-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase">Ukuran:</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleImageSize('medium')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedImage.getAttribute('data-size') === 'medium' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Ukuran Sedang (60%)"
              >
                Sedang (60%)
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleImageSize('large')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  !selectedImage.getAttribute('data-size') || selectedImage.getAttribute('data-size') === 'large' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Ukuran Besar (85% - Rekomendasi)"
              >
                Besar (85%)
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleImageSize('full')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedImage.getAttribute('data-size') === 'full' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                }`}
                title="Ukuran Penuh (100%)"
              >
                Penuh (100%)
              </button>
            </div>

            {/* Delete Image Button */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleDeleteSelectedImage}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
              title="Hapus foto dari naskah"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Foto</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Document Canvas / Kertas Lembaran Dokumen Putih dengan Scroll Mandiri Up & Down */}
      <div className="relative group/canvas">
        <div 
          ref={canvasContainerRef}
          className="bg-slate-100/90 p-3 sm:p-6 lg:p-8 flex justify-center h-[520px] sm:h-[580px] overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          <div 
            className="bg-white max-w-3xl w-full min-h-[500px] h-fit p-6 sm:p-10 lg:p-12 rounded-xl shadow-lg border border-slate-200/90 text-slate-800 leading-relaxed prose prose-slate focus:ring-0 mb-8"
            style={{
              minHeight: '500px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              onClick={handleEditorClick}
              onInput={handleInput}
              onBlur={handleInput}
              data-placeholder={placeholder}
              className="outline-none min-h-[460px] text-sm sm:text-base leading-relaxed text-slate-800"
            />
          </div>
        </div>

        {/* Floating Quick Scroll Controls di dalam Canvas */}
        <div className="absolute right-3 sm:right-5 bottom-4 z-20 flex flex-col items-center gap-1.5 bg-white/95 backdrop-blur shadow-xl border border-slate-200/90 p-1.5 rounded-2xl select-none">
          <button
            type="button"
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 transition-all shadow-sm border border-slate-200 hover:border-blue-600 active:scale-95 group flex items-center justify-center"
            title="Scroll ke Bagian Paling Atas Naskah"
          >
            <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          </button>
          <div className="w-4 h-[1px] bg-slate-200" />
          <button
            type="button"
            onClick={scrollToBottom}
            className="p-2 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 transition-all shadow-sm border border-slate-200 hover:border-blue-600 active:scale-95 group flex items-center justify-center"
            title="Scroll ke Bagian Paling Bawah Naskah"
          >
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Document Editor Bottom Status Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3 font-medium">
          <span>{wordCount} Kata</span>
          <span>•</span>
          <span>{charCount} Karakter</span>
        </div>

        {/* Quick Scroll Actions in Status Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Navigasi Canvas:</span>
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={scrollToTop}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1 transition-colors"
              title="Gulir Naskah ke Bagian Paling Atas"
            >
              <ArrowUp className="w-3 h-3 text-blue-600" />
              <span>Ke Atas</span>
            </button>
            <div className="h-3 w-[1px] bg-slate-200 my-auto" />
            <button
              type="button"
              onClick={scrollToBottom}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1 transition-colors"
              title="Gulir Naskah ke Bagian Paling Bawah"
            >
              <ArrowDown className="w-3 h-3 text-blue-600" />
              <span>Ke Bawah</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden lg:inline border-l border-slate-200 pl-3">
            Lembar Kerja Dokumen Naskah Berita Resmi Korwilcam
          </span>
        </div>
      </div>
    </div>
  );
};
