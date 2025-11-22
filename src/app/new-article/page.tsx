"use client";

import React, { useState } from "react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import {Streamdown} from "streamdown"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "../../../public/logo.png";
import Image from "next/image";
import { PlateEditor } from "@/components/plate-editor";
import { MarkdownPlugin } from "@platejs/markdown";
import { useChat } from "@ai-sdk/react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useId } from 'react';

const CATEGORIES = [
  "Tecnologia",
  "Saúde",
  "Política",
  "Economia",
  "Esportes",
  "Entretenimento",
  "Educação",
  "Cultura",
];

export default function NewsEditor() {
  const [input, setInput] = useState("");
  const [editorRef, setEditorRef] = useState<any | null>(null);
  const [insights, setInsights] = useState<
    { title: string; description: string }[]
  >([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [showPostSaveModal, setShowPostSaveModal] = useState(false);
  const [excerpt, setExcerpt] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [postSaveLoading, setPostSaveLoading] = useState(false);
  const [pendingArticle, setPendingArticle] = useState<{ id: string; title: string; content: string; category: string | null } | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const debounceRef = React.useRef<number | null>(null);

  const handleEditor = (editor: any) => {
    setEditorRef(editor);
  };

  const router = useRouter();

  const fetchInsightsFromMarkdown = async (md: string) => {
    setInsightsLoading(true);

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: md }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to fetch insights");
      }

      const json = await res.json();
      const rawSuggestions = json.suggestions[0];
      setInsights(rawSuggestions);
    } catch (err) {
      console.error("Failed to fetch insights", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleEditorChange = async () => {
    if (!editorRef) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        const md = editorRef.getApi(MarkdownPlugin).markdown.serialize();
        await fetchInsightsFromMarkdown(md);
      } catch (err) {
        // ignore
        console.error("Error generating insights", err);
      }
    }, 2000);
  };

  const handleSave = async () => {
    if (!editorRef) return;

    try {
      // serialize editor content to Markdown (GFM)
      const md = editorRef.getApi(MarkdownPlugin).markdown.serialize();

      // derive title from first non-empty markdown line
      const lines = md.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
      const title = lines.length ? String(lines[0]).slice(0, 255) : 'Untitled';

      const id = (globalThis as any).crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : Math.random().toString(36).slice(2, 10);

      // Store the article data for post-save processing
      setPendingArticle({ id, title, content: md, category: category || null });
      
      // Reset modal state
      setExcerpt("");
      setUploadedImage(null);
      setImagePreview("");
      
      // Open modal
      setShowPostSaveModal(true);
    } catch (err) {
      console.error(err);
      alert("Unexpected error preparing article");
    }
  };

  const handleCompleteArticleSave = async () => {
    if (!pendingArticle) return;

    setPostSaveLoading(true);
    try {
      let imageUrl = "https://jc.uol.com.br/img/logo.svg";

      // Upload image if provided
      if (uploadedImage) {
        const fileName = `${pendingArticle.id}-${Date.now()}-${uploadedImage.name}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("articles")
          .upload(fileName, uploadedImage);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: publicData } = supabase.storage
          .from("articles")
          .getPublicUrl(fileName);

        imageUrl = publicData?.publicUrl || imageUrl;
      }

      // Insert article with image and excerpt
      const { error } = await supabase
        .from("articles")
        .insert({
          id: pendingArticle.id,
          title: pendingArticle.title,
          content: pendingArticle.content,
          category: pendingArticle.category,
          excerpt: excerpt || null,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error", error);
        alert("Failed to save article");
        return;
      }

      // Clear state and close modal
      setShowPostSaveModal(false);
      setPendingArticle(null);
      setExcerpt("");
      setUploadedImage(null);
      setImagePreview("");

      router.push("/");
    } catch (err) {
      console.error(err);
      alert(`Error: ${err instanceof Error ? err.message : "Unexpected error saving article"}`);
    } finally {
      setPostSaveLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Generate Video dialog state
  const [openGenerate, setOpenGenerate] = React.useState(false);
  const [images, setImages] = React.useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [generating, setGenerating] = React.useState(false);

  const fileInputId = useId();

  const onAddFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).map((f) => ({ id: Math.random().toString(36).slice(2,9), file: f, preview: URL.createObjectURL(f) }));
    setImages((s) => [...s, ...arr]);
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const i = index;
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
  };

  const removeImage = (id: string) => {
    setImages((s) => s.filter((x) => x.id !== id));
  };

  const handleGenerate = async () => {
    if (!editorRef) {
      alert('Editor not ready');
      return;
    }

    setGenerating(true);
    try {
      const md = editorRef.getApi(MarkdownPlugin).markdown.serialize();

      const form = new FormData();
      form.append('content', md);

      // append images in order preserving order
      images.forEach((img, idx) => {
        // key 'images' repeated preserves order on server
        form.append('images', img.file, img.file.name || `image-${idx}`);
        form.append('image_order[]', String(idx));
      });

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed');
      }

      const json = await res.json();
      // TODO: show job id / result
      alert('Video generation started: ' + JSON.stringify(json));
      setOpenGenerate(false);
      setImages([]);
    } catch (err: any) {
      console.error(err);
      alert('Failed to start generation: ' + err?.message || err);
    } finally {
      setGenerating(false);
    }
  };
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      <header className="flex justify-between items-center px-8 h-16 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image src={Logo} alt="Logo" width={150} />
          </Link>
          <h1 className="text-lg font-semibold">Notícias Publicadas</h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1 rounded-md text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <option value="">Selecionar Categoria</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            className="ml-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
          >
            Salvar
          </button>
          <Dialog open={openGenerate} onOpenChange={setOpenGenerate}>
            <DialogTrigger asChild>
              <button className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">Gerar Vídeo</button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar Vídeo a partir do artigo</DialogTitle>
                <DialogDescription>Adicione imagens na ordem desejada e clique em Gerar para enviar o job.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <label htmlFor={fileInputId} className="block text-sm font-medium text-gray-700">Adicionar imagens</label>
                  <input id={fileInputId} type="file" accept="image/*" multiple onChange={(e) => onAddFiles(e.target.files)} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {images.length === 0 && <div className="text-sm text-gray-500">Nenhuma imagem adicionada.</div>}
                  {images.map((img, idx) => (
                    <div key={img.id} className="flex items-center gap-3 p-2 border rounded">
                      <img src={img.preview} alt={`img-${idx}`} className="w-20 h-12 object-cover rounded" />
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{img.file.name}</div>
                        <div className="text-xs text-gray-500">Posição: {idx + 1}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveImage(idx, -1)} className="px-2 py-1 bg-gray-100 rounded">↑</button>
                        <button onClick={() => moveImage(idx, 1)} className="px-2 py-1 bg-gray-100 rounded">↓</button>
                        <button onClick={() => removeImage(img.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Rem</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <div className="flex gap-2">
                  <button onClick={() => setOpenGenerate(false)} className="px-3 py-1 bg-gray-100 rounded">Cancelar</button>
                  <button onClick={handleGenerate} disabled={generating || images.length === 0} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">{generating ? 'Gerando...' : 'Gerar'}</button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="w-8 h-8 rounded-full bg-gray-300" />
        </div>
      </header>

      <main className="flex flex-grow overflow-hidden">
        <div className="flex-[2] p-4 bg-white overflow-y-auto">
          <PlateEditor onEditor={handleEditor} onChange={handleEditorChange} />
        </div>

        <aside className="flex-[1] overflow-auto bg-gray-50 border-l border-gray-200 p-4">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
            <TabsContent
              value="chat"
              className="flex-grow flex flex-col justify-between p-1 mt-2"
            >
              <div className="space-y-4 overflow-y-auto mb-2">
                {messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-md ${
                      message.role === "user" ? "self-end" : "self-start"
                    }`}
                  >
                    <div className="text-xs text-gray-500">
                      {message.role === "user" ? "You" : "Assistant"}
                    </div>
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <div
                            key={i}
                            className={`mt-1 whitespace-pre-wrap p-3 rounded-lg text-sm ${
                              message.role === "user"
                                ? "bg-gray-200 max-w-[90%]"
                                : "bg-white border border-gray-100"
                            }`}
                          >
                            {message.role === "assistant" ? <Streamdown>{part.text}</Streamdown> : part.text} 
                            {part.text}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Input
                  placeholder="Digite sua mensagem"
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) {
                      e.preventDefault();
                      sendMessage({ text: input });
                      setInput("");
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (!input.trim()) return;
                    sendMessage({ text: input });
                    setInput("");
                  }}
                  disabled={!input.trim() || status === "streaming"}
                >
                  Enviar
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="insights" className="p-2">
              <div className="flex flex-col h-full">
                <div className="text-sm text-gray-500 mb-2">Insights</div>
                <div className="flex-1 overflow-y-auto bg-white border rounded p-3">
                  {insightsLoading && (
                    <div className="text-xs text-gray-400">Analisando...</div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="8"
                            height="8"
                            rx="2"
                            fill="currentColor"
                            opacity="0.9"
                          />
                          <rect
                            x="13"
                            y="3"
                            width="8"
                            height="8"
                            rx="2"
                            fill="currentColor"
                            opacity="0.6"
                          />
                          <rect
                            x="3"
                            y="13"
                            width="8"
                            height="8"
                            rx="2"
                            fill="currentColor"
                            opacity="0.6"
                          />
                          <rect
                            x="13"
                            y="13"
                            width="8"
                            height="8"
                            rx="2"
                            fill="currentColor"
                            opacity="0.4"
                          />
                        </svg>
                      </div>
                      <div className="text-base font-semibold">
                        Sugestões de Layout
                      </div>
                    </div>

                    <div className="space-y-3">
                      {insights.length === 0 && !insightsLoading && (
                        <div className="text-xs text-gray-500">
                          Nenhuma sugestão disponível ainda.
                        </div>
                      )}

                      {insights.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {s.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {s.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="dashboard"></TabsContent>
          </Tabs>
        </aside>
      </main>

      <Dialog open={showPostSaveModal} onOpenChange={setShowPostSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Artigo</DialogTitle>
            <DialogDescription>Adicione uma imagem de destaque e um resumo do artigo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Destaque</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {imagePreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded" />
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setImagePreview("");
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remover Imagem
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-600">Clique para fazer upload da imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Excerpt Section */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">Resumo do Artigo</label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Digite um breve resumo do artigo (máximo 250 caracteres)"
                maxLength={250}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="text-xs text-gray-500 mt-1">{excerpt.length}/250</div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowPostSaveModal(false)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteArticleSave}
                disabled={postSaveLoading}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {postSaveLoading ? 'Salvando...' : 'Salvar Artigo'}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
