import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion } from 'motion/react';
import { FileText, Eye, Loader2, AlertCircle, Search, Calendar } from 'lucide-react';

interface Denuncia {
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    status: string;
    imagemUrl?: string;
    estatisticas: {
        visualizacoes: number;
        downloads: number;
    };
    criadoEm?: {
        toDate: () => Date;
    };
}

export default function DenunciasLista() {
    const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');

    useEffect(() => {
        carregarDenuncias();
    }, []);

    const carregarDenuncias = async () => {
        try {
            const denunciasRef = collection(db, 'denuncias');
            const q = query(denunciasRef, where('status', '==', 'publicado'));
            const querySnapshot = await getDocs(q);

            const denunciasData: Denuncia[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                denunciasData.push({
                    id: doc.id,
                    titulo: data.titulo,
                    slug: data.slug,
                    descricao: data.descricao,
                    status: data.status,
                    imagemUrl: data.imagemUrl || '',
                    estatisticas: data.estatisticas || { visualizacoes: 0, downloads: 0 },
                    criadoEm: data.criadoEm
                });
            });

            // Ordenar por data decrescente
            denunciasData.sort((a, b) => {
                if (a.criadoEm && b.criadoEm) {
                    return b.criadoEm.toDate().getTime() - a.criadoEm.toDate().getTime();
                }
                return 0;
            });

            setDenuncias(denunciasData);
        } catch (error) {
            console.error('Erro ao carregar denúncias:', error);
        } finally {
            setLoading(false);
        }
    };

    const denunciasFiltradas = denuncias.filter(denuncia => 
        denuncia.titulo.toLowerCase().includes(busca.toLowerCase()) || 
        denuncia.descricao.toLowerCase().includes(busca.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="h-10 w-64 bg-[#242424] animate-pulse rounded-lg mx-auto mb-4"></div>
                        <div className="h-6 w-96 bg-[#242424] animate-pulse rounded-lg mx-auto"></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-[#242424] rounded-xl border border-white/5 overflow-hidden animate-pulse">
                                <div className="aspect-[4/3] bg-zinc-800"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-zinc-800 rounded w-full"></div>
                                        <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between">
                                        <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                                        <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Denúncias <span className="text-[#eab308]">Publicadas</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Acesse os dossiês completos das denúncias documentadas
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
                        placeholder="Pesquisar por título ou palavra-chave..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-[#242424] text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-[#eab308] border border-white/10 outline-none transition-all placeholder:text-zinc-500"
                    />
                </motion.div>

                {/* Lista de Denúncias */}
                {denunciasFiltradas.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#242424] rounded-2xl p-12 border border-white/10 text-center"
                    >
                        <AlertCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma denúncia publicada</h3>
                        <p className="text-zinc-500">
                            Novas denúncias serão exibidas aqui assim que forem publicadas
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {denunciasFiltradas.map((denuncia, index) => (
                            <motion.div
                                key={denuncia.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/denuncias/${denuncia.slug}`}
                                    className="block bg-[#242424] rounded-xl border border-white/10 hover:border-[#eab308]/50 transition-all hover:shadow-lg hover:shadow-[#eab308]/10 group overflow-hidden"
                                >
                                    {/* Banner */}
                                    <div className="aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
                                        {denuncia.imagemUrl ? (
                                            <img
                                                src={denuncia.imagemUrl}
                                                alt={denuncia.titulo}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FileText className="w-12 h-12 text-zinc-700" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#eab308] transition-colors line-clamp-2">
                                            {denuncia.titulo}
                                        </h3>

                                        <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
                                            {denuncia.descricao}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5 pb-4 mb-2">
                                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                <span>{denuncia.criadoEm ? denuncia.criadoEm.toDate().toLocaleDateString('pt-BR') : 'Data não informada'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                                <Eye className="w-4 h-4" />
                                                <span>{denuncia.estatisticas.visualizacoes} visualizações</span>
                                            </div>
                                            <span className="text-[#eab308] text-sm font-semibold group-hover:underline">
                                                Acessar →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
