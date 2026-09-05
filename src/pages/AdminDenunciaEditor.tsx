import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, arquivos, denuncias as denunciasApi, ApiError } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft, Save, Eye, EyeOff, FileText, Upload,
    Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';


export default function AdminDenunciaEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [titulo, setTitulo] = useState('');
    const [slug, setSlug] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState<'publicado' | 'rascunho'>('rascunho');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [pdfFileName, setPdfFileName] = useState<string>('');
    const [formularioAtivo, setFormularioAtivo] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>('');

    // Preview
    const [mostrarPrevia, setMostrarPrevia] = useState(false);

    useEffect(() => {
        auth.me().then((admin) => {
            if (!admin) {
                navigate('/admin');
            } else if (isEditMode) {
                carregarDenuncia();
            }
        });
    }, [id]);

    // Auto-gerar slug a partir do título
    useEffect(() => {
        if (!isEditMode || titulo !== '') {
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
    }, [titulo]);

    const carregarDenuncia = async () => {
        if (!id) return;

        try {
            const data = await denunciasApi.buscar(id);
            setTitulo(data.titulo);
            setSlug(data.slug);
            setDescricao(data.descricao);
            setStatus(data.status as 'publicado' | 'rascunho');
            setPdfUrl(data.pdf_url || '');
            setFormularioAtivo(data.formulario_ativo ?? false);
            setImageUrl(data.imagem_url || '');
            if (data.imagem_url) setImagePreview(data.imagem_url);
            // Extrair nome do arquivo do URL
            if (data.pdf_url) {
                const urlParts = data.pdf_url.split('/');
                const fileName = urlParts[urlParts.length - 1].split('?')[0];
                setPdfFileName(decodeURIComponent(fileName));
            }
        } catch (error) {
            console.error('Erro ao carregar denúncia:', error);
            if (error instanceof ApiError && error.status === 404) {
                showMessage('error', 'Denúncia não encontrada');
                navigate('/admin/denuncias');
            } else {
                showMessage('error', 'Erro ao carregar denúncia');
            }
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showMessage('error', 'Por favor, selecione um arquivo PDF');
                return;
            }
            setPdfFile(file);
            setPdfFileName(file.name);
            showMessage('success', `PDF "${file.name}" selecionado com sucesso!`);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Por favor, selecione um arquivo de imagem');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            showMessage('success', `Imagem "${file.name}" selecionada!`);
        }
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo || !slug || !descricao) {
            showMessage('error', 'Preencha todos os campos obrigatórios');
            return;
        }

        if (!isEditMode && !pdfFile) {
            showMessage('error', 'Selecione um arquivo PDF');
            return;
        }

        setSaving(true);

        try {
            let finalPdfUrl = pdfUrl;

            // Upload do PDF se houver um novo arquivo
            if (pdfFile) {
                finalPdfUrl = await arquivos.upload(pdfFile);
                if (isEditMode) await arquivos.remover(pdfUrl);
            }

            // Upload da imagem de capa
            let finalImageUrl = imageUrl;
            if (imageFile) {
                finalImageUrl = await arquivos.upload(imageFile);
                if (isEditMode) await arquivos.remover(imageUrl);
            }

            const denunciaData = {
                titulo,
                slug,
                descricao,
                pdfUrl: finalPdfUrl,
                imagemUrl: finalImageUrl,
                status,
                formularioAtivo
            };

            if (isEditMode && id) {
                await denunciasApi.atualizar(id, denunciaData);
                setPdfUrl(finalPdfUrl);
                setImageUrl(finalImageUrl);
                showMessage('success', 'Denúncia atualizada com sucesso!');
            } else {
                await denunciasApi.criar(denunciaData);
                showMessage('success', 'Denúncia criada com sucesso!');
                setTimeout(() => navigate('/admin/denuncias'), 2000);
            }
        } catch (error) {
            console.error('Erro ao salvar denúncia:', error);
            showMessage('error', error instanceof ApiError ? error.message : 'Erro ao salvar denúncia');
        } finally {
            setSaving(false);
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
                            onClick={() => navigate('/admin/denuncias')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white mb-1">
                                {isEditMode ? 'Editar Denúncia' : 'Nova Denúncia'}
                            </h1>
                            <p className="text-zinc-400">
                                {isEditMode ? 'Atualize as informações da denúncia' : 'Preencha os dados para criar uma nova denúncia'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMostrarPrevia(!mostrarPrevia)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        {mostrarPrevia ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {mostrarPrevia ? 'Ocultar Prévia' : 'Mostrar Prévia'}
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

                <div className={`grid ${mostrarPrevia ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                    {/* Formulário */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#111111] rounded-2xl p-6 border border-white/10"
                    >
                        <form onSubmit={handleSalvar} className="space-y-6">
                            {/* Título */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                    Título da Denúncia *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ex: Denúncia contra João Silva"
                                    className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                    Slug (URL) *
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 text-sm">/</span>
                                    <input
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="denuncia-joao-silva"
                                        className="flex-1 bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                                <p className="text-xs text-zinc-600 mt-1">
                                    Este será o endereço da denúncia: /{slug}
                                </p>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                    Descrição *
                                </label>
                                <textarea
                                    required
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Descrição geral da denúncia..."
                                    rows={4}
                                    className="w-full bg-[#0a0a0a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#D4A017] outline-none transition-all placeholder:text-zinc-600 resize-none"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                    Status da Publicação
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="rascunho"
                                            checked={status === 'rascunho'}
                                            onChange={(e) => setStatus(e.target.value as 'rascunho')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">Rascunho</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="publicado"
                                            checked={status === 'publicado'}
                                            onChange={(e) => setStatus(e.target.value as 'publicado')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-white">Publicado</span>
                                    </label>
                                </div>
                            </div>

                            {/* Formulário de Acesso */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                    Formulário de Acesso
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormularioAtivo(prev => !prev)}
                                    className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all ${formularioAtivo
                                        ? 'bg-[#D4A017]/10 border-[#D4A017] text-white'
                                        : 'bg-[#0a0a0a] border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                >
                                    <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${formularioAtivo ? 'bg-[#D4A017]' : 'bg-zinc-600'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formularioAtivo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">
                                            {formularioAtivo ? '🔒 Formulário ATIVADO' : '🔓 Formulário DESATIVADO'}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {formularioAtivo
                                                ? 'Visitantes precisam preencher formulário (nome, email, WhatsApp) antes de ver o conteúdo'
                                                : 'Conteúdo público — qualquer visitante pode acessar diretamente'
                                            }
                                        </p>
                                    </div>
                                </button>
                            </div>

                            {/* Imagem de Capa */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                    Imagem de Capa {isEditMode && <span className="text-zinc-600">(opcional para manter atual)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="block w-full bg-[#0a0a0a] text-white rounded-xl cursor-pointer hover:bg-[#252525] transition-colors border-2 border-dashed border-zinc-700 hover:border-[#D4A017] overflow-hidden"
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Prévia" className="w-full h-40 object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-zinc-400 p-4">
                                                <Upload className="w-5 h-5" />
                                                <span>{isEditMode ? 'Clique para alterar imagem' : 'Clique para selecionar imagem'}</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Upload PDF */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-2">
                                    Arquivo PDF * {isEditMode && <span className="text-zinc-600">(opcional para manter atual)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePdfChange}
                                        className="hidden"
                                        id="pdf-upload"
                                    />
                                    <label
                                        htmlFor="pdf-upload"
                                        className="block w-full bg-[#0a0a0a] text-white rounded-xl p-4 cursor-pointer hover:bg-[#252525] transition-colors border-2 border-dashed border-zinc-700 hover:border-[#D4A017]"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-zinc-400">
                                            <Upload className="w-5 h-5" />
                                            <span>
                                                {pdfFileName || (isEditMode ? 'Clique para alterar PDF' : 'Clique para selecionar PDF')}
                                            </span>
                                        </div>
                                    </label>
                                    {pdfFileName && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                                            <FileText className="w-4 h-4" />
                                            <span>{pdfFileName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botão Salvar */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-[#D4A017] text-black hover:bg-[#ca8a04] active:scale-[0.98] transition-all py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-yellow-500/20"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span className="uppercase tracking-widest text-sm">
                                    {saving ? 'Salvando...' : isEditMode ? 'Atualizar Denúncia' : 'Criar Denúncia'}
                                </span>
                            </button>
                        </form>
                    </motion.div>

                    {/* Prévia */}
                    {mostrarPrevia && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#111111] rounded-2xl p-6 border border-white/10 max-h-[800px] overflow-y-auto"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Eye className="w-5 h-5 text-[#D4A017]" />
                                <h2 className="text-xl font-bold text-white">Prévia</h2>
                            </div>

                            <div className="space-y-6">
                                {imagePreview && (
                                    <div className="rounded-xl overflow-hidden">
                                        <img src={imagePreview} alt="Capa" className="w-full h-40 object-cover" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-2">{titulo || 'Título da Denúncia'}</h1>
                                    <p className="text-zinc-400">{descricao || 'Descrição da denúncia aparecerá aqui...'}</p>
                                </div>

                                {pdfFileName && (
                                    <div className="bg-[#0a0a0a] rounded-xl p-4 flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-[#D4A017]" />
                                        <div>
                                            <p className="text-white font-semibold">Documento PDF</p>
                                            <p className="text-sm text-zinc-500">{pdfFileName}</p>
                                        </div>
                                    </div>
                                )}

                                {pdfUrl && !pdfFile && (
                                    <div className="bg-[#0a0a0a] rounded-xl overflow-hidden">
                                        <p className="text-xs text-zinc-500 px-4 pt-3 pb-2">Prévia do PDF atual:</p>
                                        <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`} className="w-full h-96 border-0" title="Prévia do PDF" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
