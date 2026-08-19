// Propostas exibidas na pagina /propostas, sob a chamada "Vamos acabar com".
// A ordem daqui e a ordem do grid (coluna 1 preta, 2 branca, 3 amarela).
//
// COMO PREENCHER O TEXTO DE CADA UMA:
// enquanto `conteudo` estiver vazio, o modal mostra so o titulo e um aviso de
// "em breve". Basta escrever os paragrafos dentro de `conteudo` (cada string
// vira um paragrafo) e, se quiser, os compromissos em `topicos`. Exemplo:
//
//     conteudo: ['Primeiro paragrafo.', 'Segundo paragrafo.'],
//     topicos: ['Compromisso um', 'Compromisso dois']

export interface Proposta {
    id: string;
    titulo: string;
    /** Frase curta no card, abaixo do titulo (opcional). */
    resumo?: string;
    /** Cada item vira um paragrafo dentro do modal. Vazio = "texto em breve". */
    conteudo: string[];
    /** Compromissos objetivos listados no fim do modal (opcional). */
    topicos?: string[];
}

export const propostas: Proposta[] = [
    {
        id: 'crime-organizado',
        titulo: 'O crime organizado',
        conteudo: []
    },
    {
        id: 'ipva-abusivo',
        titulo: 'O IPVA abusivo',
        conteudo: []
    },
    {
        id: 'salarios-policia',
        titulo: 'Os salários baixos da polícia',
        conteudo: []
    },
    {
        id: 'abusos-judiciario',
        titulo: 'Os abusos do Judiciário',
        conteudo: []
    },
    {
        id: 'taxacao-blusinhas',
        titulo: 'A taxação das blusinhas',
        conteudo: []
    },
    {
        id: 'impunidade-penal',
        titulo: 'A impunidade penal',
        conteudo: []
    },
    {
        id: 'favelas',
        titulo: 'As favelas',
        conteudo: []
    },
    {
        id: 'supersalarios',
        titulo: 'Os supersalários',
        conteudo: []
    }
];
