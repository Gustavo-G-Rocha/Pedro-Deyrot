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

// ---------------------------------------------------------------------------
// Privacidade (LGPD)
// ---------------------------------------------------------------------------

/**
 * Canal dedicado a pedidos sobre dados pessoais. Trocar por
 * privacidade@pedrodeyrot.com assim que a caixa existir: publicar um endereco
 * que ninguem le e pior do que publicar o que esta funcionando hoje.
 */
export const EMAIL_PRIVACIDADE = EMAIL_CONTATO;

/**
 * Nome do encarregado pelo tratamento de dados (DPO). A LGPD (art. 41, §1º)
 * manda publicar a identidade; enquanto estiver vazio a politica mostra so o
 * canal de contato. Preencher assim que a campanha indicar a pessoa.
 */
export const ENCARREGADO = '';

/** Prazo de eliminacao dos dados depois da prestacao de contas da campanha. */
export const PRAZO_RETENCAO = '180 dias';

/** Prazo para atender pedido de descadastro (Lei 9.504/1997, art. 57-G, §2º). */
export const PRAZO_DESCADASTRO = '48 horas';

/** Idade minima para se cadastrar: 16 anos, a idade do titulo de eleitor. */
export const IDADE_MINIMA = 16;

/** Versao da politica, gravada junto do consentimento de cada cadastro. */
export const VERSAO_POLITICA = '2026-09-30';

/** Data da ultima revisao, mostrada no topo da politica. */
export const POLITICA_ATUALIZADA_EM = '30 de setembro de 2026';

/**
 * Operadores que tocam nos dados do site. A LGPD (art. 9º, V e art. 33) exige
 * dizer quem sao e avisar quando o tratamento sai do Brasil.
 */
export const OPERADORES = [
    {
        nome: 'Railway Corporation',
        pais: 'Estados Unidos',
        papel: 'hospedagem do site e do banco de dados dos cadastros'
    },
    {
        nome: 'Cloudflare, Inc.',
        pais: 'Estados Unidos',
        papel: 'rede de entrega do site, proteção contra ataques e medição de audiência'
    },
    {
        nome: 'Google LLC',
        pais: 'Estados Unidos',
        papel: 'planilha de trabalho da campanha (Google Sheets) e e-mail de contato (Gmail)'
    },
    {
        nome: 'ViaCEP',
        pais: 'Brasil',
        papel: 'consulta do CEP digitado no formulário, para preencher cidade e bairro'
    },
    {
        nome: 'flagcdn.com',
        pais: 'Estados Unidos',
        papel: 'imagens das bandeiras no seletor de país do formulário'
    }
];
