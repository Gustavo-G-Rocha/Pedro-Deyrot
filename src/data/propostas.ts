// Propostas exibidas na pagina /propostas, na ordem do material de campanha.
// A ordem daqui e a ordem do grid (coluna 1 preta, 2 branca, 3 amarela).
//
// COMO PREENCHER O TEXTO DE CADA UMA:
// cada string de `conteudo` vira um paragrafo dentro do modal que abre ao
// clicar no titulo. Se `conteudo` ficar vazio, o modal mostra so o titulo e um
// aviso de "em breve". Os compromissos objetivos entram em `topicos`.

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
        id: 'territorio-faccao',
        titulo: 'Nenhum território controlado por facção',
        conteudo: [
            'Vamos reaver o que foi tomado do povo, destruir as facções, prender ou matar os líderes do crime e reestabelecer a bandeira do Brasil em todo o território nacional.'
        ]
    },
    {
        id: 'desfavelizacao-moradia-digna',
        titulo: 'Desfavelização e Moradia Digna',
        conteudo: [
            'Vamos transformar toda favela em bairro: saneamento, vias abertas e comércio local. Lei e ordem nas ruas e segurança para o povo.'
        ]
    },
    {
        id: 'mais-emprego-menos-bolsa-familia',
        titulo: 'Mais emprego, Menos Bolsa Família',
        conteudo: [
            'País rico não deixa seu povo dependente do governo. Metas locais de emprego, frentes de trabalho em cada município e complemento de renda para quem tiver trabalho formal.'
        ]
    },
    {
        id: 'comida-mais-barata',
        titulo: 'Comida mais barata no prato',
        conteudo: [
            'O Brasil alimenta o mundo, mas o brasileiro não enche o carrinho. Vamos zerar imposto sobre alimento, destravar estradas e portos e tirar a burocracia das costas do produtor.'
        ]
    },
    {
        id: 'fusao-de-municipios',
        titulo: 'Fusão de Municípios',
        conteudo: [
            'Vamos cortar municípios que não se sustentam e acabar com a classe política parasitária. Prefeitos terão metas: quem não cumprir ficará inelegível.'
        ]
    },
    {
        id: 'alfabetizacao-das-criancas',
        titulo: 'Alfabetização das Crianças',
        conteudo: [
            'Escola sem autoridade não alfabetiza. Vamos devolver o comando ao professor, tirar a ideologia da sala de aula e premiar quem entrega resultado.'
        ]
    }
];
