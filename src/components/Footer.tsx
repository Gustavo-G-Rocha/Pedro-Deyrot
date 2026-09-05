import { Link } from 'react-router-dom';
import {
    WHATSAPP_GRUPO,
    materialHref,
    RENAN_SITE,
    RENAN_PROPOSTAS,
    LIVRO_AMARELO,
    APP_MISSAO
} from '../config/links';

/**
 * Rodape no molde do site do Renan: tres colunas de links e a assinatura da
 * Missao embaixo. Antes o site simplesmente terminava.
 */
export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid gap-10 md:grid-cols-4">
                    {/* Identidade */}
                    <div className="md:col-span-2">
                        <p className="text-3xl font-black text-white">
                            Pedro <span className="text-[#D4A017]">Deyrot</span>{' '}
                            <span className="text-white/40">1414</span>
                        </p>
                        <p className="mt-4 max-w-md text-white/60 leading-relaxed">
                            Candidato a Deputado Federal pelo Paraná, pelo Partido Missão — o 14
                            de Renan Santos. O futuro é glorioso, e ele começa aqui.
                        </p>
                        <div aria-hidden="true" className="mt-6 flex gap-2">
                            <span className="w-6 h-6 bg-white/80" />
                            <span className="w-6 h-6 bg-[#D4A017]" />
                            <span className="w-6 h-6 border border-white/30" />
                        </div>
                    </div>

                    {/* Campanha do Pedro */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A017]">
                            Campanha
                        </h3>
                        <ul className="mt-4 space-y-3 text-white/70">
                            <li>
                                <Link to="/propostas" className="hover:text-[#D4A017] transition-colors">
                                    Propostas
                                </Link>
                            </li>
                            <li>
                                <Link to="/eventos" className="hover:text-[#D4A017] transition-colors">
                                    Agenda
                                </Link>
                            </li>
                            <li>
                                <Link to="/voluntarios" className="hover:text-[#D4A017] transition-colors">
                                    Seja voluntário
                                </Link>
                            </li>
                            <li>
                                <a
                                    href={materialHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#D4A017] transition-colors"
                                >
                                    Pedir kit
                                </a>
                            </li>
                            <li>
                                <a
                                    href={WHATSAPP_GRUPO}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#D4A017] transition-colors"
                                >
                                    Grupo no WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Campanha nacional */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A017]">
                            Missão 14
                        </h3>
                        <ul className="mt-4 space-y-3 text-white/70">
                            <li>
                                <a
                                    href={RENAN_SITE}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#D4A017] transition-colors"
                                >
                                    Renan Presidente
                                </a>
                            </li>
                            <li>
                                <a
                                    href={RENAN_PROPOSTAS}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#D4A017] transition-colors"
                                >
                                    Propostas nacionais
                                </a>
                            </li>
                            <li>
                                <a
                                    href={LIVRO_AMARELO}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#D4A017] transition-colors"
                                >
                                    Livro Amarelo
                                </a>
                            </li>
                            <li>
                                <a
                                    href={APP_MISSAO}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#D4A017] transition-colors"
                                >
                                    App da Missão
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 Pedro Deyrot · Partido Missão · Paraná</p>
                    <Link to="/LGPD" className="hover:text-[#D4A017] transition-colors">
                        Política de Privacidade
                    </Link>
                </div>
            </div>
        </footer>
    );
}
