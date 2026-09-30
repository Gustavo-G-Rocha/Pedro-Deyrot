// Dados oficiais da campanha, usados na identificacao que a legislacao
// eleitoral exige na propaganda (Lei 9.504/1997, art. 57-B e 57-C, e
// Res. TSE 23.610/2019). Fica tudo num lugar so: mudou aqui, muda no rodape,
// no aviso das paginas de evento e na politica de privacidade.

/** Nome de urna, como o eleitor ve na cabine. */
export const NOME_URNA = 'Pedro Deyrot';

/** Nome civil completo, usado na identificacao legal e na LGPD. */
export const NOME_COMPLETO = 'Pedro Augusto Ferreira Deiro';

/** Numero do candidato na urna. */
export const NUMERO_CANDIDATO = '1414';

export const CARGO = 'Deputado Federal';
export const UF = 'Paraná';

/** Partido pelo qual concorre e o numero dele na urna. */
export const PARTIDO = 'Partido Missão';
export const NUMERO_PARTIDO = '14';

/** CNPJ da campanha, aberto na Justica Eleitoral para as Eleicoes 2026. */
export const CNPJ_CAMPANHA = '68.578.138/0001-06';

export const ANO_ELEICAO = '2026';

/** Canal de contato da campanha, o mesmo da politica de privacidade. */
export const EMAIL_CONTATO = 'pedraotomates@gmail.com';

/** Frase de identificacao do candidato, repetida em varios lugares. */
export const IDENTIFICACAO_CANDIDATO =
    `${NOME_COMPLETO} (${NOME_URNA}), candidato a ${CARGO} pelo ${UF}, ` +
    `${PARTIDO} (${NUMERO_PARTIDO}), número ${NUMERO_CANDIDATO}`;

/** Quem responde pelo conteudo do site, com o CNPJ da campanha. */
export const RESPONSAVEL_CONTEUDO =
    `Campanha ${NOME_URNA} ${NUMERO_CANDIDATO}, CNPJ ${CNPJ_CAMPANHA}`;
