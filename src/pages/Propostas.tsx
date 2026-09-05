import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Check } from 'lucide-react';
import { propostas, type Proposta } from '../data/propostas';
import { LIVRO_AMARELO, RENAN_PROPOSTAS } from '../config/links';

// Cores por coluna do grid: 1 preta, 2 branca, 3 amarela.
const temas = [
    {
        card: 'bg-black border-white/15 hover:border-[#D4A017]',
        titulo: 'text-white',
        texto: 'text-white/70',
        acento: 'text-[#D4A017]',
        marcador: 'bg-[#D4A017]',
        modal: 'bg-black border-white/15',
        modalTitulo: 'text-white',
        modalTexto: 'text-white/80',
        modalTopico: 'text-white/90',
        fechar: 'text-white hover:bg-white/10'
    },
    {
        card: 'bg-white border-black/10 hover:border-[#D4A017]',
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
        card: 'bg-[#D4A017] border-black/10 hover:border-black',
        titulo: 'text-black',
        texto: 'text-black/70',
        acento: 'text-black',
        marcador: 'bg-black',
        modal: 'bg-[#D4A017] border-black/10',
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
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#D4A017]">
                        O programa da Missão no Paraná
                    </p>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight">
                        Vamos acabar <span className="text-[#D4A017]">com</span>
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Cada compromisso aqui nasce do mesmo programa que Renan Santos leva à
                        Presidência. Clique para ler por inteiro.
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
                {/* De onde vem o programa: o Livro Amarelo do Partido Missão. */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7 }}
                    className="mt-20 overflow-hidden rounded-2xl border-2 border-[#D4A017]/40 bg-[#111111]"
                >
                    <div className="grid md:grid-cols-5">
                        <div className="md:col-span-3 p-8 md:p-12">
                            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#D4A017]">
                                O programa completo
                            </p>
                            <h2 className="mt-4 text-4xl md:text-5xl font-black text-white leading-none">
                                Conheça o
                                <br />
                                <span className="text-[#D4A017]">Livro Amarelo</span>
                            </h2>
                            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
                                Todo partido promete; a Missão escreveu. São mais de 400 páginas
                                de diagnóstico e proposta, inscritas no estatuto do partido para
                                serem cobradas. É de lá que sai o que o Pedro defende em Brasília
                                e o que o Renan defende na Presidência.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <a
                                    href={LIVRO_AMARELO}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 rounded-full bg-[#D4A017] px-6 py-3 font-bold uppercase tracking-wider text-black transition-all hover:brightness-110"
                                >
                                    Ler o Livro Amarelo
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </a>
                                <a
                                    href={RENAN_PROPOSTAS}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-bold uppercase tracking-wider text-white transition-all hover:border-[#D4A017] hover:text-[#D4A017]"
                                >
                                    As 18 propostas do Renan
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                        </div>

                        {/* Painel dourado: fica no lugar da arte do livro ate o designer
                            entregar a imagem definitiva. */}
                        <div className="md:col-span-2 flex items-center justify-center bg-[#D4A017] p-10">
                            <div className="text-center">
                                <p className="text-6xl md:text-7xl font-black leading-none text-black">14</p>
                                <p className="mt-3 text-lg font-black uppercase tracking-[0.2em] text-black/70">
                                    Partido Missão
                                </p>
                                <p className="mt-6 text-2xl font-black uppercase leading-tight text-black">
                                    O futuro
                                    <br />
                                    é glorioso
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>
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
