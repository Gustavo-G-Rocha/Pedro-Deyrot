import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Plus, Trash2, ExternalLink, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface Evento {
    id: string;
    titulo: string;
    imagemUrl: string;
    link: string;
    criadoEm: Date;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [titulo, setTitulo] = useState('');
    const [link, setLink] = useState('');
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);

    useEffect(() => {
        // Verificar autenticação
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate('/admin');
            } else {
                carregarEventos();
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const carregarEventos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'eventos'));
            const eventosData: Evento[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                eventosData.push({
                    id: doc.id,
                    titulo: data.titulo,
                    imagemUrl: data.imagemUrl,
                    link: data.link,
                    criadoEm: data.criadoEm?.toDate() || new Date()
                });
            });
            setEventos(eventosData.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()));
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

        if (!imagem) {
            showMessage('error', 'Selecione uma imagem');
            return;
        }

        setSaving(true);

        try {
            // Upload da imagem
            const imageRef = ref(storage, `eventos/${Date.now()}_${imagem.name}`);
            await uploadBytes(imageRef, imagem);
            const imagemUrl = await getDownloadURL(imageRef);

            // Adicionar evento ao Firestore
            await addDoc(collection(db, 'eventos'), {
                titulo,
                imagemUrl,
                link,
                criadoEm: Timestamp.now()
            });

            showMessage('success', 'Evento adicionado com sucesso!');

            // Limpar formulário
            setTitulo('');
            setLink('');
            setImagem(null);
            setImagemPreview(null);

            // Recarregar eventos
            carregarEventos();
        } catch (error) {
            console.error('Erro ao adicionar evento:', error);
            showMessage('error', 'Erro ao adicionar evento');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvento = async (evento: Evento) => {
        if (!confirm(`Tem certeza que deseja deletar "${evento.titulo}"?`)) return;

        try {
            // Deletar imagem do Storage
            const imageRef = ref(storage, evento.imagemUrl);
            await deleteObject(imageRef).catch(() => {
                // Ignorar erro se imagem já foi deletada
            });

            // Deletar documento do Firestore
            await deleteDoc(doc(db, 'eventos', evento.id));

            showMessage('success', 'Evento deletado com sucesso!');
            carregarEventos();
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            showMessage('error', 'Erro ao deletar evento');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin');
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#eab308] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-1">Gerenciar Eventos</h1>
                        <p className="text-zinc-400">Adicione, edite ou remova eventos</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
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

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Formulário para adicionar evento */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#242424] rounded-2xl p-6 border border-white/10"
                    >
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-[#eab308]" />
                            Adicionar Novo Evento
                        </h2>

                        <form onSubmit={handleAddEvento} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Título do Evento
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ex: Encontro com a Comunidade"
                                    className="w-full bg-[#1a1a1a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-500"
                                />
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
                                    className="w-full bg-[#1a1a1a] text-white rounded-xl p-4 focus:ring-2 focus:ring-[#eab308] outline-none transition-all placeholder:text-zinc-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
                                    Imagem do Evento
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="imagem-upload"
                                        required
                                    />
                                    <label
                                        htmlFor="imagem-upload"
                                        className="block w-full bg-[#1a1a1a] text-white rounded-xl p-4 cursor-pointer hover:bg-[#252525] transition-colors border-2 border-dashed border-zinc-700 hover:border-[#eab308]"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-zinc-400">
                                            <ImageIcon className="w-5 h-5" />
                                            <span>{imagem ? imagem.name : 'Clique para selecionar'}</span>
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
                                className="w-full bg-[#eab308] text-black hover:bg-[#ca8a04] active:scale-[0.98] transition-all py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-yellow-500/20"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                <span className="uppercase tracking-widest text-sm">
                                    {saving ? 'Salvando...' : 'Adicionar Evento'}
                                </span>
                            </button>
                        </form>
                    </motion.div>

                    {/* Lista de eventos */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#242424] rounded-2xl p-6 border border-white/10"
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
                                        className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-[#eab308]/30 transition-colors"
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
                                                    className="text-[#eab308] text-sm hover:underline flex items-center gap-1 mb-2"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    <span className="truncate">{evento.link}</span>
                                                </a>
                                                <p className="text-zinc-500 text-xs">
                                                    {evento.criadoEm.toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEvento(evento)}
                                                className="flex-shrink-0 p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                                title="Deletar evento"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
