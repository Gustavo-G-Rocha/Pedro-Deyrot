import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termos) {
      alert("Você precisa aceitar os termos e condições.");
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        // Clear form on success
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
    <div className="relative min-h-screen flex items-center justify-center lg:justify-end p-4 lg:pr-32 overflow-hidden">
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
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Como você enviou a imagem pelo chat, você precisará fazer o upload dela pelo explorador de arquivos ao lado para a pasta public/ com o nome "logo.png", ou alterar o nome no src abaixo. */}
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain invert" />
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">PEDRO DEYROT</h1>
          </div>
          <div className="h-1 w-12 bg-[#eab308] mx-auto mb-4" />
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

          <div className="flex items-start gap-3 py-2">
            <input
              id="termos"
              type="checkbox"
              name="termos"
              checked={formData.termos}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-black focus:ring-offset-0 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="termos" className="text-xs text-zinc-400 leading-relaxed cursor-pointer select-none">
              Eu concordo com os termos e condições e autorizo o envio dos meus dados para fins de apoio e comunicação.
            </label>
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

        <footer className="mt-8 pt-6 border-t border-white/5 text-center">
        </footer>
      </motion.div>
    </div>
  );
}
