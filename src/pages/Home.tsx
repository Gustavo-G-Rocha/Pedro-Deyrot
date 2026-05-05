import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Users, Calendar } from 'lucide-react';

export default function Home() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background com blur */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center blur-lg scale-110"
                style={{
                    backgroundImage: `url('/fundohome.png')`
                }}
            />

            {/* Overlay escuro */}
            <div className="absolute inset-0 bg-black/50 z-0" />

            {/* Conteúdo */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        Transformando o <span className="text-[#eab308]">Pará</span>
                        <br />
                        com você
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                        Juntos, podemos construir um futuro melhor para todos.
                        <br />
                        Seja parte desta mudança.
                    </p>
                </motion.div>

                {/* Cards de ação */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Link
                            to="/voluntarios"
                            className="flex flex-col h-full group bg-[#242424]/90 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-[#eab308]/50 transition-all hover:shadow-2xl hover:shadow-[#eab308]/20"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Users className="w-12 h-12 text-[#eab308]" />
                                <ArrowRight className="w-6 h-6 text-[#eab308] transition-transform group-hover:translate-x-2" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Seja Voluntário</h2>
                            <p className="text-white/70">
                                Junte-se ao nosso time e faça a diferença na sua comunidade.
                                Cadastre-se agora e seja parte desta transformação.
                            </p>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Link
                            to="/eventos"
                            className="flex flex-col h-full group bg-[#242424]/90 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-[#eab308]/50 transition-all hover:shadow-2xl hover:shadow-[#eab308]/20"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Calendar className="w-12 h-12 text-[#eab308]" />
                                <ArrowRight className="w-6 h-6 text-[#eab308] transition-transform group-hover:translate-x-2" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Eventos</h2>
                            <p className="text-white/70">
                                Participe dos nossos eventos e encontros.
                                Veja onde estaremos e venha conversar conosco.
                            </p>
                        </Link>
                    </motion.div>
                </div>

                {/* Chamada secundária */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center mt-16"
                >
                    <p className="text-white/80 text-lg">
                        Pré-candidato a <span className="text-[#eab308] font-bold">Deputado Federal</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
