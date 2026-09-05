import { motion } from 'motion/react';
import { trajetoria } from '../data/trajetoria';

/**
 * Secao "Trajetoria", no mesmo espirito da linha do tempo do site do Renan.
 * Os marcos marcados com `destaque` ganham a bolinha dourada na linha do tempo.
 */
export default function Trajetoria() {
    return (
        <section className="bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="mb-12 max-w-3xl"
                >
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#D4A017] mb-4">
                        Trajetória
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-none">
                        A história do Pedro
                        <br />
                        é a história da <span className="text-[#D4A017]">Missão</span>
                    </h2>
                </motion.div>

                {/* A borda esquerda faz as vezes de linha do tempo. */}
                <ol className="relative border-l-2 border-white/10 ml-3 md:ml-6 space-y-10">
                    {trajetoria.map((marco, i) => (
                        <motion.li
                            key={marco.ano}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }}
                            className="relative pl-8 md:pl-12"
                        >
                            {/* Bolinha em cima da linha. */}
                            <span
                                aria-hidden="true"
                                className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-4 border-[#0a0a0a] ${marco.destaque ? 'bg-[#D4A017]' : 'bg-white/30'
                                    }`}
                            />

                            <span className="text-3xl md:text-4xl font-black text-[#D4A017] leading-none">
                                {marco.ano}
                            </span>

                            <h3 className="mt-2 text-xl md:text-2xl font-bold text-white">
                                {marco.titulo}
                            </h3>
                            <p className="mt-2 max-w-2xl text-white/70 leading-relaxed">
                                {marco.texto}
                            </p>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
