import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, arquivos, campanhas as campanhasApi } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus, Trash2, Edit2, X, Loader2, AlertCircle, CheckCircle2,
    Image as ImageIcon, Users, Calendar, ArrowLeft
} from 'lucide-react';

interface Campanha {
    id: string;
    titulo: string;
    descricao: string;
    imagemUrl: string;
    dataInicio: Date;
    dataFim: Date;
    status: 'ativa' | 'encerrada';
    inscricoes: number;
    criadoEm: Date;
}

export default function AdminCampanhas() {
    const navigate = useNavigate();
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [status, setStatus] = useState<'ativa' | 'encerrada'>('ativa');
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);

    useEffect(() => {
        auth.me().then((admin) => {
            if (!admin) {
                navigate('/admin');
            } else {
                carregarCampanhas();
            }
        });
    }, [navigate]);

    const carregarCampanhas = async () => {
        try {
            const dados = await campanhasApi.listar();
            setCampanhas(dados.map((c) => ({
                id: c.id,
                titulo: c.titulo,
                descricao: c.descricao,
                imagemUrl: c.imagem_url,
                dataInicio: c.data_inicio ? new Date(c.data_inicio) : new Date(),
                dataFim: c.data_fim ? new Date(c.data_fim) : new Date(),
                status: c.status,
                inscricoes: c.inscricoes || 0,
                criadoEm: new Date(c.criado_em)
            })));
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error);
            showMessage('error', 'Erro ao carregar campanhas');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagem(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagemPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editandoId && !imagem) {
            showMessage('error', 'Selecione uma imagem');
            return;
        }

        if (!dataInicio || !dataFim) {
            showMessage('error', 'Defina as datas de início e fim');
            return;
        }

        setSaving(true);

        try {
            const campanhaAntiga = editandoId ? campanhas.find(c => c.id === editandoId) : undefined;
            let imagemUrl = campanhaAntiga?.imagemUrl ?? '';

            // Upload da nova imagem, descartando a antiga
            if (imagem) {
                imagemUrl = await arquivos.upload(imagem);
                await arquivos.remover(campanhaAntiga?.imagemUrl);
            }

            const campanhaData = {
                titulo,
                descricao,
                imagemUrl,
                dataInicio: new Date(dataInicio).toISOString(),
                dataFim: new Date(dataFim).toISOString(),
                status
            };

            if (editandoId) {
                await campanhasApi.atualizar(editandoId, campanhaData);
                showMessage('success', 'Campanha atualizada com sucesso!');
            } else {
                await campanhasApi.criar(campanhaData);
                showMessage('success', 'Campanha criada com sucesso!');
            }

            limparFormulario();
            carregarCampanhas();
        } catch (error) {
            console.error('Erro ao salvar campanha:', error);
            showMessage('error', 'Erro ao salvar campanha');
        } finally {
            setSaving(false);
        }
    };

    const limparFormulario = () => {
        setEditandoId(null);
        setTitulo('');
        setDescricao('');
        setDataInicio('');
        setDataFim('');
        setStatus('ativa');
        setImagem(null);
        setImagemPreview(null);
    };

    const handleEditar = (campanha: Campanha) => {
        setEditandoId(campanha.id);
        setTitulo(campanha.titulo);
        setDescricao(campanha.descricao);
        setDataInicio(campanha.dataInicio.toISOString().split('T')[0]);
        setDataFim(campanha.dataFim.toISOString().split('T')[0]);
        setStatus(campanha.status);
        setImagemPreview(campanha.imagemUrl);
        setImagem(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeletar = async (campanha: Campanha) => {
        if (!confirm(`Tem certeza que deseja deletar a campanha "${campanha.titulo}"?`)) return;

        try {
            await campanhasApi.remover(campanha.id);
            await arquivos.remover(campanha.imagemUrl);

            showMessage('success', 'Campanha deletada com sucesso!');
            carregarCampanhas();
        } catch (error) {
            console.error('Erro ao deletar campanha:', error);
            showMessage('error', 'Erro ao deletar campanha');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#D4A017] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
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
                            <h1 className="text-3xl font-black text-white mb-1">Gerenciar Campanhas</h1>
                            <p className="text-zinc-400">Crie e gerencie campanhas de conscientização</p>
                        </div>
                    </div>
                </div>

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

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Formulário */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-[#111111] rounded-2xl p-6 border ${editandoId ? 'border-[#D4A017]' : 'border-white/10'}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {editandoId ? (
                                    <>
                                        <Edit2 className="w-5 h-5 text-[#D4A017]" />
                                        Editar Campanha
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5 text-[#D4A017]" />
                                        Nova Campanha
                                    </>
                                )}
                            </h2>
                            {editandoId && (
                                <button
                                    type="button"
                                    onClick={limparFormulario}
                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                    title="Cancelar edição"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Título da Campanha
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ex: Campanha de Conscientização"
                                    className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    required
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Descreva os objetivos da campanha..."
                                    rows={4}
                                    className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Data de Início
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                        className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Data de Fim
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                        className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Status
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="ativa"
                                            checked={status === 'ativa'}
                                            onChange={(e) => setStatus(e.target.value as 'ativa')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">Ativa</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="encerrada"
                                            checked={status === 'encerrada'}
                                            onChange={(e) => setStatus(e.target.value as 'encerrada')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">Encerrada</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Imagem da Campanha {editandoId && <span className="text-zinc-600">(opcional)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="imagem-upload"
                                        required={!editandoId}
                                    />
                                    <label
                                        htmlFor="imagem-upload"
                                        className="block w-full bg-[#0a0a0a] text-white rounded-xl p-4 cursor-pointer hover:bg-[#252525] transition-colors border-2 border-dashed border-zinc-700 hover:border-[#D4A017]"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-zinc-400">
                                            <ImageIcon className="w-5 h-5" />
                                            <span>{imagem ? imagem.name : editandoId ? 'Clique para alterar' : 'Clique para selecionar'}</span>
                                        </div>
                                    </label>
                                </div>

                                {imagemPreview && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-4 rounded-xl overflow-hidden"
                                    >
                                        <img
                                            src={imagemPreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                        />
                                    </motion.div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-[#D4A017] text-black hover:bg-[#ca8a04] active:scale-[0.98] transition-all py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-yellow-500/20"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : editandoId ? (
                                    <Edit2 className="w-5 h-5" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                <span className="uppercase tracking-widest text-sm">
                                    {saving ? 'Salvando...' : editandoId ? 'Atualizar' : 'Criar Campanha'}
                                </span>
                            </button>
                        </form>
                    </motion.div>

                    {/* Lista de Campanhas */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#111111] rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">
                            Campanhas Cadastradas ({campanhas.length})
                        </h2>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {campanhas.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">Nenhuma campanha cadastrada</p>
                            ) : (
                                campanhas.map((campanha) => (
                                    <motion.div
                                        key={campanha.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 hover:border-[#D4A017]/30 transition-colors"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 bg-zinc-900 rounded-lg flex-shrink-0 overflow-hidden">
                                                <img
                                                    src={campanha.imagemUrl}
                                                    alt={campanha.titulo}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-white font-bold truncate">{campanha.titulo}</h3>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${campanha.status === 'ativa'
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-zinc-500/10 text-zinc-400'
                                                            }`}
                                                    >
                                                        {campanha.status}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-500 text-sm mb-2 line-clamp-2">{campanha.descricao}</p>
                                                <div className="flex items-center gap-4 text-xs text-zinc-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {campanha.dataInicio.toLocaleDateString('pt-BR')} - {campanha.dataFim.toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {campanha.inscricoes} inscrições
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleEditar(campanha)}
                                                    className="p-2 hover:bg-[#D4A017]/10 text-[#D4A017] rounded-lg transition-colors"
                                                    title="Editar campanha"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletar(campanha)}
                                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                    title="Deletar campanha"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
