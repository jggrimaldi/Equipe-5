"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

export function SidebarMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams?.get('category');

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('articles')
                .select('category');

            if (data) {
                // Get unique categories and filter out nulls
                const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean))) as string[];
                setCategories(uniqueCategories.sort());
            }
        };

        fetchCategories();
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="relative z-[60] p-2 rounded-md hover:bg-gray-100 transition-colors group mr-4"
                aria-label="Menu"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span className={`h-0.5 w-full bg-gray-800 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                    <span className={`h-0.5 w-full bg-gray-800 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`h-0.5 w-full bg-gray-800 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
                <span className="sr-only">Menu</span>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[55] backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-80 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                            Editorias
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-1">
                        <Link
                            href="/user-article"
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${!currentCategory
                                ? 'bg-red-50 text-red-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Todas as Notícias
                        </Link>

                        {categories.map((category) => (
                            <Link
                                key={category}
                                href={`/user-article?category=${encodeURIComponent(category)}`}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${currentCategory === category
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {category}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4">
                                Outros Links
                            </p>
                            <Link href="#" className="block px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                                Sobre Nós
                            </Link>
                            <Link href="#" className="block px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                                Contato
                            </Link>
                            <Link href="#" className="block px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                                Política de Privacidade
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
