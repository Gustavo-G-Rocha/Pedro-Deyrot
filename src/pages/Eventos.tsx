import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Loader2, ExternalLink, Users, Search } from 'lucide-react';
import { eventos as eventosApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

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
    slug?: string;
    metaInscricoes?: number;
    totalInscricoes?: number;
    inscricaoHabilitada?: boolean;
    linkFormularioExterno?: string;
}

export default function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        carregarEventos();
    }, []);

    const carregarEventos = async () => {
        try {
            // A API ja devolve a contagem de inscricoes agregada por evento.
            const dados = await eventosApi.listar();

            setEventos(dados.map((e) => ({
                id: e.id,
                titulo: e.titulo,
                imagemUrl: e.imagem_url,
                link: e.link,
                descricao: e.descricao || '',
                botoes: e.botoes || [],
                criadoEm: new Date(e.criado_em),
                slug: e.slug || e.id,
                metaInscricoes: e.meta_inscricoes || 0,
                totalInscricoes: e.total_inscricoes || 0,
                inscricaoHabilitada: e.inscricao_habilitada !== false,
                linkFormularioExterno: e.link_formulario_externo || ''
            })));
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

                {/* Barra de Pesquisa */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-xl mx-auto mb-12 relative"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar por título de evento..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-[#242424] text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-[#eab308] border border-white/10 outline-none transition-all placeholder:text-zinc-500"
                    />
                </motion.div>

                {/* Lista de eventos */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-[#242424] rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                                <div className="aspect-[4/5] bg-zinc-800"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                                    <div className="h-4 bg-zinc-800 rounded w-1/4 mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (() => {
                    const eventosFiltrados = eventos.filter(evento => 
                        evento.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                        (evento.descricao && evento.descricao.toLowerCase().includes(busca.toLowerCase()))
                    );

                    if (eventosFiltrados.length === 0) {
                        return (
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
                        );
                    }

                    return (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventosFiltrados.map((evento, index) => (
                            <motion.button
                                key={evento.id}
                                onClick={() => navigate(`/evento/${evento.slug}`)}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group relative bg-[#242424]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-[#eab308]/50 transition-all hover:shadow-2xl hover:shadow-[#eab308]/20 text-left w-full cursor-pointer"
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

                                    {/* Vagas Disponíveis */}
                                    {(evento.metaInscricoes ?? 0) > 0 && evento.inscricaoHabilitada !== false && (
                                        <div className="mb-3">
                                            {evento.totalInscricoes !== undefined && evento.totalInscricoes >= (evento.metaInscricoes ?? 0) ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
                                                    <Users className="w-3.5 h-3.5" />
                                                    Esgotado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eab308]/10 text-[#eab308] text-xs font-semibold rounded-full border border-[#eab308]/20">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {(evento.metaInscricoes ?? 0) - (evento.totalInscricoes || 0)} {(evento.metaInscricoes ?? 0) - (evento.totalInscricoes || 0) === 1 ? 'vaga' : 'vagas'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{evento.criadoEm.toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#eab308] text-sm">
                                            <ExternalLink className="w-4 h-4" />
                                            <span>Ver detalhes</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-[#eab308] text-black px-3 py-1 rounded-full text-xs font-bold">
                                    Evento
                                </div>
                            </motion.button>
                        ))}
                    </div>
                    );
                })()}
            </div>
        </div>
    );
}
