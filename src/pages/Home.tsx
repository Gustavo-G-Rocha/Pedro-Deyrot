import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Users, Calendar, MessageCircle, Package } from 'lucide-react';
import { WHATSAPP_GRUPO, materialHref } from '../config/links';

export default function Home() {
    return (
        <div className="relative bg-[#1a1a1a] overflow-hidden">
            {/* Foto de topo no fluxo normal da página: assim o conteúdo sempre
                começa DEPOIS da imagem, sem invadir a arte e sem sobrar vão.
                O <picture> troca desktop/mobile baixando só o arquivo usado. */}
            <div className="relative">
                <picture>
                    <source media="(min-width: 768px)" srcSet="/fundohome-2026.png" />
                    <img
                        src="/fundomobile-2026.png"
                        alt="Pedro Deyrot 1414 - Deputado Federal"
                        className="block w-full"
                    />
                </picture>

                {/* Gradiente para a foto se dissolver no fundo em vez de cortar seco.
                    Alturas diferentes de proposito: na arte de desktop a borda de
                    baixo ja e preta e a arte termina em 96,5%, entao da pra usar 8%
                    sem apagar o "DEPUTADO FEDERAL"; na de mobile os brasoes vao ate
                    ~98%, entao a dissolvida fica curta. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3%] md:h-[8%] bg-gradient-to-b from-transparent to-[#1a1a1a]" />
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-20 content-section">

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

                {/* Botões de ação rápida */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mb-6 max-w-4xl mx-auto grid sm:grid-cols-2 gap-4"
                >
                    <a
                        href={materialHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-3 rounded-2xl bg-[#eab308] px-6 py-5 text-black font-bold text-lg transition-all hover:brightness-110 hover:shadow-2xl hover:shadow-[#eab308]/25"
                    >
                        <Package className="w-6 h-6" />
                        Pedir kit
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </a>

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
                        Candidato a <span className="text-[#eab308] font-bold">Deputado Federal</span>
                    </p>
                </motion.div>
            </div>
        </div >
    );
}
