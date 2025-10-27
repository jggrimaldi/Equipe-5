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

export default function NewsEditor() {
  const [input, setInput] = useState("");
  const [editorRef, setEditorRef] = useState<any | null>(null);
  const [insights, setInsights] = useState<
    { title: string; description: string }[]
  >([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

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

      const { error } = await supabase.from('articles').insert({ id, title, content: md }).select().single();

      if (error) {
        console.error("Insert error", error);
        alert("Failed to save article");
        return;
      }

      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Unexpected error saving article");
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
          <button
            onClick={handleSave}
            className="ml-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
          >
            Salvar
          </button>
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
    </div>
  );
}
