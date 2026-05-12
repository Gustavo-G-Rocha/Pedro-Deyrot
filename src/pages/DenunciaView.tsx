import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Download, AlertCircle, Loader2, ArrowLeft, Eye, Users, CheckCircle2, Lock, Share2 } from 'lucide-react';

interface Denuncia {
    titulo: string;
    slug: string;
    descricao: string;
    pdfUrl: string;
    imagemUrl?: string;
    status: string;
    formularioAtivo?: boolean;
    mensagemWhatsapp?: string;
    estatisticas: {
        visualizacoes: number;
        downloads: number;
        formularioEnvios?: number;
    };
}

export default function DenunciaView() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
    const [loading, setLoading] = useState(true);
    const [denunciaId, setDenunciaId] = useState<string>('');

    // Form gate state
    const [temAcesso, setTemAcesso] = useState(false);
    const [formData, setFormData] = useState({ nome: '', email: '', whatsapp: '', cidade: '' });
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formMessage, setFormMessage] = useState('');
    const [whatsappError, setWhatsappError] = useState(false);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);

    useEffect(() => {
        carregarDenuncia();
    }, [slug]);

    const carregarDenuncia = async () => {
        if (!slug) {
            navigate('/denuncias');
            return;
        }

        try {
            // Buscar denúncia por slug
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const denunciasRef = collection(db, 'denuncias');
            const q = query(denunciasRef, where('slug', '==', slug));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                navigate('/denuncias');
                return;
            }

            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data() as Denuncia;

            // Verificar se está publicada
            if (data.status !== 'publicado') {
                navigate('/denuncias');
                return;
            }

            setDenunciaId(docSnap.id);
            setDenuncia(data);

            // Verificar acesso ao formulário
            const jaAcessou = sessionStorage.getItem(`denuncia_form_${slug}`) === 'true';
            if (data.formularioAtivo && !jaAcessou) {
                setTemAcesso(false);
            } else {
                setTemAcesso(true);
                // Incrementar visualizações somente quando acessa o conteúdo
                await updateDoc(doc(db, 'denuncias', docSnap.id), {
                    'estatisticas.visualizacoes': increment(1)
                });
            }

        } catch (error) {
            console.error('Erro ao carregar denúncia:', error);
            navigate('/denuncias');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'whatsapp') setWhatsappError(false);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanPhone = formData.whatsapp.replace(/\D/g, '');
        if (cleanPhone.length < 9 || cleanPhone.length > 11) {
            setWhatsappError(true);
            return;
        }

        setFormStatus('loading');

        if (!denunciaId) {
            setFormStatus('error');
            setFormMessage('Erro interno: denúncia não identificada. Recarregue a página.');
            return;
        }

        try {
            // Salvar lead na subcoleção da denúncia usando o slug como caminho
            console.log('💾 Salvando lead no Firestore...', { slug });
            const leadRef = await addDoc(collection(db, 'denuncias', slug!, 'leads'), {
                ...formData,
                titulo: denuncia?.titulo || '',
                slug: slug,
                timestamp: serverTimestamp()
            });
            console.log('✅ Lead salvo no Firestore:', leadRef.id);

            // Incrementar contador de envios
            await updateDoc(doc(db, 'denuncias', denunciaId), {
                'estatisticas.formularioEnvios': increment(1),
                'estatisticas.visualizacoes': increment(1)
            });

            // Enviar para Google Sheets via webhook
            fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: 'denuncia_formulario',
                    nomeEvento: `D-${denuncia?.titulo || slug}`,
                    tituloDenuncia: denuncia?.titulo || '',
                    slug: slug,
                    ...formData,
                    timestamp: new Date().toISOString()
                })
            }).catch((err) => { console.warn('⚠️ Erro ao enviar para Sheets:', err); });

            // Registrar acesso na sessão
            sessionStorage.setItem(`denuncia_form_${slug}`, 'true');

            setFormStatus('success');
            setFormMessage('Acesso liberado! Carregando conteúdo...');
            setTimeout(() => setTemAcesso(true), 1500);

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            setFormStatus('error');
            setFormMessage('Erro ao processar. Tente novamente.');
        }
    };

    const handleDownloadPDF = async () => {
        if (!denuncia?.pdfUrl || !denunciaId) return;

        try {
            // Incrementar downloads
            await updateDoc(doc(db, 'denuncias', denunciaId), {
                'estatisticas.downloads': increment(1)
            });

            // Abrir PDF em nova aba (inicia o download)
            window.open(denuncia.pdfUrl, '_blank');

            // Mostrar mensagem de sucesso e redirecionar
            setPdfDownloaded(true);

            setTimeout(() => {
                const defaultMsg = "Tem outras denúncias?";
                const customMsg = denuncia.mensagemWhatsapp || defaultMsg;
                const encodedMsg = encodeURIComponent(customMsg);

                // TODO: Substitua pelo número real da equipe
                const numeroWhatsApp = "554188828924";
                window.location.href = `https://wa.me/${numeroWhatsApp}?text=${encodedMsg}`;
            }, 3000); // 3 segundos para o usuário ler a mensagem antes de redirecionar

        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: denuncia?.titulo || 'Denúncia - Pedro Deyrot',
            text: denuncia?.descricao || 'Confira este dossiê detalhado na íntegra.',
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copiado para a área de transferência!');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Erro ao compartilhar:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-12 h-12 text-[#eab308] animate-spin" />
            </div>
        );
    }

    if (!denuncia) {
        return null;
    }

    // Form gate — exibir quando formulário está ativo e usuário não tem acesso
    if (denuncia.formularioAtivo && !temAcesso) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-3 md:p-4 overflow-hidden bg-black">
                {/* Background */}
                {denuncia.imagemUrl ? (
                    <>
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                backgroundImage: `url(${denuncia.imagemUrl})`,
                                backgroundSize: '300px',
                                backgroundRepeat: 'repeat',
                            }}
                        />
                        <div className="absolute inset-0 z-0 bg-black/80" />
                    </>
                ) : (
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(234, 179, 8, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 179, 8, 0.05) 1px, transparent 1px)',
                            backgroundSize: '50px 50px',
                            opacity: 0.4
                        }}
                    />
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-10 border border-white/20 bg-[#242424]/80 backdrop-blur-md"
                >
                    <header className="mb-4 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#eab308]/20 border border-[#eab308]/40 mb-3">
                            <Lock className="w-6 h-6 text-[#eab308]" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                            Acesso aos Arquivos
                        </h1>
                        <p className="text-zinc-400 text-sm">{denuncia.titulo}</p>
                    </header>

                    <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 mb-5">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">⚠️</span>
                            <p className="text-yellow-100 font-black text-sm md:text-base leading-tight">
                                PREENCHA O FORMULÁRIO PARA ACESSAR OS ARQUIVOS DE DENÚNCIA
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1">Nome completo</label>
                            <input
                                type="text"
                                name="nome"
                                required
                                value={formData.nome}
                                onChange={handleFormChange}
                                autoComplete="name"
                                placeholder="Digite seu nome completo"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1">WhatsApp</label>
                            <input
                                type="tel"
                                name="whatsapp"
                                required
                                value={formData.whatsapp}
                                onChange={handleFormChange}
                                autoComplete="tel"
                                inputMode="numeric"
                                placeholder="(00) 00000-0000"
                                className={`w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300 ${whatsappError ? 'ring-2 ring-red-500' : ''}`}
                            />
                            {whatsappError && <p className="text-red-400 text-xs mt-1 ml-1">Número inválido (9–11 dígitos)</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleFormChange}
                                autoComplete="email"
                                inputMode="email"
                                placeholder="seu@email.com"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1">Cidade</label>
                            <input
                                type="text"
                                name="cidade"
                                value={formData.cidade}
                                onChange={handleFormChange}
                                autoComplete="address-level2"
                                placeholder="Sua cidade"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300"
                            />
                        </div>

                        <AnimatePresence>
                            {formStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{formMessage}</span>
                                </motion.div>
                            )}
                            {formStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    <span>{formMessage}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={formStatus === 'loading' || formStatus === 'success'}
                            className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-yellow-500/20"
                        >
                            {formStatus === 'loading' ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                            ) : formStatus === 'success' ? (
                                <><CheckCircle2 className="w-5 h-5" /> Acesso Liberado!</>
                            ) : (
                                'Acessar Arquivos de Denúncia'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-zinc-600 mt-4">
                        Seus dados são protegidos e não serão divulgados.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-4 lg:p-8 overflow-hidden bg-black">
            {/* Background */}
            {denuncia.imagemUrl ? (
                <>
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: `url(${denuncia.imagemUrl})`,
                            backgroundSize: '300px',
                            backgroundRepeat: 'repeat',
                        }}
                    />
                    <div className="absolute inset-0 z-0 bg-black/85" />
                </>
            ) : (
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(234, 179, 8, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(234, 179, 8, 0.03) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        opacity: 0.3
                    }}
                />
            )}

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Botões do Topo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <Link
                        to="/denuncias"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Link>

                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#eab308]/10 hover:bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/30 rounded-lg transition-colors w-full sm:w-auto justify-center"
                    >
                        <Share2 className="w-4 h-4" />
                        Compartilhar Dossiê
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#242424]/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-12 border border-white/20"
                >
                    {/* Aviso Legal */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3 mb-8">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-zinc-300">
                            <p className="font-semibold text-yellow-400 mb-1">Documento de Acesso Público</p>
                            <p>Este dossiê contém exclusivamente fatos verificáveis extraídos de documentos públicos. Não constitui acusação, opinião ou conclusão jurídica.</p>
                        </div>
                    </div>

                    {/* Título da Denúncia */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            {denuncia.titulo}
                        </h1>
                        <p className="text-zinc-400 text-lg mb-6">
                            {denuncia.descricao}
                        </p>

                        {/* Estatísticas */}
                        <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                <Eye className="w-4 h-4" />
                                <span>{denuncia.estatisticas?.visualizacoes || 0} visualizações</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                <Download className="w-4 h-4" />
                                <span>{denuncia.estatisticas?.downloads || 0} downloads</span>
                            </div>
                            {denuncia.formularioAtivo && (
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <Users className="w-4 h-4" />
                                    <span>{denuncia.estatisticas?.formularioEnvios || 0} acessos via formulário</span>
                                </div>
                            )}
                        </div>

                        {/* Visualizador de PDF */}
                        {denuncia.pdfUrl ? (
                            <div className="mt-4">
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(denuncia.pdfUrl)}&embedded=true`}
                                    className="w-full rounded-xl border border-white/10"
                                    style={{ height: '80vh', minHeight: '600px' }}
                                    title={denuncia.titulo}
                                />
                                <div className="mt-6 text-center flex flex-col items-center">
                                    <AnimatePresence>
                                        {pdfDownloaded ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-4 flex flex-col items-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                                            >
                                                <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>PDF Baixado!</span>
                                                </div>
                                                <p className="text-zinc-300 text-sm flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Redirecionando para o WhatsApp...
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-xl font-bold transition-all shadow-lg shadow-[#eab308]/20 hover:scale-105"
                                            >
                                                <Download className="w-5 h-5" />
                                                Baixar PDF Completo
                                            </button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-zinc-500">Nenhum documento disponível</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
