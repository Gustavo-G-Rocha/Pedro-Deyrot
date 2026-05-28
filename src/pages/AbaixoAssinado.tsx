import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

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
    { code: '+598', iso: 'uy', name: 'Uruguai' },
    { code: '+58', iso: 've', name: 'Venezuela' },
    { code: '+44', iso: 'gb', name: 'Reino Unido' },
    { code: '+49', iso: 'de', name: 'Alemanha' },
    { code: '+33', iso: 'fr', name: 'França' },
    { code: '+34', iso: 'es', name: 'Espanha' },
    { code: '+39', iso: 'it', name: 'Itália' },
    { code: '+351', iso: 'pt', name: 'Portugal' },
    { code: '+81', iso: 'jp', name: 'Japão' },
    { code: '+82', iso: 'kr', name: 'Coreia do Sul' },
    { code: '+86', iso: 'cn', name: 'China' },
    { code: '+91', iso: 'in', name: 'Índia' },
];

const states = [
    { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' },
    { uf: 'GO', name: 'Goiás' }, { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' },
    { uf: 'MS', name: 'Mato Grosso do Sul' }, { uf: 'MG', name: 'Minas Gerais' },
    { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' }, { uf: 'PR', name: 'Paraná' },
    { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' }, { uf: 'RJ', name: 'Rio de Janeiro' },
    { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' },
];

const flagUrl = (iso: string) => `https://flagcdn.com/w20/${iso}.png`;

const isClientBlockedError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error ?? '');
    return /ERR_BLOCKED_BY_CLIENT|blocked by client|webchannel|firestore/i.test(message);
};

export default function AbaixoAssinado() {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [message, setMessage] = useState('');
    const [whatsappError, setWhatsappError] = useState(false);

    const [ddiOpen, setDdiOpen] = useState(false);
    const [ddiSearch, setDdiSearch] = useState('');
    const ddiRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        nome: '',
        ddi: '+55',
        whatsapp: '',
        email: '',
        cidade: '',
        estado: '',
        estadoExteriorCustom: '',
    });

    const selectedDdi = ddiOptions.find((opt) => opt.code === formData.ddi) ?? ddiOptions[0];
    const filteredDdi = ddiOptions.filter((opt) =>
        opt.name.toLowerCase().includes(ddiSearch.toLowerCase()) || opt.code.includes(ddiSearch)
    );
    const estadoLabel = formData.estado === 'EXTERIOR'
        ? (formData.estadoExteriorCustom.trim() || 'Exterior')
        : formData.estado;

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'whatsapp') setWhatsappError(false);
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            ddi: '+55',
            whatsapp: '',
            email: '',
            cidade: '',
            estado: '',
            estadoExteriorCustom: '',
        });
        setWhatsappError(false);
        setDdiOpen(false);
        setDdiSearch('');
    };

    const handleScrollToForm = () => {
        const el = document.getElementById('form-assinatura');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const phoneDigits = formData.whatsapp.replace(/\D/g, '');
        if (phoneDigits.length < 8 || phoneDigits.length > 15) {
            setWhatsappError(true);
            setStatus('error');
            setMessage('Digite um WhatsApp válido. Aceitamos formatos nacionais e internacionais.');
            return;
        }

        if (formData.estado === 'EXTERIOR' && !formData.estadoExteriorCustom.trim()) {
            setStatus('error');
            setMessage('Informe o país/região para a opção Exterior.');
            return;
        }

        setStatus('loading');
        setMessage('');

        const fullPhone = `${formData.ddi} ${formData.whatsapp}`;
        const payload = {
            tipo: 'abaixo_assinado',
            nomeEvento: 'Abaixo-assinado',
            nome: formData.nome,
            ddi: formData.ddi,
            whatsapp: fullPhone,
            email: formData.email,
            cidade: formData.cidade,
            estado: estadoLabel,
            estadoSelecionado: formData.estado,
            estadoExteriorCustom: formData.estado === 'EXTERIOR' ? formData.estadoExteriorCustom.trim() : '',
            timestamp: new Date().toISOString(),
        };

        let firebaseBlockedByClient = false;

        try {
            try {
                await addDoc(collection(db, 'abaixo_assinado_assinaturas'), {
                    ...payload,
                    timestamp: serverTimestamp(),
                    createdAt: new Date().toISOString(),
                });
            } catch (fbError) {
                firebaseBlockedByClient = isClientBlockedError(fbError);
                console.error('Erro ao salvar no Firebase:', fbError);
            }

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                setStatus('success');
                setMessage(
                    firebaseBlockedByClient
                        ? 'Assinatura registrada na planilha. O Firebase foi bloqueado no navegador (ERR_BLOCKED_BY_CLIENT).'
                        : 'Assinatura registrada com sucesso! Obrigado por apoiar.'
                );
                resetForm();
                return;
            }

            setStatus('error');
            setMessage(data.error || 'Erro ao enviar para a planilha.');
        } catch (error) {
            console.error('Erro ao enviar assinatura:', error);
            setStatus('error');
            setMessage('Ocorreu um erro inesperado. Tente novamente.');
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#101010]">
            {/* Fundo desktop */}
            <div
                className="absolute inset-0 z-0 hidden md:block bg-cover bg-center"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, rgba(16,16,16,0.85), rgba(24,24,24,0.65)), url('/abaixo-assinado-bg-desktop.jpg')",
                }}
            />

            {/* Fundo mobile */}
            <div
                className="absolute inset-0 z-0 md:hidden bg-cover bg-center"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(16,16,16,0.9), rgba(24,24,24,0.7)), url('/abaixo-assinado-bg-mobile.jpg')",
                }}
            />

            <div className="absolute z-0 top-[-120px] right-[-120px] h-80 w-80 rounded-full bg-[#eab308]/20 blur-3xl" />

            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-10">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        <span className="inline-flex items-center rounded-full border border-[#eab308]/40 bg-[#eab308]/15 px-3 py-1 text-xs md:text-sm font-semibold tracking-wide text-[#facc15] uppercase">
                            Abaixo-assinado oficial
                        </span>

                        <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight text-white">
                            Sua assinatura fortalece
                            <span className="block text-[#facc15]">nossa causa</span>
                        </h1>

                        <p className="mt-5 text-white/85 text-base md:text-lg leading-relaxed max-w-xl">
                            Participe do abaixo-assinado e ajude a transformar essa pauta em uma prioridade real.
                            Cada apoio registrado aumenta nossa força para levar essa proposta adiante.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleScrollToForm}
                                className="inline-flex items-center justify-center rounded-xl bg-[#eab308] px-6 py-3 font-bold text-[#181818] hover:bg-[#facc15] transition-colors cursor-pointer"
                            >
                                Assinar agora
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
                        className="rounded-3xl border border-white/10 bg-black/35 backdrop-blur-md p-3 md:p-4 shadow-2xl"
                    >
                        <img
                            src="/abaixo-assinado-hero.png"
                            alt="Ilustração da campanha de abaixo-assinado"
                            className="w-full h-[280px] md:h-[420px] object-cover rounded-2xl"
                        />
                    </motion.div>
                </div>
            </section>

            <section id="form-assinatura" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 md:pb-24 scroll-mt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="w-full rounded-2xl shadow-2xl p-6 md:p-10 border border-white/20 bg-[#242424]/80 backdrop-blur-md"
                >
                    <header className="mb-7 text-center">
                        <h2 className="text-2xl md:text-4xl font-black text-white">Formulário de Assinatura</h2>
                        <p className="text-zinc-400 text-sm md:text-base mt-2">
                            Preencha seus dados para registrar apoio no abaixo-assinado.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="nome">
                                Nome
                            </label>
                            <input
                                id="nome"
                                type="text"
                                name="nome"
                                required
                                value={formData.nome}
                                onChange={handleChange}
                                autoComplete="name"
                                placeholder="Digite seu nome completo"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="whatsapp">
                                WhatsApp
                            </label>
                            <div className="flex gap-2">
                                <div ref={ddiRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => { setDdiOpen((o) => !o); setDdiSearch(''); }}
                                        className="h-full min-w-[76px] bg-white text-black rounded-xl px-3 py-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all shadow-sm flex items-center gap-1 cursor-pointer"
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
                                                    onChange={(e) => setDdiSearch(e.target.value)}
                                                    className="w-full text-sm text-black px-3 py-2 rounded-lg border border-zinc-200 outline-none focus:ring-2 focus:ring-[#eab308]"
                                                />
                                            </div>
                                            <ul className="max-h-52 overflow-y-auto">
                                                {filteredDdi.map((opt) => (
                                                    <li key={opt.code}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, ddi: opt.code }));
                                                                setDdiOpen(false);
                                                                setDdiSearch('');
                                                            }}
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
                                    id="whatsapp"
                                    type="tel"
                                    name="whatsapp"
                                    required
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    autoComplete="tel-national"
                                    inputMode="tel"
                                    placeholder="(00) 00000-0000 ou 9999-9999"
                                    className="flex-1 bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300 shadow-sm"
                                />
                            </div>
                            <p className="mt-1 ml-1 text-[11px] text-zinc-400">
                                Aceita celular e múltiplos formatos com ou sem máscara.
                            </p>
                            {whatsappError && (
                                <p className="mt-1 ml-1 text-sm text-red-400">Número de WhatsApp inválido.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                inputMode="email"
                                placeholder="exemplo@email.com"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300 shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="estado">
                                    Estado
                                </label>
                                <select
                                    id="estado"
                                    name="estado"
                                    required
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none appearance-none cursor-pointer shadow-sm"
                                >
                                    <option value="">Selecione o estado</option>
                                    {states.map((s) => (
                                        <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                                    ))}
                                    <option value="EXTERIOR">Exterior (personalizado)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="cidade">
                                    Cidade
                                </label>
                                <input
                                    id="cidade"
                                    type="text"
                                    name="cidade"
                                    required
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    autoComplete="address-level2"
                                    placeholder="Ex: Curitiba"
                                    className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300 shadow-sm"
                                />
                            </div>
                        </div>

                        {formData.estado === 'EXTERIOR' && (
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="estadoExteriorCustom">
                                    País/Região (Exterior)
                                </label>
                                <input
                                    id="estadoExteriorCustom"
                                    type="text"
                                    name="estadoExteriorCustom"
                                    required
                                    value={formData.estadoExteriorCustom}
                                    onChange={handleChange}
                                    placeholder="Ex: Portugal"
                                    className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none placeholder:text-zinc-300 shadow-sm"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full mt-1 bg-[#eab308] hover:bg-[#facc15] disabled:opacity-70 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando assinatura...
                                </>
                            ) : (
                                'Registrar assinatura'
                            )}
                        </button>

                        {status !== 'idle' && (
                            <div className={`rounded-xl p-3 text-sm font-medium flex items-center gap-2 ${status === 'success'
                                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                                : status === 'error'
                                    ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                                    : 'bg-zinc-700/40 border border-zinc-600 text-zinc-200'
                                }`}>
                                {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                {status === 'error' && <AlertCircle className="w-4 h-4" />}
                                {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                                {message || 'Processando...'}
                            </div>
                        )}
                    </form>
                </motion.div>
            </section>
        </div>
    );
}
