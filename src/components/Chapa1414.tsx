import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { RENAN_SITE } from '../config/links';

/**
 * Bloco "14 + 1414": explica de um jeito visual que o numero do Pedro e o
 * numero da Missao repetido. Presidente 14, deputado federal 1414 - a conta
 * que o eleitor precisa levar pra urna.
 */
export default function Chapa1414() {
    return (
        <section className="border-y border-white/10 bg-[#111111]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#D4A017] mb-4">
                        A mesma missão
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-none">
                        O Brasil vota <span className="text-[#D4A017]">14</span>.
                        <br />
                        O Paraná vota <span className="text-[#D4A017]">1414</span>.
                    </h2>
                    <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                        Missão é o 14. Renan Santos leva o partido à Presidência; Pedro Deyrot
                        leva o Paraná à Câmara. Um voto só faz sentido com o outro.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Renan - presidente */}
                    <motion.a
                        href={RENAN_SITE}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-black p-8 transition-all hover:border-[#D4A017] hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                                Presidente
                            </span>
                            <ArrowUpRight className="w-6 h-6 text-[#D4A017] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                        <p className="mt-6 text-7xl md:text-8xl font-black leading-none text-[#D4A017]">
                            14
                        </p>
                        <h3 className="mt-4 text-2xl font-black text-white">Renan Santos</h3>
                        <p className="mt-2 text-white/60 leading-relaxed">
                            Cofundador do MBL, presidente do Partido Missão e candidato a
                            Presidente da República.
                        </p>
                        <span className="mt-6 inline-block text-sm font-bold uppercase tracking-wider text-[#D4A017]">
                            renanpresidente.com.br
                        </span>
                    </motion.a>

                    {/* Pedro - deputado federal */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative overflow-hidden rounded-2xl border-2 border-[#D4A017] bg-[#D4A017] p-8"
                    >
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-black/60">
                            Deputado Federal · PR
                        </span>
                        <p className="mt-6 text-7xl md:text-8xl font-black leading-none text-black">
                            1414
                        </p>
                        <h3 className="mt-4 text-2xl font-black text-black">Pedro Deyrot</h3>
                        <p className="mt-2 text-black/70 leading-relaxed">
                            Cofundador do MBL ao lado do Renan em 2014 e vice-presidente do
                            Partido Missão no Paraná.
                        </p>
                        <span className="mt-6 inline-block text-sm font-bold uppercase tracking-wider text-black/60">
                            Você já está aqui
                        </span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
