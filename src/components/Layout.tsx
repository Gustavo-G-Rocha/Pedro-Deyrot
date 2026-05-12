import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/voluntarios', label: 'Voluntários', icon: Users },
        { path: '/eventos', label: 'Eventos', icon: Calendar },
        { path: '/denuncias', label: 'Denúncias', icon: FileText },
    ];

    return (
        <div className="min-h-screen">
            {/* Header com menu de navegação */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#242424]/90 backdrop-blur-md border-b border-white/10">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo centralizada no mobile, à esquerda no desktop */}
                        <Link to="/" className="flex items-center flex-shrink-0 mx-auto md:mx-0">
                            <span className="text-2xl font-black text-white">
                                Pedro <span className="text-[#eab308]">Deyrot</span>
                            </span>
                        </Link>

                        {/* Menu Desktop */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-semibold uppercase tracking-wider transition-colors ${isActive(link.path)
                                        ? 'text-[#eab308]'
                                        : 'text-white hover:text-[#eab308]'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-16 px-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                                    active ? 'text-[#eab308]' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'fill-[#eab308]/20' : ''}`} />
                                <span className="text-[10px] font-bold tracking-wider uppercase">
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Conteúdo principal com padding-top para compensar o header fixo e padding-bottom para o menu mobile */}
            <main className="pt-16 pb-20 md:pb-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
