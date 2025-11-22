import React from 'react';
import Link from 'next/link';

export function UOLBar() {
    return (
        <div className="bg-[#1c1c1c] text-white font-sans text-[11px] antialiased">
            <div className="max-w-[1200px] mx-auto px-4 h-[40px] flex items-center justify-between">

                {/* Left Section: Logo + Products */}
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <a href="https://www.uol.com.br/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                        <img
                            src="https://conteudo.imguol.com.br/c/_layout/v3/logoUOL2021/logo_completo_white.svg"
                            alt="UOL - O melhor conteúdo"
                            width={68}
                            height={24}
                            className="h-6 w-auto"
                        />
                    </a>

                    {/* Menu Products */}
                    <nav className="hidden md:flex items-center gap-4">
                        <a href="https://www.ingresso.com/" className="hover:text-gray-300 transition-colors font-bold text-gray-100">INGRESSO.COM</a>
                        <a href="https://uolhost.uol.com.br/" className="hover:text-gray-300 transition-colors font-bold text-gray-100">UOL HOST</a>
                        <a href="https://pagbank.uol.com.br/" className="hover:text-gray-300 transition-colors font-bold text-gray-100">PAGBANK</a>
                        <a href="https://www.portaleducacao.com.br/" className="hover:text-gray-300 transition-colors font-bold text-gray-100">CURSOS</a>
                        <a href="https://play.uol.com.br/" className="hover:text-gray-300 transition-colors font-bold text-gray-100">UOL PLAY</a>
                        <a href="https://ads.uol.com.br/" className="hover:text-gray-300 transition-colors font-bold text-gray-100">UOL ADS</a>
                    </nav>
                </div>

                {/* Right Section: Services */}
                <nav className="flex items-center gap-5">
                    <a href="https://busca.uol.com.br/" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors font-bold text-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="hidden sm:inline">BUSCA</span>
                    </a>
                    <a href="https://batepapo.uol.com.br/" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors font-bold text-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="hidden sm:inline">BATE-PAPO</span>
                    </a>
                    <a href="https://email.uol.com.br/" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors font-bold text-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">EMAIL</span>
                    </a>
                </nav>
            </div>
        </div>
    );
}
