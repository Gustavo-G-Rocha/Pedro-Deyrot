import { Link } from 'react-router-dom';
import {
    ANO_ELEICAO,
    CNPJ_CAMPANHA,
    EMAIL_CONTATO,
    IDENTIFICACAO_CANDIDATO,
    NOME_URNA,
    NUMERO_CANDIDATO
} from '../config/campanha';

/**
 * Identificacao legal da propaganda eleitoral. A lei exige que toda peca diga
 * de quem ela e; na internet isso vale para cada pagina, entao este bloco entra
 * no rodape do site e tambem nas paginas que rodam fora do Layout (evento
 * fullscreen e LGPD).
 */
export default function AvisoEleitoral({ className = '' }: { className?: string }) {
    return (
        <section
            aria-label="Identificação da propaganda eleitoral"
            className={`text-xs leading-relaxed text-white/45 ${className}`}
        >
            <p className="font-bold uppercase tracking-[0.2em] text-white/60">
                Propaganda eleitoral · Eleições {ANO_ELEICAO}
            </p>
            <p className="mt-3">{IDENTIFICACAO_CANDIDATO}.</p>
            <p className="mt-2">
                Conteúdo de responsabilidade da campanha {NOME_URNA} {NUMERO_CANDIDATO},
                CNPJ {CNPJ_CAMPANHA}, inscrita na Justiça Eleitoral para as Eleições{' '}
                {ANO_ELEICAO}.
            </p>
            <p className="mt-2">
                Este site é mantido pela própria campanha. Não vende espaço publicitário,
                não veicula propaganda de terceiros e não recebe doações por aqui: toda
                arrecadação é feita apenas pelos canais oficiais registrados na Justiça
                Eleitoral.
            </p>
            <p className="mt-2">
                Dúvidas, pedidos de correção de conteúdo e direitos sobre dados pessoais:{' '}
                <a
                    href={`mailto:${EMAIL_CONTATO}`}
                    className="text-white/70 underline underline-offset-2 transition-colors hover:text-[#D4A017]"
                >
                    {EMAIL_CONTATO}
                </a>
                . Veja também a{' '}
                <Link
                    to="/LGPD"
                    className="text-white/70 underline underline-offset-2 transition-colors hover:text-[#D4A017]"
                >
                    Política de Privacidade
                </Link>
                .
            </p>
        </section>
    );
}
