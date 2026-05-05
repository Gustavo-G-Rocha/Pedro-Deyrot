import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/voluntarios', label: 'Voluntários' },
        { path: '/eventos', label: 'Eventos' },
    ];

    return (
        <div className="min-h-screen">
            {/* Header com menu de navegação */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#242424]/90 backdrop-blur-md border-b border-white/10">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center flex-shrink-0">
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

                        {/* Botão Mobile Menu */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-white p-2"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Menu Mobile */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${isActive(link.path)
                                        ? 'text-[#eab308] bg-[#eab308]/10'
                                        : 'text-white hover:text-[#eab308] hover:bg-[#eab308]/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>
            </header>

            {/* Conteúdo principal com padding-top para compensar o header fixo */}
            <main className="pt-16">
                <Outlet />
            </main>
        </div>
    );
}
