import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Loader2, ExternalLink } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Evento {
    id: string;
    titulo: string;
    imagemUrl: string;
    link: string;
    criadoEm: Date;
}

export default function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarEventos();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('/fundo.png')`
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 z-0" />

            {/* Conteúdo */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                        Nossos <span className="text-[#eab308]">Eventos</span>
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Participe dos nossos encontros e eventos. Venha nos conhecer!
                    </p>
                </motion.div>

                {/* Lista de eventos */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#eab308] animate-spin" />
                    </div>
                ) : eventos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-[#242424]/70 backdrop-blur-md rounded-2xl p-12 border border-white/10 text-center">
                            <Calendar className="w-20 h-20 text-[#eab308] mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Em breve!</h2>
                            <p className="text-zinc-400 text-lg">
                                Estamos organizando nossos eventos. Em breve você encontrará aqui
                                todos os detalhes sobre onde e quando nos encontrar.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventos.map((evento, index) => (
                            <motion.a
                                key={evento.id}
                                href={evento.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group relative bg-[#242424]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-[#eab308]/50 transition-all hover:shadow-2xl hover:shadow-[#eab308]/20"
                            >
                                <div className="aspect-[4/5] overflow-hidden bg-zinc-900 flex items-center justify-center">
                                    <img
                                        src={evento.imagemUrl}
                                        alt={evento.titulo}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#eab308] transition-colors">
                                        {evento.titulo}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[#eab308] text-sm">
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Saiba mais</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-[#eab308] text-black px-3 py-1 rounded-full text-xs font-bold">
                                    Evento
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
