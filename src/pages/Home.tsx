import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Users, Calendar, ChevronDown, MessageCircle, Package } from 'lucide-react';
import { WHATSAPP_GRUPO, materialHref } from '../config/links';

export default function Home() {
    return (
        <div className="relative min-h-[200vh] overflow-hidden">
            {/* Background - Desktop */}
            <div
                className="absolute inset-0 z-0 bg-contain bg-top bg-no-repeat hidden md:block"
                style={{
                    backgroundImage: `url('/fundohome-2026.png')`,
                    backgroundSize: '100% auto'
                }}
            />

            {/* Background - Mobile (9:16) */}
            <div
                className="absolute inset-0 z-0 bg-contain bg-top bg-no-repeat md:hidden"
                style={{
                    backgroundImage: `url('/fundomobile-2026.png')`,
                    backgroundSize: '100% auto'
                }}
            />

            {/* Seta de scroll animada */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [1, 0.5, 1],
                    y: [0, 15, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
                onClick={() => {
                    window.scrollTo({
                        top: window.innerHeight * 1.2,
                        behavior: 'smooth'
                    });
                }}
            >
                <div className="bg-[#eab308]/20 rounded-full p-4 backdrop-blur-sm border-2 border-[#eab308]">
                    <ChevronDown className="w-8 h-8 text-[#eab308] drop-shadow-2xl" strokeWidth={3} />
                </div>
            </motion.div>

            {/* Conteúdo */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[130vh] md:pt-[90vh] pb-20 content-section">

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12 md:mb-16 max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        Transformando o <span className="text-[#eab308]">Paraná</span>
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
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
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
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
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

                {/* Botões de ação rápida */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mt-8 max-w-4xl mx-auto grid sm:grid-cols-2 gap-4"
                >
                    <a
                        href={WHATSAPP_GRUPO}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-5 text-black font-bold text-lg transition-all hover:brightness-110 hover:shadow-2xl hover:shadow-[#25D366]/25"
                    >
                        <MessageCircle className="w-6 h-6" />
                        Entrar no grupo do WhatsApp
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </a>

                    <a
                        href={materialHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-3 rounded-2xl bg-[#eab308] px-6 py-5 text-black font-bold text-lg transition-all hover:brightness-110 hover:shadow-2xl hover:shadow-[#eab308]/25"
                    >
                        <Package className="w-6 h-6" />
                        Pedir material
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </a>
                </motion.div>

                {/* Chamada secundária */}
                <motion.div
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                        duration: 0.8
                    }}
                    className="text-center mt-16"
                >
                    <p className="text-white/80 text-lg">
                        Pré-candidato a <span className="text-[#eab308] font-bold">Deputado Federal</span>
                    </p>
                </motion.div>
            </div>
        </div >
    );
}
