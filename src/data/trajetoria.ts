// Linha do tempo do Pedro, no mesmo formato da secao "Trajetoria" do site do
// Renan. A ideia e deixar obvio que os dois vem da mesma historia: 2014, MBL,
// impeachment, Missao.
//
// Para editar, mexa so aqui: a secao na Home le esta lista.

export interface MarcoTrajetoria {
    ano: string;
    titulo: string;
    texto: string;
    /** Marcos principais: ganham a bolinha dourada na linha do tempo. */
    destaque?: boolean;
}

export const trajetoria: MarcoTrajetoria[] = [
    {
        ano: '2005',
        titulo: 'Bonde do Rolê',
        texto:
            'Funda em Curitiba a banda que levaria o Paraná aos palcos do mundo inteiro. Aprende cedo que ideia boa sem trabalho não sai do quarto.'
    },
    {
        ano: '2014',
        titulo: 'Fundação do MBL',
        texto:
            'Cofunda o Movimento Brasil Livre ao lado de Renan Santos e Kim Kataguiri — o maior movimento político jovem da história do país.',
        destaque: true
    },
    {
        ano: '2016',
        titulo: 'Impeachment',
        texto:
            'Está entre os principais organizadores das manifestações que levaram milhões às ruas e derrubaram o governo Dilma.',
        destaque: true
    },
    {
        ano: '2023',
        titulo: 'A operação cultural',
        texto:
            'Ajuda a construir o que a direita brasileira não tinha: imprensa, formação e uma intelectualidade própria, com o pé no Paraná.'
    },
    {
        ano: '2025',
        titulo: 'Partido Missão no Paraná',
        texto:
            'O TSE aprova o registro do Partido Missão, com o número 14. Pedro assume a vice-presidência da legenda no Paraná.',
        destaque: true
    },
    {
        ano: '2026',
        titulo: 'Candidato pelo 1414',
        texto:
            'Disputa uma vaga de deputado federal para dar ao Renan a bancada que um governo da Missão vai precisar para governar.',
        destaque: true
    }
];
