import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, arquivos, eventos as eventosApi } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Plus, Trash2, ExternalLink, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon, Edit2, X, Calendar, FileText, Users } from 'lucide-react';

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
    metaInscricoes?: number;
    inscricaoHabilitada?: boolean;
    linkFormularioExterno?: string;
    slug?: string;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sistema de abas
    const [abaAtiva, setAbaAtiva] = useState<'eventos' | 'denuncias' | 'campanhas'>('eventos');

    // Form state
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [titulo, setTitulo] = useState('');
    const [slug, setSlug] = useState('');
    const [link, setLink] = useState('');
    const [descricao, setDescricao] = useState('');
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [botoes, setBotoes] = useState<Botao[]>([]);
    const [novoBotaoTexto, setNovoBotaoTexto] = useState('');
    const [novoBotaoLink, setNovoBotaoLink] = useState('');

    // Configurações de inscrição
    const [metaInscricoes, setMetaInscricoes] = useState<number>(0);
    const [inscricaoHabilitada, setInscricaoHabilitada] = useState<boolean>(true);
    const [linkFormularioExterno, setLinkFormularioExterno] = useState<string>('');

    useEffect(() => {
        // Verificar autenticação contra o servidor antes de carregar qualquer coisa
        auth.me().then((admin) => {
            if (!admin) {
                navigate('/admin');
            } else {
                carregarEventos();
            }
        });
    }, [navigate]);

    // Auto-gerar slug a partir do título
    useEffect(() => {
        if (!editandoId && titulo !== '') {
            const slugGerado = titulo
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setSlug(slugGerado);
        }
    }, [titulo, editandoId]);

    const carregarEventos = async () => {
        try {
            const dados = await eventosApi.listar();
            setEventos(dados.map((e) => ({
                id: e.id,
                titulo: e.titulo,
                imagemUrl: e.imagem_url,
                link: e.link,
                descricao: e.descricao || '',
                botoes: e.botoes || [],
                criadoEm: new Date(e.criado_em),
                metaInscricoes: e.meta_inscricoes || 0,
                inscricaoHabilitada: e.inscricao_habilitada !== false,
                linkFormularioExterno: e.link_formulario_externo || '',
                slug: e.slug || e.id
            })));
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            showMessage('error', 'Erro ao carregar eventos');
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

    const handleAddEvento = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editandoId && !imagem) {
            showMessage('error', 'Selecione uma imagem');
            return;
        }

        setSaving(true);

        try {
            const eventoAntigo = editandoId ? eventos.find(e => e.id === editandoId) : undefined;
            let imagemUrl = eventoAntigo?.imagemUrl ?? '';

            // Se houver nova imagem, subir e descartar a antiga
            if (imagem) {
                imagemUrl = await arquivos.upload(imagem);
                await arquivos.remover(eventoAntigo?.imagemUrl);
            }

            const dados = {
                titulo,
                slug: slug || null,
                imagemUrl,
                link,
                descricao,
                botoes,
                metaInscricoes: metaInscricoes || 0,
                inscricaoHabilitada,
                linkFormularioExterno
            };

            if (editandoId) {
                await eventosApi.atualizar(editandoId, dados);
                showMessage('success', 'Evento atualizado com sucesso!');
            } else {
                await eventosApi.criar(dados);
                showMessage('success', 'Evento adicionado com sucesso!');
            }

            // Limpar formulário
            limparFormulario();

            // Recarregar eventos
            carregarEventos();
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            showMessage('error', 'Erro ao salvar evento');
        } finally {
            setSaving(false);
        }
    };

    const limparFormulario = () => {
        setEditandoId(null);
        setTitulo('');
        setSlug('');
        setLink('');
        setDescricao('');
        setImagem(null);
        setImagemPreview(null);
        setBotoes([]);
        setNovoBotaoTexto('');
        setNovoBotaoLink('');
        setMetaInscricoes(0);
        setInscricaoHabilitada(true);
        setLinkFormularioExterno('');
    };

    const handleEditEvento = (evento: Evento) => {
        setEditandoId(evento.id);
        setTitulo(evento.titulo);
        setSlug(evento.slug || evento.id);
        setLink(evento.link);
        setDescricao(evento.descricao || '');
        setBotoes(evento.botoes || []);
        setImagemPreview(evento.imagemUrl);
        setImagem(null); // Não definir arquivo, apenas preview
        setMetaInscricoes(evento.metaInscricoes || 0);
        setInscricaoHabilitada(evento.inscricaoHabilitada !== false);
        setLinkFormularioExterno(evento.linkFormularioExterno || '');

        // Scroll para o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteEvento = async (evento: Evento) => {
        if (!confirm(`Tem certeza que deseja deletar "${evento.titulo}"?`)) return;

        try {
            // As inscrições caem junto com o evento (ON DELETE CASCADE)
            await eventosApi.remover(evento.id);
            await arquivos.remover(evento.imagemUrl);

            showMessage('success', 'Evento deletado com sucesso!');
            carregarEventos();
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            showMessage('error', 'Erro ao deletar evento');
        }
    };

    const handleLogout = async () => {
        auth.logout();
        navigate('/admin');
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
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1">Painel Administrativo</h1>
                        <p className="text-zinc-400">Gerencie eventos, denúncias e campanhas</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>

                {/* Navegação por Abas */}
                <div className="flex gap-2 mb-6 bg-[#111111] p-2 rounded-xl border border-white/10">
                    <button
                        onClick={() => setAbaAtiva('eventos')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold ${abaAtiva === 'eventos'
                            ? 'bg-[#D4A017] text-black'
                            : 'text-zinc-400 hover:text-white hover:bg-[#0a0a0a]'
                            }`}
                    >
                        <Calendar className="w-5 h-5" />
                        Eventos
                    </button>
                    <button
                        onClick={() => navigate('/admin/denuncias')}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold text-zinc-400 hover:text-white hover:bg-[#0a0a0a]"
                    >
                        <FileText className="w-5 h-5" />
                        Denúncias
                    </button>
                    <button
                        onClick={() => navigate('/admin/campanhas')}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold text-zinc-400 hover:text-white hover:bg-[#0a0a0a]"
                    >
                        <Users className="w-5 h-5" />
                        Campanhas
                    </button>
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

                {/* Conteúdo da aba ativa */}
                {abaAtiva === 'eventos' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Formulário para adicionar evento */}
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
                                            Editar Evento
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5 text-[#D4A017]" />
                                            Adicionar Novo Evento
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

                            <form onSubmit={handleAddEvento} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Título do Evento *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        placeholder="Ex: Encontro com a Comunidade"
                                        className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Slug (URL) *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-zinc-500 text-sm">/</span>
                                        <input
                                            type="text"
                                            required
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="encontro-com-comunidade"
                                            className="flex-1 bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500"
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-600 mt-1">
                                        Este será o endereço do evento: /evento/{slug}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Link do Evento
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="https://exemplo.com/evento"
                                        className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Descrição Detalhada (Opcional)
                                    </label>
                                    <textarea
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        placeholder="Descreva os detalhes do evento..."
                                        rows={4}
                                        className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500 resize-none"
                                    />
                                </div>

                                {/* Configurações de Inscrição */}
                                <div className="border border-[#D4A017]/30 rounded-xl p-4 bg-[#D4A017]/5 space-y-4">
                                    <h3 className="text-sm font-bold text-[#D4A017] uppercase flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Configurações de Inscrição
                                    </h3>

                                    {/* Meta de Inscrições */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-400 mb-2">
                                            Limite de Vagas (0 = ilimitado)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={metaInscricoes}
                                            onChange={(e) => setMetaInscricoes(parseInt(e.target.value) || 0)}
                                            placeholder="Ex: 100"
                                            className="w-full bg-[#0a0a0a] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {metaInscricoes > 0
                                                ? `Exibirá contador de ${metaInscricoes} vagas no site`
                                                : 'Sem limite de vagas'
                                            }
                                        </p>
                                    </div>

                                    {/* Habilitar/Desabilitar Formulário Interno */}
                                    <div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inscricaoHabilitada}
                                                onChange={(e) => setInscricaoHabilitada(e.target.checked)}
                                                className="w-5 h-5 rounded accent-[#D4A017] cursor-pointer"
                                            />
                                            <div>
                                                <div className="text-sm font-semibold text-white">
                                                    Formulário Interno Habilitado
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    {inscricaoHabilitada
                                                        ? 'Usuários preenchem formulário no site'
                                                        : 'Desabilitado - usar link externo ou sem inscrição'
                                                    }
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Link Formulário Externo (aparece quando desabilitado) */}
                                    {!inscricaoHabilitada && (
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-400 mb-2">
                                                Link para Formulário Externo (Opcional)
                                            </label>
                                            <input
                                                type="url"
                                                value={linkFormularioExterno}
                                                onChange={(e) => setLinkFormularioExterno(e.target.value)}
                                                placeholder="https://forms.gle/..."
                                                className="w-full bg-[#0a0a0a] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500"
                                            />
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {linkFormularioExterno
                                                    ? 'Botão abrirá este link externo'
                                                    : 'Deixe vazio para mostrar "Inscrições em breve"'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Botões com Links (Opcional)
                                    </label>
                                    <div className="space-y-3">
                                        {botoes.map((botao, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-[#0a0a0a] p-3 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="text-sm text-white font-semibold">{botao.texto}</div>
                                                    <div className="text-xs text-zinc-500 truncate">{botao.link}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setBotoes(botoes.filter((_, i) => i !== index))}
                                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={novoBotaoTexto}
                                                onChange={(e) => setNovoBotaoTexto(e.target.value)}
                                                placeholder="Texto do botão"
                                                className="flex-1 bg-[#0a0a0a] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500 text-sm"
                                            />
                                            <input
                                                type="url"
                                                value={novoBotaoLink}
                                                onChange={(e) => setNovoBotaoLink(e.target.value)}
                                                placeholder="Link do botão"
                                                className="flex-1 bg-[#0a0a0a] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-500 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (novoBotaoTexto && novoBotaoLink) {
                                                        setBotoes([...botoes, { texto: novoBotaoTexto, link: novoBotaoLink }]);
                                                        setNovoBotaoTexto('');
                                                        setNovoBotaoLink('');
                                                    }
                                                }}
                                                className="px-4 py-3 bg-[#D4A017] text-black rounded-lg hover:bg-[#ca8a04] transition-colors font-semibold text-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                        Imagem do Evento {editandoId && <span className="text-zinc-600">(opcional - manter atual se não enviar nova)</span>}
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
                                                <span>{imagem ? imagem.name : editandoId ? 'Clique para alterar imagem' : 'Clique para selecionar'}</span>
                                            </div>
                                        </label>
                                    </div>

                                    {imagemPreview && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-4 rounded-xl overflow-hidden bg-zinc-900"
                                        >
                                            <div className="aspect-[4/5] flex items-center justify-center">
                                                <img
                                                    src={imagemPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-2 text-center">Preview na proporção 4:5 (Instagram)</p>
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
                                        {saving ? 'Salvando...' : editandoId ? 'Atualizar Evento' : 'Adicionar Evento'}
                                    </span>
                                </button>
                            </form>
                        </motion.div>

                        {/* Lista de eventos */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#111111] rounded-2xl p-6 border border-white/10"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">
                                Eventos Cadastrados ({eventos.length})
                            </h2>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {eventos.length === 0 ? (
                                    <p className="text-zinc-500 text-center py-8">Nenhum evento cadastrado</p>
                                ) : (
                                    eventos.map((evento) => (
                                        <motion.div
                                            key={evento.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 hover:border-[#D4A017]/30 transition-colors"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-24 aspect-[4/5] bg-zinc-900 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                    <img
                                                        src={evento.imagemUrl}
                                                        alt={evento.titulo}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-bold mb-1 truncate">{evento.titulo}</h3>
                                                    <a
                                                        href={evento.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#D4A017] text-sm hover:underline flex items-center gap-1 mb-2"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        <span className="truncate">{evento.link}</span>
                                                    </a>
                                                    <p className="text-zinc-500 text-xs">
                                                        {evento.criadoEm.toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleEditEvento(evento)}
                                                        className="flex-shrink-0 p-2 hover:bg-[#D4A017]/10 text-[#D4A017] rounded-lg transition-colors"
                                                        title="Editar evento"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvento(evento)}
                                                        className="flex-shrink-0 p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                        title="Deletar evento"
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
                )}
            </div>
        </div>
    );
}
