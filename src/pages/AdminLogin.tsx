import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { motion } from 'motion/react';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError('Email ou senha incorretos.');
            } else if (err.code === 'auth/user-not-found') {
                setError('Usuário não encontrado.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Senha incorreta.');
            } else {
                setError('Erro ao fazer login. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#242424] rounded-2xl shadow-2xl p-8 border border-white/10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#eab308]/20 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-[#eab308]" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Área Administrativa</h1>
                    <p className="text-zinc-400 text-sm">Faça login para gerenciar eventos</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@exemplo.com"
                                className="w-full bg-[#1a1a1a] text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2" htmlFor="password">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#1a1a1a] text-white rounded-xl p-4 pl-12 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#eab308] text-black hover:bg-[#ca8a04] active:scale-[0.98] transition-all py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-yellow-500/20"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Lock className="w-5 h-5" />
                        )}
                        <span className="uppercase tracking-widest text-sm">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </span>
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
