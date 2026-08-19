import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Check } from 'lucide-react';
import { propostas, type Proposta } from '../data/propostas';

// Cores por coluna do grid: 1 preta, 2 branca, 3 amarela.
const temas = [
    {
        card: 'bg-black border-white/15 hover:border-[#eab308]',
        titulo: 'text-white',
        texto: 'text-white/70',
        acento: 'text-[#eab308]',
        marcador: 'bg-[#eab308]',
        modal: 'bg-black border-white/15',
        modalTitulo: 'text-white',
        modalTexto: 'text-white/80',
        modalTopico: 'text-white/90',
        fechar: 'text-white hover:bg-white/10'
    },
    {
        card: 'bg-white border-black/10 hover:border-[#eab308]',
        titulo: 'text-black',
        texto: 'text-black/70',
        acento: 'text-black',
        marcador: 'bg-black',
        modal: 'bg-white border-black/10',
        modalTitulo: 'text-black',
        modalTexto: 'text-black/75',
        modalTopico: 'text-black/90',
        fechar: 'text-black hover:bg-black/10'
    },
    {
        card: 'bg-[#eab308] border-black/10 hover:border-black',
        titulo: 'text-black',
        texto: 'text-black/70',
        acento: 'text-black',
        marcador: 'bg-black',
        modal: 'bg-[#eab308] border-black/10',
        modalTitulo: 'text-black',
        modalTexto: 'text-black/80',
        modalTopico: 'text-black/90',
        fechar: 'text-black hover:bg-black/10'
    }
];

export default function Propostas() {
    const [aberta, setAberta] = useState<{ proposta: Proposta; tema: number } | null>(null);

    // Fecha no ESC e trava o scroll do fundo enquanto o modal esta aberto.
    useEffect(() => {
        if (!aberta) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setAberta(null);
        };

        document.addEventListener('keydown', onKeyDown);
        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = overflowAnterior;
        };
    }, [aberta]);

    return (
        <div className="min-h-screen bg-[#1a1a1a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                        Vamos acabar <span className="text-[#eab308]">com</span>
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Clique em uma proposta para ler o compromisso completo.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {propostas.map((proposta, i) => {
                        const tema = temas[i % 3];
                        return (
                            <motion.button
                                key={proposta.id}
                                type="button"
                                onClick={() => setAberta({ proposta, tema: i % 3 })}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                                className={`group text-left flex flex-col justify-between h-full min-h-[11rem] rounded-2xl p-8 border-2 transition-all hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 cursor-pointer ${tema.card}`}
                            >
                                <h2 className={`text-2xl md:text-3xl font-black leading-tight ${tema.titulo}`}>
                                    {proposta.titulo}
                                </h2>
                                {proposta.resumo && (
                                    <p className={`mt-3 flex-1 leading-relaxed ${tema.texto}`}>
                                        {proposta.resumo}
                                    </p>
                                )}
                                <span className={`mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${tema.acento}`}>
                                    Ver proposta
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Modal da proposta */}
            <AnimatePresence>
                {aberta && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setAberta(null)}
                        role="dialog"
                        aria-modal="true"
                        aria-label={aberta.proposta.titulo}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-2 p-8 md:p-10 shadow-2xl ${temas[aberta.tema].modal}`}
                        >
                            <button
                                type="button"
                                onClick={() => setAberta(null)}
                                aria-label="Fechar"
                                className={`absolute top-4 right-4 rounded-full p-2 transition-colors ${temas[aberta.tema].fechar}`}
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className={`text-3xl md:text-4xl font-black mb-6 pr-10 leading-tight ${temas[aberta.tema].modalTitulo}`}>
                                {aberta.proposta.titulo}
                            </h2>

                            <div className="space-y-4">
                                {aberta.proposta.conteudo.length > 0 ? (
                                    aberta.proposta.conteudo.map((paragrafo, idx) => (
                                        <p key={idx} className={`text-lg leading-relaxed ${temas[aberta.tema].modalTexto}`}>
                                            {paragrafo}
                                        </p>
                                    ))
                                ) : (
                                    <p className={`text-lg leading-relaxed italic ${temas[aberta.tema].modalTexto}`}>
                                        Texto completo em breve.
                                    </p>
                                )}
                            </div>

                            {aberta.proposta.topicos && aberta.proposta.topicos.length > 0 && (
                                <ul className="mt-8 space-y-3">
                                    {aberta.proposta.topicos.map((topico, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className={`mt-1 flex-shrink-0 rounded-full p-1 ${temas[aberta.tema].marcador}`}>
                                                <Check className={`w-3 h-3 ${aberta.tema === 0 ? 'text-black' : 'text-white'}`} strokeWidth={4} />
                                            </span>
                                            <span className={`font-medium ${temas[aberta.tema].modalTopico}`}>{topico}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
