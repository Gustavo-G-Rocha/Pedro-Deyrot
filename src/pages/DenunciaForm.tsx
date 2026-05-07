import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    checkDenunciaAccess,
    registerDenunciaAccess,
    saveDenunciaToFirebase,
    sendToGoogleSheets,
    checkEmailExists
} from '@/src/utils/denunciaAccess';

export default function DenunciaForm() {
    const navigate = useNavigate();
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

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isSearchingCep, setIsSearchingCep] = useState(false);
    const [termosError, setTermosError] = useState(false);

    // Verificar se usuário já tem acesso ao carregar a página
    useEffect(() => {
        const checkAccess = async () => {
            const { hasAccess } = await checkDenunciaAccess();
            if (hasAccess) {
                // Se já tem acesso, redirecionar direto para os arquivos
                navigate('/safadao/arquivos');
            }
        };
        checkAccess();
    }, [navigate]);

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
            console.log('🚀 Iniciando envio do formulário...');

            // Verificar se email já foi usado
            console.log('🔍 Verificando email...');
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                console.log('⚠️ Email já existe no banco');
                setStatus('error');
                setMessage('Este e-mail já foi utilizado anteriormente. Você já tem acesso aos arquivos.');
                // Registrar acesso e redirecionar
                await registerDenunciaAccess(formData);
                setTimeout(() => {
                    navigate('/safadao/arquivos');
                }, 2000);
                return;
            }

            // 1. Salvar no Firebase
            console.log('💾 Salvando no Firebase...');
            const firebaseId = await saveDenunciaToFirebase(formData);
            console.log('✅ Salvo no Firebase com ID:', firebaseId);

            // 2. Enviar para Google Sheets
            console.log('📊 Enviando para Google Sheets...');
            try {
                await sendToGoogleSheets(formData);
                console.log('✅ Enviado para Google Sheets com sucesso');
            } catch (sheetsError) {
                console.error('⚠️ Erro ao enviar para Google Sheets (continuando):', sheetsError);
                // Não bloquear o fluxo se o Google Sheets falhar
            }

            // 3. Registrar acesso (cookies + sessionStorage)
            console.log('🍪 Registrando acesso...');
            await registerDenunciaAccess(formData);
            console.log('✅ Acesso registrado');

            setStatus('success');
            setMessage('Informações registradas com sucesso! Redirecionando...');

            // Redirecionar após 1.5 segundos
            setTimeout(() => {
                navigate('/safadao/arquivos');
            }, 1500);

        } catch (error) {
            console.error('❌ Erro crítico ao processar formulário:', error);
            setStatus('error');

            // Mensagem mais detalhada
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setMessage(`Erro ao processar: ${errorMessage}. Por favor, tente novamente.`);
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
        <div className="relative min-h-screen flex items-center justify-center p-3 md:p-4 overflow-hidden bg-black">
            {/* Background Image - Desktop only */}
            <div
                className="hidden md:block absolute inset-0 z-0 bg-cover bg-right"
                style={{
                    backgroundImage: `url('/safadao@2x.png')`
                }}
            />
            {/* Dark Overlay for better readability - Desktop only */}
            <div className="hidden md:block absolute inset-0 z-0 bg-black/50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-6 lg:p-10 border border-white/20 overflow-hidden
                           md:bg-[#242424]/90 md:backdrop-blur-md"
            >
                {/* Background Image Mobile - Inside card */}
                <div
                    className="md:hidden absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/safadao@2x.png')`
                    }}
                />
                {/* Dark Overlay Mobile */}
                <div className="md:hidden absolute inset-0 z-0 bg-black/70" />

                <div className="relative z-10">
                    <header className="mb-3 text-center">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2">📄 Acesso aos Arquivos de Denúncia</h1>
                    </header>

                    {/* Aviso Destacado */}
                    <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg md:rounded-xl p-4 md:p-5 mb-4 md:mb-6">
                        <div className="flex items-center gap-3 md:gap-4">
                            <span className="text-3xl md:text-4xl">⚠️</span>
                            <div className="flex-1">
                                <p className="text-yellow-100 font-black text-base md:text-xl leading-tight">
                                    PREENCHA O FORMULÁRIO PARA ACESSAR OS ARQUIVOS
                                </p>
                            </div>
                        </div>
                    </div>

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
                                placeholder="Digite seu nome completo"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1 ml-1" htmlFor="whatsapp">
                                WhatsApp
                            </label>
                            <input
                                id="whatsapp"
                                type="tel"
                                name="whatsapp"
                                required
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                            />
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
                                    placeholder="Ex: Acará"
                                    className="w-full bg-white text-black rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-300 shadow-sm"
                                />
                            </div>
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
                                <label htmlFor="termos" className={`text-xs leading-relaxed cursor-pointer select-none ${termosError ? 'text-red-400' : 'text-zinc-400'
                                    }`}>
                                    Eu concordo com os termos e condições e autorizo o envio dos meus dados para acesso aos documentos.
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
                            <span className="uppercase tracking-widest text-sm font-black">Enviar e Acessar Documentos</span>
                        </button>

                        <p className="text-center text-xs text-zinc-400 mt-3">
                            Ao clicar no botão acima, você será redirecionado para a página com todos os arquivos da denúncia
                        </p>
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
                                <p>{message || 'Redirecionando para os arquivos...'}</p>
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
                </div>
            </motion.div>
        </div>
    );
}
