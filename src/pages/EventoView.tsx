import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventos as eventosApi } from '../lib/api';
import { motion } from 'motion/react';
import { Calendar, ExternalLink, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Users, Share2 } from 'lucide-react';

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
    inscricaoHabilitada?: boolean;
    linkFormularioExterno?: string;
}

export default function EventoView() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [loading, setLoading] = useState(true);
    const [eventoId, setEventoId] = useState<string>('');
    const [totalInscricoes, setTotalInscricoes] = useState<number>(0);

    // Estados do formulário
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        whatsapp: '',
        email: '',
        cep: '',
        bairro: '',
        estado: '',
        cidade: '',
        termos: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');
    const [isSearchingCep, setIsSearchingCep] = useState(false);
    const [termosError, setTermosError] = useState(false);

    useEffect(() => {
        carregarEvento();
    }, [slug]);

    const carregarEvento = async () => {
        if (!slug) {
            navigate('/eventos');
            return;
        }

        try {
            // A API resolve slug ou id no mesmo endpoint e ja traz a contagem.
            const data = await eventosApi.buscar(slug);

            const eventoData = {
                id: data.id,
                titulo: data.titulo,
                imagemUrl: data.imagem_url,
                link: data.link,
                descricao: data.descricao || '',
                botoes: data.botoes || [],
                criadoEm: new Date(data.criado_em),
                slug: data.slug ?? undefined,
                metaInscricoes: data.meta_inscricoes || 0,
                inscricaoHabilitada: data.inscricao_habilitada !== false,
                linkFormularioExterno: data.link_formulario_externo || ''
            };

            setEventoId(data.id);
            setEvento(eventoData);

            if (eventoData.metaInscricoes > 0 && eventoData.inscricaoHabilitada) {
                setTotalInscricoes(data.total_inscricoes ?? 0);
            }

        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            navigate('/eventos');
        } finally {
            setLoading(false);
        }
    };

    const fetchCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setIsSearchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    bairro: data.bairro || prev.bairro,
                    cidade: data.localidade || prev.cidade,
                    estado: data.uf || prev.estado
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setIsSearchingCep(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));

        if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
            fetchCep(value);
        }

        if (name === 'termos' && val) {
            setTermosError(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            whatsapp: '',
            email: '',
            cep: '',
            bairro: '',
            estado: '',
            cidade: '',
            termos: false
        });
        setSubmitStatus('idle');
        setSubmitMessage('');
        setTermosError(false);
    };

    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.termos) {
            setTermosError(true);
            return;
        }

        if (!evento) return;

        // Verificar se ainda há vagas disponíveis
        if (evento.metaInscricoes && evento.metaInscricoes > 0) {
            if (totalInscricoes >= evento.metaInscricoes) {
                setSubmitStatus('error');
                setSubmitMessage('Desculpe, as vagas para este evento já foram preenchidas.');
                return;
            }
        }

        setTermosError(false);
        setSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Salvar a inscrição. A resposta já traz o total atualizado.
            const { totalInscricoes: novoTotal } = await eventosApi.inscrever(eventoId, {
                nome: formData.nome,
                whatsapp: formData.whatsapp,
                email: formData.email,
                cep: formData.cep,
                bairro: formData.bairro,
                estado: formData.estado,
                cidade: formData.cidade
            });
            setTotalInscricoes(novoTotal);

            // Enviar para Google Sheets
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tipo: 'evento',
                    nomeEvento: evento.titulo,
                    eventoId: eventoId
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitStatus('success');
                setSubmitMessage('Inscrição realizada com sucesso! Em breve entraremos em contato.');

                // A contagem já foi atualizada com a resposta da inscrição.

                resetForm();
                setTimeout(() => {
                    setMostrarFormulario(false);
                    setSubmitStatus('idle');
                }, 3000);
            } else {
                throw new Error(data.error || 'Erro ao enviar');
            }
        } catch (error) {
            console.error('Erro ao enviar lead:', error);
            setSubmitStatus('error');
            setSubmitMessage('Erro ao enviar inscrição. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: evento?.titulo || 'Evento - Pedro Deyrot',
            text: evento?.descricao || 'Confira os detalhes deste evento.',
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

    const states = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-12 h-12 text-[#eab308] animate-spin" />
            </div>
        );
    }

    if (!evento) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl text-white mb-4">Evento não encontrado</h2>
                    <Link to="/eventos" className="text-[#eab308] hover:underline">
                        Voltar para Eventos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a]">
            <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-40 flex flex-col sm:flex-row gap-2">
                <Link
                    to="/eventos"
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[#242424]/90 backdrop-blur-md text-white rounded-lg border border-white/10 hover:border-[#eab308]/50 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Voltar</span>
                </Link>
            </div>

            <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 flex flex-col sm:flex-row gap-2">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-[#eab308]/10 backdrop-blur-md text-[#eab308] rounded-lg border border-[#eab308]/30 hover:bg-[#eab308]/20 transition-all shadow-lg"
                >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base hidden sm:inline">Compartilhar</span>
                </button>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 py-16 sm:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#242424]/80 backdrop-blur-md sm:rounded-2xl overflow-hidden border-y sm:border border-white/10"
                >
                    {/* Imagem do Evento */}
                    <div className="min-h-[70vh] sm:min-h-[60vh] md:min-h-0 md:aspect-video w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                        <img
                            src={evento.imagemUrl}
                            alt={evento.titulo}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 sm:p-8 md:p-12">
                        {/* Título */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-[#eab308] flex-shrink-0 mt-1" />
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight">
                                {evento.titulo}
                            </h1>
                        </div>

                        {/* Descrição */}
                        {evento.descricao && (
                            <div className="mb-6 sm:mb-8">
                                <p className="text-base sm:text-lg text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                    {evento.descricao}
                                </p>
                            </div>
                        )}

                        {/* Botões Personalizados */}
                        {evento.botoes && evento.botoes.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
                                {evento.botoes.map((botao, index) => (
                                    <a
                                        key={index}
                                        href={botao.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-5 py-3.5 sm:px-6 sm:py-3 bg-[#eab308] hover:bg-[#eab308]/90 text-black font-bold rounded-lg transition-colors text-base sm:text-base"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        {botao.texto}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Link Principal do Evento */}
                        {evento.link && (
                            <div className="mb-6 sm:mb-8">
                                <a
                                    href={evento.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex sm:inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:px-6 sm:py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors text-base"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Ver mais informações
                                </a>
                            </div>
                        )}

                        {/* Contador de Vagas */}
                        {(evento.metaInscricoes ?? 0) > 0 && evento.inscricaoHabilitada !== false && (
                            <div className="mb-6">
                                <div className="bg-gradient-to-r from-[#eab308]/10 to-transparent border-l-4 border-[#eab308] rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-5 h-5 text-[#eab308]" />
                                        <span className="text-white font-semibold">Vagas Disponíveis</span>
                                    </div>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Carregando...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-[#eab308]">
                                                    {Math.max(0, (evento.metaInscricoes ?? 0) - totalInscricoes)}
                                                </span>
                                                <span className="text-zinc-400">
                                                    de {evento.metaInscricoes ?? 0} vagas
                                                </span>
                                            </div>
                                            {totalInscricoes > 0 && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-[#eab308] h-full transition-all duration-500"
                                                            style={{ width: `${Math.min(100, (totalInscricoes / (evento.metaInscricoes ?? 1)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        {totalInscricoes} {totalInscricoes === 1 ? 'pessoa inscrita' : 'pessoas inscritas'}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Botão de Inscrição */}
                        {!mostrarFormulario ? (
                            <>
                                {/* Se as inscrições estão esgotadas (apenas para formulário interno) */}
                                {evento.inscricaoHabilitada !== false && evento.metaInscricoes && evento.metaInscricoes > 0 && totalInscricoes >= evento.metaInscricoes ? (
                                    <div className="w-full py-4 bg-zinc-800 text-zinc-400 font-bold text-base sm:text-lg rounded-lg text-center border-2 border-zinc-700">
                                        🎫 Inscrições Esgotadas
                                    </div>
                                ) : (
                                    <>
                                        {/* Se a inscrição está desabilitada, mostrar link externo */}
                                        {evento.inscricaoHabilitada === false ? (
                                            <>
                                                {evento.linkFormularioExterno ? (
                                                    <a
                                                        href={evento.linkFormularioExterno}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 w-full py-4 sm:py-4 bg-[#eab308] hover:bg-[#eab308]/90 text-black font-bold text-base sm:text-lg rounded-lg transition-colors active:scale-[0.98]"
                                                    >
                                                        <ExternalLink className="w-5 h-5" />
                                                        Fazer Inscrição
                                                    </a>
                                                ) : (
                                                    <div className="w-full py-4 bg-zinc-800 text-zinc-400 font-bold text-base sm:text-lg rounded-lg text-center border-2 border-zinc-700">
                                                        Inscrições em breve
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            /* Formulário interno habilitado */
                                            <button
                                                onClick={() => setMostrarFormulario(true)}
                                                className="w-full py-4 sm:py-4 bg-[#eab308] hover:bg-[#eab308]/90 text-black font-bold text-base sm:text-lg rounded-lg transition-colors active:scale-[0.98]"
                                            >
                                                Quero Participar
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="mt-8 p-8 bg-zinc-900/50 rounded-xl border border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-6">
                                    Inscreva-se no Evento
                                </h3>

                                <form onSubmit={handleSubmitLead} className="space-y-4">
                                    <div>
                                        <label className="block text-white mb-2 font-medium">Nome Completo *</label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleFormChange}
                                            required
                                            autoComplete="name"
                                            className="w-full px-4 py-3 bg-[#242424] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white mb-2 font-medium">WhatsApp *</label>
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleFormChange}
                                            required
                                            autoComplete="tel"
                                            inputMode="numeric"
                                            placeholder="(00) 00000-0000"
                                            className="w-full px-4 py-3 bg-[#242424] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white mb-2 font-medium">E-mail</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            autoComplete="email"
                                            inputMode="email"
                                            className="w-full px-4 py-3 bg-[#242424] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white mb-2 font-medium">CEP</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="cep"
                                                value={formData.cep}
                                                onChange={handleFormChange}
                                                autoComplete="postal-code"
                                                inputMode="numeric"
                                                placeholder="00000-000"
                                                className="w-full px-4 py-3 bg-[#242424] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308]"
                                            />
                                            {isSearchingCep && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="w-5 h-5 text-[#eab308] animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white mb-2 font-medium">Bairro</label>
                                            <input
                                                type="text"
                                                name="bairro"
                                                value={formData.bairro}
                                                onChange={handleFormChange}
                                                autoComplete="address-level3"
                                                className="w-full px-4 py-3 bg-[#242424] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white mb-2 font-medium">Cidade</label>
                                            <input
                                                type="text"
                                                name="cidade"
                                                value={formData.cidade}
                                                onChange={handleFormChange}
                                                autoComplete="address-level2"
                                                className="w-full px-4 py-3 bg-[#242424] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white mb-2 font-medium">Estado</label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleFormChange}
                                            autoComplete="address-level1"
                                            className="w-full px-4 py-3 bg-[#242424] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#eab308]"
                                        >
                                            <option value="">Selecione</option>
                                            {states.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={`flex items-start gap-3 p-4 rounded-lg ${termosError ? 'bg-red-500/10 border border-red-500' : 'bg-zinc-800/50'}`}>
                                        <input
                                            type="checkbox"
                                            name="termos"
                                            id="termos"
                                            checked={formData.termos}
                                            onChange={handleFormChange}
                                            className="mt-1"
                                        />
                                        <label htmlFor="termos" className="text-sm text-zinc-300">
                                            Aceito os <Link to="/LGPD" target="_blank" className="text-[#eab308] hover:underline">termos de uso e política de privacidade</Link> *
                                        </label>
                                    </div>

                                    {termosError && (
                                        <p className="text-red-500 text-sm">Você precisa aceitar os termos para continuar.</p>
                                    )}

                                    {submitStatus === 'success' && (
                                        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span className="text-green-500">{submitMessage}</span>
                                        </div>
                                    )}

                                    {submitStatus === 'error' && (
                                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-red-500">{submitMessage}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMostrarFormulario(false);
                                                resetForm();
                                            }}
                                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 py-3 bg-[#eab308] hover:bg-[#eab308]/90 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {submitting ? 'Enviando...' : 'Confirmar Inscrição'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
