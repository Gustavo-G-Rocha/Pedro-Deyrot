import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Loader2, ExternalLink, X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Botao {
    texto: string;
    link: string;
}

interface Evento {
    id: string;
    titulo: string;
    imagemUrl: string;
    link: string;
    descricao?: string;
    botoes?: Botao[];
    criadoEm: Date;
}

export default function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);

    useEffect(() => {
        carregarEventos();
    }, []);

    const carregarEventos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'eventos'));
            const eventosData: Evento[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                eventosData.push({
                    id: doc.id,
                    titulo: data.titulo,
                    imagemUrl: data.imagemUrl,
                    link: data.link,
                    descricao: data.descricao || '',
                    botoes: data.botoes || [],
                    criadoEm: data.criadoEm?.toDate() || new Date()
                });
            });
            setEventos(eventosData.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()));
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a]">
            {/* Conteúdo */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                        Nossos <span className="text-[#eab308]">Eventos</span>
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Participe dos nossos encontros e eventos. Venha nos conhecer!
                    </p>
                </motion.div>

                {/* Lista de eventos */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#eab308] animate-spin" />
                    </div>
                ) : eventos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-[#242424]/70 backdrop-blur-md rounded-2xl p-12 border border-white/10 text-center">
                            <Calendar className="w-20 h-20 text-[#eab308] mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Em breve!</h2>
                            <p className="text-zinc-400 text-lg">
                                Estamos organizando nossos eventos. Em breve você encontrará aqui
                                todos os detalhes sobre onde e quando nos encontrar.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventos.map((evento, index) => (
                            <motion.button
                                key={evento.id}
                                onClick={() => setEventoSelecionado(evento)}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group relative bg-[#242424]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-[#eab308]/50 transition-all hover:shadow-2xl hover:shadow-[#eab308]/20 text-left w-full"
                            >
                                <div className="aspect-[4/5] overflow-hidden bg-zinc-900 flex items-center justify-center">
                                    <img
                                        src={evento.imagemUrl}
                                        alt={evento.titulo}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#eab308] transition-colors">
                                        {evento.titulo}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[#eab308] text-sm">
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Ver detalhes</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-[#eab308] text-black px-3 py-1 rounded-full text-xs font-bold">
                                    Evento
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Detalhes do Evento */}
            <AnimatePresence>
                {eventoSelecionado && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEventoSelecionado(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-[#242424] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Botão Fechar */}
                            <button
                                onClick={() => setEventoSelecionado(null)}
                                className="sticky top-4 right-4 float-right p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="grid md:grid-cols-2 gap-6 p-6">
                                {/* Imagem */}
                                <div className="aspect-[4/5] bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
                                    <img
                                        src={eventoSelecionado.imagemUrl}
                                        alt={eventoSelecionado.titulo}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Conteúdo */}
                                <div className="flex flex-col">
                                    <h2 className="text-3xl font-black text-white mb-4">
                                        {eventoSelecionado.titulo}
                                    </h2>

                                    {eventoSelecionado.descricao && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-2">
                                                Descrição
                                            </h3>
                                            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                                {eventoSelecionado.descricao}
                                            </p>
                                        </div>
                                    )}

                                    {/* Botões personalizados */}
                                    {eventoSelecionado.botoes && eventoSelecionado.botoes.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3">
                                                Links
                                            </h3>
                                            <div className="space-y-2">
                                                {eventoSelecionado.botoes.map((botao, index) => (
                                                    <a
                                                        key={index}
                                                        href={botao.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between gap-3 bg-[#eab308] hover:bg-[#ca8a04] text-black px-5 py-3 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/20"
                                                    >
                                                        <span>{botao.texto}</span>
                                                        <ExternalLink className="w-5 h-5" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Link principal */}
                                    <div className="mt-auto">
                                        <a
                                            href={eventoSelecionado.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-semibold transition-all border border-white/10"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>Ver mais informações</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
