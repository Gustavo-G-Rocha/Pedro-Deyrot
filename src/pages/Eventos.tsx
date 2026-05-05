import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

export default function Eventos() {
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

                {/* Placeholder para eventos futuros */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-[#242424]/70 backdrop-blur-md rounded-2xl p-12 border border-white/10 text-center">
                        <Calendar className="w-20 h-20 text-[#eab308] mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">Em breve!</h2>
                        <p className="text-zinc-400 text-lg mb-8">
                            Estamos organizando nossos eventos. Em breve você encontrará aqui
                            todos os detalhes sobre onde e quando nos encontrar.
                        </p>

                        {/* Exemplo de como os eventos serão exibidos */}
                        <div className="text-left space-y-4 mt-12 border-t border-white/10 pt-8">
                            <p className="text-zinc-500 text-sm uppercase font-semibold mb-4">Formato dos próximos eventos:</p>

                            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                <h3 className="text-xl font-bold text-white mb-3">Encontro com a Comunidade</h3>
                                <div className="space-y-2 text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#eab308]" />
                                        <span>Data a ser definida</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#eab308]" />
                                        <span>Horário a ser definido</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#eab308]" />
                                        <span>Local a ser definido</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-[#eab308]" />
                                        <span>Aberto ao público</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
