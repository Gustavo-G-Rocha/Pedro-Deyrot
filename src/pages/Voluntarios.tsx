import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { voluntarios as voluntariosApi } from '../lib/api';

export default function Voluntarios() {
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

    const [formData, setFormData] = useState({
        nome: '',
        ddi: '+55',
        whatsapp: '',
        email: '',
        cep: '',
        bairro: '',
        estado: '',
        cidade: '',
        especialidade: '',
        termos: false
    });

    const filteredDdi = ddiOptions.filter(opt =>
        opt.name.toLowerCase().includes(ddiSearch.toLowerCase()) ||
        opt.code.includes(ddiSearch)
    );

    const selectedDdi = ddiOptions.find(opt => opt.code === formData.ddi) ?? ddiOptions[0];

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isSearchingCep, setIsSearchingCep] = useState(false);
    const [termosError, setTermosError] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));

        // Limpar erro de termos quando checkbox for marcado
        if (name === 'termos' && val) {
            setTermosError(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.termos) {
            setTermosError(true);
            return;
        }

        setTermosError(false);
        setStatus('loading');
        try {
            // Salvar no banco
            try {
                await voluntariosApi.criar(formData);
            } catch (dbError) {
                console.error("Erro ao salvar no banco:", dbError);
                // Não interrompe o fluxo para tentar enviar pro Google Sheets
            }

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tipo: 'voluntario' }),
            });

            const data = await response.json();
            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                // Clear form on success
                setFormData({
                    nome: '',
                    ddi: '+55',
                    whatsapp: '',
                    email: '',
                    cep: '',
                    bairro: '',
                    estado: '',
                    cidade: '',
                    especialidade: '',
                    termos: false
                });
            } else {
                setStatus('error');
                setMessage(data.error || 'Erro ao enviar o formulário.');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Ocorreu um erro inesperado.');
        }
    };

    const states = [
        { uf: "AC", name: "Acre" }, { uf: "AL", name: "Alagoas" }, { uf: "AP", name: "Amapá" },
        { uf: "AM", name: "Amazonas" }, { uf: "BA", name: "Bahia" }, { uf: "CE", name: "Ceará" },
        { uf: "DF", name: "Distrito Federal" }, { uf: "ES", name: "Espírito Santo" },
        { uf: "GO", name: "Goiás" }, { uf: "MA", name: "Maranhão" }, { uf: "MT", name: "Mato Grosso" },
        { uf: "MS", name: "Mato Grosso do Sul" }, { uf: "MG", name: "Minas Gerais" },
        { uf: "PA", name: "Pará" }, { uf: "PB", name: "Paraíba" }, { uf: "PR", name: "Paraná" },
        { uf: "PE", name: "Pernambuco" }, { uf: "PI", name: "Piauí" }, { uf: "RJ", name: "Rio de Janeiro" },
        { uf: "RN", name: "Rio Grande do Norte" }, { uf: "RS", name: "Rio Grande do Sul" },
        { uf: "RO", name: "Rondônia" }, { uf: "RR", name: "Roraima" }, { uf: "SC", name: "Santa Catarina" },
        { uf: "SP", name: "São Paulo" }, { uf: "SE", name: "Sergipe" }, { uf: "TO", name: "Tocantins" }
    ];

    return (
        <div className="relative min-h-screen flex items-center justify-center lg:justify-end p-4 lg:pr-8 overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('/fundo.png')`
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg bg-[#242424]/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 border border-white/10"
            >
                <header className="mb-8 text-center">
                    <img src="/logo-header.png" alt="Pedro Deyrot - Pré Candidato a Deputado Federal" className="w-full max-w-md mx-auto mb-4 lg:hidden" />
                    <p className="text-zinc-400 text-sm font-medium">Junte-se à mudança. Seja um voluntário.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="nome">
                            Nome completo
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
                            className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="whatsapp">
                            WhatsApp
                        </label>
                        <div className="flex gap-2">
                            {/* DDI custom dropdown */}
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
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, ddi: opt.code }));
                                                            setDdiOpen(false);
                                                            setDdiSearch('');
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-black hover:bg-zinc-100 transition-colors ${formData.ddi === opt.code ? 'bg-yellow-50 font-semibold' : ''
                                                            }`}
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
                                placeholder="(00) 00000-0000"
                                className="flex-1 bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="email">
                            E-mail
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
                            className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="cep">
                                CEP {isSearchingCep && <Loader2 className="inline w-3 h-3 animate-spin ml-2 text-[#eab308]" />}
                            </label>
                            <input
                                id="cep"
                                type="text"
                                name="cep"
                                required
                                value={formData.cep}
                                onChange={handleChange}
                                onBlur={(e) => fetchCep(e.target.value)}
                                autoComplete="postal-code"
                                inputMode="numeric"
                                placeholder="00000-000"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="bairro">
                                Bairro
                            </label>
                            <input
                                id="bairro"
                                type="text"
                                name="bairro"
                                required
                                value={formData.bairro}
                                onChange={handleChange}
                                autoComplete="address-level3"
                                placeholder="Ex: Centro"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                            />
                        </div>
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
                                autoComplete="address-level1"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="">Selecione o estado</option>
                                {states.map(s => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
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
                                placeholder="Ex: Acará"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="especialidade">
                            Especialidade
                        </label>
                        <input
                            id="especialidade"
                            type="text"
                            name="especialidade"
                            value={formData.especialidade}
                            onChange={handleChange}
                            placeholder="Ex: Divulgação, Edição, Panfletagem"
                            className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                        />
                        <p className="text-xs text-zinc-500 mt-1 ml-1">Separe as especialidades por vírgula.</p>
                    </div>

                    <div>
                        <div className="flex items-start gap-3 py-2">
                            <input
                                id="termos"
                                type="checkbox"
                                name="termos"
                                checked={formData.termos}
                                onChange={handleChange}
                                className={`mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-black focus:ring-offset-0 focus:ring-0 cursor-pointer ${termosError ? 'ring-2 ring-red-500' : ''
                                    }`}
                            />
                            <label htmlFor="termos" className={`text-xs leading-relaxed select-none ${termosError ? 'text-red-400' : 'text-zinc-400'
                                }`}>
                                Eu concordo com os{' '}
                                <a
                                    href="/LGPD"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#eab308] hover:text-[#ca8a04] underline cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    termos e condições
                                </a>{' '}
                                e autorizo o envio dos meus dados para fins de apoio e comunicação.
                            </label>
                        </div>
                        {termosError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 flex items-center gap-2 text-red-400 text-xs"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Você precisa aceitar os termos e condições para continuar.</span>
                            </motion.div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full mt-6 bg-[#eab308] text-black hover:bg-[#ca8a04] active:scale-[0.98] transition-all py-4 rounded-xl font-black flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-70 shadow-lg shadow-yellow-500/20"
                    >
                        {status === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                        )}
                        <span className="uppercase tracking-widest text-sm">Quero ser voluntário</span>
                    </button>
                </form>

                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p>{message || 'Informações enviadas com sucesso para a planilha!'}</p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
}
