import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, FileText, ArrowLeft, Lock, Unlock, Users } from 'lucide-react';

interface Denuncia {
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    pdfUrl: string;
    secoes: Array<{ titulo: string; conteudo: string }>;
    status: 'publicado' | 'rascunho';
    formularioAtivo?: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
    estatisticas: {
        visualizacoes: number;
        downloads: number;
        formularioEnvios?: number;
    };
}

export default function AdminDenuncias() {
    const navigate = useNavigate();
    const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingEmpty, setDeletingEmpty] = useState(false);
    const [mostrarVazios, setMostrarVazios] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate('/admin');
            } else {
                carregarDenuncias();
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Filtrar denúncias vazias se necessário
    const denunciasFiltradas = mostrarVazios
        ? denuncias
        : denuncias.filter(d => d.titulo || d.descricao);

    const rascunhosVazios = denuncias.filter(
        d => d.status === 'rascunho' && !d.titulo && !d.descricao
    );
    const temRascunhosVazios = rascunhosVazios.length > 0;

    const carregarDenuncias = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'denuncias'));
            const denunciasData: Denuncia[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                denunciasData.push({
                    id: doc.id,
                    titulo: data.titulo,
                    slug: data.slug,
                    descricao: data.descricao,
                    pdfUrl: data.pdfUrl,
                    secoes: data.secoes || [],
                    status: data.status,
                    formularioAtivo: data.formularioAtivo ?? false,
                    criadoEm: data.criadoEm?.toDate() || new Date(),
                    atualizadoEm: data.atualizadoEm?.toDate() || new Date(),
                    estatisticas: data.estatisticas || { visualizacoes: 0, downloads: 0, formularioEnvios: 0 }
                });
            });
            setDenuncias(denunciasData.sort((a, b) => b.atualizadoEm.getTime() - a.atualizadoEm.getTime()));
        } catch (error) {
            console.error('Erro ao carregar denúncias:', error);
            showMessage('error', 'Erro ao carregar denúncias');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleNovaDenuncia = () => {
        navigate('/admin/denuncias/nova');
    };

    const handleEditarDenuncia = (id: string) => {
        navigate(`/admin/denuncias/editar/${id}`);
    };

    const handleDeletarDenuncia = async (denuncia: Denuncia) => {
        if (!confirm(`Tem certeza que deseja deletar a denúncia "${denuncia.titulo || 'Sem título'}"?`)) return;

        try {
            // Deletar PDF do Storage
            if (denuncia.pdfUrl) {
                const pdfRef = ref(storage, denuncia.pdfUrl);
                await deleteObject(pdfRef).catch(() => {
                    // Ignorar erro se PDF já foi deletado
                });
            }

            // Deletar documento do Firestore
            await deleteDoc(doc(db, 'denuncias', denuncia.id));

            showMessage('success', 'Denúncia deletada com sucesso!');
            carregarDenuncias();
        } catch (error) {
            console.error('Erro ao deletar denúncia:', error);
            showMessage('error', 'Erro ao deletar denúncia');
        }
    };

    const handleLimparRascunhosVazios = async () => {
        if (!temRascunhosVazios) {
            showMessage('error', 'Não há rascunhos vazios para deletar');
            return;
        }

        if (!confirm(`Tem certeza que deseja deletar ${rascunhosVazios.length} rascunho(s) vazio(s)?`)) return;

        setDeletingEmpty(true);

        try {
            let deletados = 0;
            for (const denuncia of rascunhosVazios) {
                try {
                    // Deletar PDF se existir
                    if (denuncia.pdfUrl) {
                        const pdfRef = ref(storage, denuncia.pdfUrl);
                        await deleteObject(pdfRef).catch(() => { });
                    }
                    // Deletar documento
                    await deleteDoc(doc(db, 'denuncias', denuncia.id));
                    deletados++;
                } catch (error) {
                    console.error(`Erro ao deletar denúncia ${denuncia.id}:`, error);
                }
            }

            showMessage('success', `${deletados} rascunho(s) vazio(s) deletado(s) com sucesso!`);
            carregarDenuncias();
        } catch (error) {
            console.error('Erro ao limpar rascunhos vazios:', error);
            showMessage('error', 'Erro ao limpar rascunhos vazios');
        } finally {
            setDeletingEmpty(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#eab308] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                            title="Voltar ao Dashboard"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-1">Gerenciar Denúncias</h1>
                            <p className="text-zinc-400">Crie, edite e publique dossiês de denúncias</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {temRascunhosVazios && (
                            <button
                                onClick={handleLimparRascunhosVazios}
                                disabled={deletingEmpty}
                                className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50 shadow-lg shadow-red-500/20"
                                title={`Deletar ${rascunhosVazios.length} rascunho(s) vazio(s)`}
                            >
                                {deletingEmpty ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-5 h-5" />
                                )}
                                Limpar {rascunhosVazios.length} Vazio{rascunhosVazios.length > 1 ? 's' : ''}
                            </button>
                        )}
                        <button
                            onClick={handleNovaDenuncia}
                            className="flex items-center gap-2 px-6 py-3 bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-lg transition-colors font-bold shadow-lg shadow-yellow-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Denúncia
                        </button>
                    </div>
                </div>

                {/* Alerta de Rascunhos Vazios */}
                {temRascunhosVazios && !mostrarVazios && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                <div>
                                    <p className="text-yellow-400 font-semibold">
                                        {rascunhosVazios.length} rascunho{rascunhosVazios.length > 1 ? 's' : ''} vazio{rascunhosVazios.length > 1 ? 's' : ''} oculto{rascunhosVazios.length > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-yellow-400/70 text-sm">
                                        Denúncias sem título e descrição estão sendo ocultadas
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMostrarVazios(true)}
                                    className="px-4 py-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors text-sm font-semibold"
                                >
                                    Mostrar
                                </button>
                                <button
                                    onClick={handleLimparRascunhosVazios}
                                    disabled={deletingEmpty}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
                                >
                                    Deletar Todos
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Toggle para mostrar vazios */}
                {temRascunhosVazios && mostrarVazios && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-between"
                    >
                        <p className="text-zinc-400 text-sm">
                            Mostrando {rascunhosVazios.length} rascunho{rascunhosVazios.length > 1 ? 's' : ''} vazio{rascunhosVazios.length > 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={() => setMostrarVazios(false)}
                            className="px-4 py-2 text-zinc-400 hover:bg-zinc-700 rounded-lg transition-colors text-sm font-semibold"
                        >
                            Ocultar Vazios
                        </button>
                    </motion.div>
                )}

                {/* Mensagens */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}
                        >
                            {message.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            )}
                            <p>{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Lista de Denúncias */}
                <div className="grid gap-4">
                    {denunciasFiltradas.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#242424] rounded-2xl p-12 border border-white/10 text-center"
                        >
                            <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                {denuncias.length === 0 ? 'Nenhuma denúncia cadastrada' : 'Todas as denúncias estão ocultas'}
                            </h3>
                            <p className="text-zinc-500 mb-6">
                                {denuncias.length === 0
                                    ? 'Comece criando sua primeira denúncia'
                                    : 'Clique em "Mostrar" no alerta acima para ver os rascunhos vazios'
                                }
                            </p>
                            {denuncias.length === 0 && (
                                <button
                                    onClick={handleNovaDenuncia}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-lg transition-colors font-bold"
                                >
                                    <Plus className="w-5 h-5" />
                                    Criar Primeira Denúncia
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        denunciasFiltradas.map((denuncia) => (
                            <motion.div
                                key={denuncia.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#242424] rounded-xl p-6 border border-white/10 hover:border-[#eab308]/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">
                                                {denuncia.titulo || <span className="text-zinc-600 italic">Sem título</span>}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${denuncia.status === 'publicado'
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    }`}
                                            >
                                                {denuncia.status === 'publicado' ? (
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        Publicado
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <EyeOff className="w-3 h-3" />
                                                        Rascunho
                                                    </span>
                                                )}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${denuncia.formularioAtivo
                                                    ? 'bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20'
                                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                                    }`}
                                            >
                                                {denuncia.formularioAtivo
                                                    ? <><Lock className="w-3 h-3" /> Formulário ativo</>
                                                    : <><Unlock className="w-3 h-3" /> Acesso livre</>
                                                }
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 mb-3 line-clamp-2">
                                            {denuncia.descricao || <span className="text-zinc-600 italic">Sem descrição</span>}
                                        </p>
                                        <div className="flex items-center gap-6 text-sm text-zinc-500">
                                            <span>Slug: <span className="text-[#eab308]">/{denuncia.slug || '(vazio)'}</span></span>
                                            <span>{denuncia.secoes?.length || 0} seção(ões)</span>
                                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {denuncia.estatisticas?.visualizacoes || 0}</span>
                                            <span className="flex items-center gap-1"><span className="text-xs">↓</span> {denuncia.estatisticas?.downloads || 0}</span>
                                            {denuncia.formularioAtivo && (
                                                <span className="flex items-center gap-1 text-[#eab308]">
                                                    <Users className="w-3.5 h-3.5" /> {denuncia.estatisticas?.formularioEnvios || 0} leads
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-zinc-600">
                                            Atualizado em {denuncia.atualizadoEm.toLocaleDateString('pt-BR')} às {denuncia.atualizadoEm.toLocaleTimeString('pt-BR')}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleEditarDenuncia(denuncia.id)}
                                            className="p-3 hover:bg-[#eab308]/10 text-[#eab308] rounded-lg transition-colors"
                                            title="Editar denúncia"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletarDenuncia(denuncia)}
                                            className="p-3 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                            title="Deletar denúncia"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
