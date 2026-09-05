import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, ClipboardList, Package, Flag } from 'lucide-react';
import { materialHref, RENAN_SITE } from '../config/links';
import Footer from './Footer';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/voluntarios', label: 'Voluntários', icon: Users },
        { path: '/eventos', label: 'Eventos', icon: Calendar },
        { path: '/propostas', label: 'Propostas', icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen">
            {/* Header com menu de navegação */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#111111]/90 backdrop-blur-md border-b border-white/10">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-between h-16">
                        {/* Logo centralizada no mobile, à esquerda no desktop */}
                        <Link to="/" className="flex items-center flex-shrink-0 mx-auto md:mx-0">
                            <span className="text-2xl font-black text-white">
                                Pedro <span className="text-[#D4A017]">Deyrot</span>
                            </span>
                            {/* O numero na logo: e o que o eleitor digita na urna. */}
                            <span className="ml-2 rounded bg-[#D4A017] px-1.5 py-0.5 text-sm font-black text-black">
                                1414
                            </span>
                        </Link>

                        {/* Menu Desktop */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href={materialHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[#D4A017] px-4 py-2 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110"
                            >
                                <Package className="w-4 h-4" />
                                Pedir kit
                            </a>

                            <a
                                href={RENAN_SITE}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-[#D4A017]/50 px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#D4A017] transition-all hover:bg-[#D4A017] hover:text-black"
                            >
                                <Flag className="w-4 h-4" />
                                Renan 14
                            </a>

                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-semibold uppercase tracking-wider transition-colors ${isActive(link.path)
                                        ? 'text-[#D4A017]'
                                        : 'text-white hover:text-[#D4A017]'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile: botão à direita; o absolute mantém a logo centralizada */}
                        <a
                            href={materialHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="md:hidden absolute right-0 inline-flex items-center gap-1.5 rounded-full bg-[#D4A017] px-3 py-2 text-xs font-bold uppercase tracking-wider text-black transition-all active:brightness-110"
                        >
                            <Package className="w-4 h-4" />
                            Kit
                        </a>
                    </div>
                </nav>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-16 px-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-[#D4A017]' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'fill-[#D4A017]/20' : ''}`} />
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

                <Footer />
            </main>
        </div>
    );
}
