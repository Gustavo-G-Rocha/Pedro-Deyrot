import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Download, AlertCircle, Loader2, ArrowLeft, Eye, Users, CheckCircle2, Lock, Share2, FileWarning, ZoomIn, ZoomOut } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    const [formData, setFormData] = useState({ nome: '', ddi: '+55', email: '', whatsapp: '', cidade: '' });
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formMessage, setFormMessage] = useState('');
    const [whatsappError, setWhatsappError] = useState(false);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);

    // DDI dropdown
    const ddiOptions = [
        { code: '+55', iso: 'br', name: 'Brasil' },
        { code: '+1', iso: 'us', name: 'EUA' },
        { code: '+54', iso: 'ar', name: 'Argentina' },
        { code: '+591', iso: 'bo', name: 'Bolívia' },
        { code: '+56', iso: 'cl', name: 'Chile' },
        { code: '+57', iso: 'co', name: 'Colômbia' },
        { code: '+506', iso: 'cr', name: 'Costa Rica' },
        { code: '+53', iso: 'cu', name: 'Cuba' },
        { code: '+593', iso: 'ec', name: 'Equador' },
        { code: '+503', iso: 'sv', name: 'El Salvador' },
        { code: '+502', iso: 'gt', name: 'Guatemala' },
        { code: '+509', iso: 'ht', name: 'Haiti' },
        { code: '+504', iso: 'hn', name: 'Honduras' },
        { code: '+52', iso: 'mx', name: 'México' },
        { code: '+505', iso: 'ni', name: 'Nicarágua' },
        { code: '+507', iso: 'pa', name: 'Panamá' },
        { code: '+595', iso: 'py', name: 'Paraguai' },
        { code: '+51', iso: 'pe', name: 'Peru' },
        { code: '+1-787', iso: 'pr', name: 'Porto Rico' },
        { code: '+1-809', iso: 'do', name: 'Rep. Dominicana' },
        { code: '+598', iso: 'uy', name: 'Uruguai' },
        { code: '+58', iso: 've', name: 'Venezuela' },
        { code: '+44', iso: 'gb', name: 'Reino Unido' },
        { code: '+49', iso: 'de', name: 'Alemanha' },
        { code: '+33', iso: 'fr', name: 'França' },
        { code: '+34', iso: 'es', name: 'Espanha' },
        { code: '+39', iso: 'it', name: 'Itália' },
        { code: '+351', iso: 'pt', name: 'Portugal' },
        { code: '+31', iso: 'nl', name: 'Holanda' },
        { code: '+32', iso: 'be', name: 'Bélgica' },
        { code: '+41', iso: 'ch', name: 'Suíça' },
        { code: '+43', iso: 'at', name: 'Áustria' },
        { code: '+46', iso: 'se', name: 'Suécia' },
        { code: '+47', iso: 'no', name: 'Noruega' },
        { code: '+45', iso: 'dk', name: 'Dinamarca' },
        { code: '+358', iso: 'fi', name: 'Finlândia' },
        { code: '+48', iso: 'pl', name: 'Polônia' },
        { code: '+380', iso: 'ua', name: 'Ucrânia' },
        { code: '+7', iso: 'ru', name: 'Rússia' },
        { code: '+81', iso: 'jp', name: 'Japão' },
        { code: '+82', iso: 'kr', name: 'Coreia do Sul' },
        { code: '+86', iso: 'cn', name: 'China' },
        { code: '+91', iso: 'in', name: 'Índia' },
        { code: '+61', iso: 'au', name: 'Austrália' },
        { code: '+64', iso: 'nz', name: 'Nova Zelândia' },
        { code: '+27', iso: 'za', name: 'África do Sul' },
        { code: '+234', iso: 'ng', name: 'Nigéria' },
        { code: '+20', iso: 'eg', name: 'Egito' },
        { code: '+212', iso: 'ma', name: 'Marrocos' },
        { code: '+971', iso: 'ae', name: 'Emirados Árabes' },
        { code: '+972', iso: 'il', name: 'Israel' },
        { code: '+966', iso: 'sa', name: 'Arábia Saudita' },
        { code: '+90', iso: 'tr', name: 'Turquia' },
    ];
    const flagUrl = (iso: string) => `https://flagcdn.com/w20/${iso}.png`;
    const [ddiOpen, setDdiOpen] = useState(false);
    const [ddiSearch, setDdiSearch] = useState('');
    const ddiRef = useRef<HTMLDivElement>(null);
    const filteredDdi = ddiOptions.filter(opt =>
        opt.name.toLowerCase().includes(ddiSearch.toLowerCase()) || opt.code.includes(ddiSearch)
    );
    const selectedDdi = ddiOptions.find(opt => opt.code === formData.ddi) ?? ddiOptions[0];

    // PDF state
    const [numPages, setNumPages] = useState<number | null>(null);
    const [reachedEnd, setReachedEnd] = useState(false);
    const [pdfContainerWidth, setPdfContainerWidth] = useState<number>(0);
    const [pdfError, setPdfError] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [scale, setScale] = useState(1.0);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        carregarDenuncia();
    }, [slug]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ddiRef.current && !ddiRef.current.contains(e.target as Node)) {
                setDdiOpen(false);
                setDdiSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const updateWidth = () => {
            if (pdfContainerRef.current) {
                // Deduct a little padding
                setPdfContainerWidth(pdfContainerRef.current.clientWidth - 32);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [denuncia, temAcesso]); // Re-run when view loads

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
        if (cleanPhone.length < 7) {
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
            const fullPhone = `${formData.ddi} ${formData.whatsapp}`;

            // Salvar lead na subcoleção da denúncia usando o slug como caminho
            const leadRef = await addDoc(collection(db, 'denuncias', slug!, 'leads'), {
                ...formData,
                whatsapp: fullPhone,
                titulo: denuncia?.titulo || '',
                slug: slug,
                timestamp: serverTimestamp()
            });

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
                    whatsapp: fullPhone,
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

            setPdfDownloaded(true);
            setTimeout(() => {
                redirectWhatsApp();
            }, 3000);


        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
        }
    };

    const redirectWhatsApp = (isManualClick = false) => {
        const defaultMsg = "Tem outras denúncias?";
        const customMsg = denuncia?.mensagemWhatsapp || defaultMsg;
        const encodedMsg = encodeURIComponent(customMsg);

        const numeroWhatsApp = "554188829438";
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodedMsg}`;

        if (isManualClick) {
            // Se o usuário clicou no botão, podemos abrir em nova guia (o navegador não bloqueia)
            window.open(url, '_blank');
        } else {
            // Se for automático (pela rolagem), precisamos usar a mesma guia para não cair no bloqueador de popups
            window.location.href = url;
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

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPdfError(false);
        // Recalculate width after load
        if (pdfContainerRef.current) {
            setPdfContainerWidth(pdfContainerRef.current.clientWidth - 32);
        }
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('Erro ao carregar PDF:', error);
        setPdfError(true);
    };

    const handlePdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        // Calcular progresso da leitura
        const maxScroll = scrollHeight - clientHeight;
        const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
        setScrollProgress(progress);

        // Check if user scrolled to the bottom (within 150px)
        if (maxScroll - scrollTop < 150) {
            if (!reachedEnd && numPages) {
                setReachedEnd(true);
                redirectWhatsApp(); // Redireciona automaticamente
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
                            <div className="flex gap-2">
                                <div ref={ddiRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => { setDdiOpen(o => !o); setDdiSearch(''); }}
                                        className="h-full min-w-[72px] bg-white text-black rounded-xl px-3 py-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                                    >
                                        <img src={flagUrl(selectedDdi.iso)} alt={selectedDdi.name} className="w-5 h-auto rounded-sm" />
                                        <span className="text-sm font-medium">{selectedDdi.code}</span>
                                        <svg className={`w-3 h-3 ml-auto transition-transform ${ddiOpen ? 'rotate-180' : ''}`} viewBox="0 0 10 6" fill="none">
                                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    {ddiOpen && (
                                        <div className="absolute z-50 mt-1 left-0 w-56 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden">
                                            <div className="p-2 border-b border-zinc-100">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Buscar país..."
                                                    value={ddiSearch}
                                                    onChange={e => setDdiSearch(e.target.value)}
                                                    className="w-full text-sm text-black px-3 py-2 rounded-lg border border-zinc-200 outline-none focus:ring-2 focus:ring-[#eab308]"
                                                />
                                            </div>
                                            <ul className="max-h-52 overflow-y-auto">
                                                {filteredDdi.map(opt => (
                                                    <li key={opt.code}>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setFormData(prev => ({ ...prev, ddi: opt.code })); setDdiOpen(false); setDdiSearch(''); }}
                                                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-black hover:bg-zinc-100 transition-colors ${formData.ddi === opt.code ? 'bg-yellow-50 font-semibold' : ''}`}
                                                        >
                                                            <img src={flagUrl(opt.iso)} alt={opt.name} className="w-5 h-auto rounded-sm flex-shrink-0" />
                                                            <span className="flex-1 text-left">{opt.name}</span>
                                                            <span className="text-zinc-400">{opt.code}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                                {filteredDdi.length === 0 && (
                                                    <li className="px-4 py-3 text-sm text-zinc-400 text-center">Nenhum resultado</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    required
                                    value={formData.whatsapp}
                                    onChange={handleFormChange}
                                    autoComplete="tel-national"
                                    inputMode="tel"
                                    placeholder="(00) 00000-0000"
                                    className={`flex-1 bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300 ${whatsappError ? 'ring-2 ring-red-500' : ''}`}
                                />
                            </div>
                            {whatsappError && <p className="text-red-400 text-xs mt-1 ml-1">Número inválido</p>}
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
                            <div className="mt-4 flex flex-col items-center w-full" ref={pdfContainerRef}>

                                {pdfError ? (
                                    <div className="w-full bg-zinc-900 rounded-xl border border-white/10 p-8 flex flex-col items-center justify-center">
                                        <FileWarning className="w-12 h-12 text-zinc-500 mb-4" />
                                        <p className="text-zinc-400 mb-6 text-center">
                                            Não foi possível carregar o visualizador nativo devido às configurações do arquivo.
                                        </p>
                                        <iframe
                                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(denuncia.pdfUrl)}&embedded=true`}
                                            className="w-full rounded-xl border border-white/10"
                                            style={{ height: '70vh', minHeight: '500px' }}
                                            title={denuncia.titulo}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-full h-[75vh] min-h-[600px] overflow-y-auto overflow-x-auto bg-zinc-950/50 rounded-xl border border-white/10 relative scroll-smooth"
                                        onScroll={handlePdfScroll}
                                    >
                                        {/* Zoom Controls */}
                                        <div className="sticky top-4 right-4 z-20 flex flex-col gap-1 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 float-right shadow-xl">
                                            <button
                                                onClick={() => setScale(s => Math.min(s + 0.25, 3))}
                                                className="p-2 text-zinc-300 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                                                title="Aumentar zoom"
                                            >
                                                <ZoomIn className="w-5 h-5" />
                                            </button>
                                            <div className="h-px bg-white/10 w-full" />
                                            <button
                                                onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
                                                className="p-2 text-zinc-300 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                                                title="Diminuir zoom"
                                            >
                                                <ZoomOut className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="py-6 flex flex-col items-center min-h-full min-w-min">
                                            <Document
                                                file={denuncia.pdfUrl}
                                                onLoadSuccess={onDocumentLoadSuccess}
                                                onLoadError={onDocumentLoadError}
                                                loading={
                                                    <div className="flex flex-col items-center justify-center py-20 text-yellow-500">
                                                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                                        <span className="text-sm font-semibold tracking-wider">CARREGANDO DOSSIÊ...</span>
                                                    </div>
                                                }
                                                className="flex flex-col items-center gap-6"
                                            >
                                                {numPages && Array.from(new Array(numPages), (el, index) => (
                                                    <div key={`page_${index + 1}`} className="bg-white p-2 sm:p-4 rounded-xl shadow-2xl">
                                                        <Page
                                                            pageNumber={index + 1}
                                                            scale={scale}
                                                            width={pdfContainerWidth > 0 ? Math.min(pdfContainerWidth, 800) : undefined}
                                                            renderTextLayer={false}
                                                            renderAnnotationLayer={false}
                                                            className="rounded-lg overflow-hidden transition-transform duration-200"
                                                        />
                                                    </div>
                                                ))}
                                            </Document>
                                        </div>

                                        {/* Barra de progresso / Indicador flutuante */}
                                        {numPages && !reachedEnd && (
                                            <div className="sticky bottom-0 left-0 w-full pointer-events-none pb-6 px-4 flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 to-transparent pt-10">
                                                <div className="bg-black/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 text-xs sm:text-sm font-bold text-white shadow-2xl flex items-center gap-3">
                                                    <span>Continue lendo para liberar o WhatsApp</span>
                                                    <div className="w-4 h-4 rounded-full border-2 border-[#25D366] border-t-transparent animate-spin" />
                                                </div>
                                                <div className="w-full max-w-sm h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-500 to-[#25D366] transition-all duration-200 ease-out relative"
                                                        style={{ width: `${Math.min(scrollProgress, 100)}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Ações do final do documento */}
                                <AnimatePresence>
                                    {(reachedEnd || pdfError) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="w-full mt-6 flex flex-col items-center bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 md:p-8"
                                        >
                                            <h3 className="text-2xl font-black text-white mb-2 text-center">
                                                Você terminou de ler o dossiê?
                                            </h3>
                                            <p className="text-zinc-300 text-center mb-6">
                                                Fale com nossa equipe diretamente no WhatsApp para mais informações ou para enviar evidências adicionais.
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                                <button
                                                    onClick={() => redirectWhatsApp(true)}
                                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#25D366]/20 hover:scale-105 w-full sm:w-auto text-lg"
                                                >
                                                    Falar no WhatsApp
                                                </button>

                                                {!pdfDownloaded && (
                                                    <button
                                                        onClick={handleDownloadPDF}
                                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 w-full sm:w-auto"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                        Baixar Arquivo
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
