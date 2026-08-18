// Propostas exibidas na pagina /propostas.
// Para editar o site basta mexer nesta lista: a ordem daqui e a ordem do grid
// (coluna 1 preta, coluna 2 branca, coluna 3 amarela).

export interface Proposta {
    id: string;
    titulo: string;
    resumo: string;
    /** Cada item vira um paragrafo dentro do modal. */
    conteudo: string[];
    /** Compromissos objetivos listados no fim do modal (opcional). */
    topicos?: string[];
}

export const propostas: Proposta[] = [
    {
        id: 'seguranca',
        titulo: 'Segurança Pública',
        resumo: 'Mais estrutura para quem protege o cidadão de bem.',
        conteudo: [
            'Quem trabalha e cria a família com honestidade precisa andar tranquilo na rua. Segurança não é favor, é dever do Estado.',
            'O compromisso é destinar emendas e apoiar projetos que deem estrutura real para as polícias, valorizem os profissionais da segurança e endureçam a lei contra o crime organizado.'
        ],
        topicos: [
            'Emendas para viaturas, coletes e equipamentos',
            'Apoio à valorização das forças de segurança',
            'Endurecimento das penas para crimes violentos',
            'Câmeras e monitoramento integrado nos municípios'
        ]
    },
    {
        id: 'saude',
        titulo: 'Saúde',
        resumo: 'Fila menor e atendimento perto de casa.',
        conteudo: [
            'Ninguém aguenta mais esperar meses por uma consulta ou por um exame simples. A saúde precisa funcionar onde a pessoa mora.',
            'Vamos brigar por recursos para os municípios ampliarem exames, cirurgias eletivas e atenção básica, com transparência total sobre onde cada centavo foi aplicado.'
        ],
        topicos: [
            'Emendas para mutirões de exames e cirurgias eletivas',
            'Ampliação e reforma de unidades básicas de saúde',
            'Apoio ao transporte de pacientes em tratamento fora do domicílio',
            'Prestação de contas pública de cada emenda destinada'
        ]
    },
    {
        id: 'educacao',
        titulo: 'Educação',
        resumo: 'Escola com ordem, respeito e futuro profissional.',
        conteudo: [
            'Educação de verdade é a que prepara o jovem para a vida e para o trabalho, respeitando o papel da família.',
            'Defendemos o ensino técnico e profissionalizante, escolas seguras e o direito dos pais de acompanhar o que é ensinado aos seus filhos.'
        ],
        topicos: [
            'Expansão do ensino técnico e profissionalizante',
            'Programas de primeiro emprego para jovens',
            'Escolas com estrutura e segurança',
            'Transparência do conteúdo escolar para as famílias'
        ]
    },
    {
        id: 'emprego-renda',
        titulo: 'Emprego e Renda',
        resumo: 'Menos burocracia para quem gera trabalho.',
        conteudo: [
            'Quem gera emprego no Paraná é o pequeno comerciante, o autônomo e o microempreendedor, justamente quem mais sofre com imposto e burocracia.',
            'A bandeira é simplificar a vida de quem produz: menos papelada, crédito acessível e regras claras para o negócio crescer.'
        ],
        topicos: [
            'Simplificação de licenças e alvarás',
            'Defesa do Simples Nacional e do MEI',
            'Crédito acessível para pequenos negócios',
            'Qualificação profissional gratuita'
        ]
    },
    {
        id: 'agro',
        titulo: 'Agronegócio',
        resumo: 'Quem planta e produz não pode ser tratado como inimigo.',
        conteudo: [
            'O agro sustenta o Paraná e alimenta o Brasil. Produtor rural merece respeito, segurança jurídica e estrada boa para escoar a produção.',
            'Vamos atuar pela defesa da propriedade privada, contra o excesso de regulação e por investimento em estradas rurais e armazenagem.'
        ],
        topicos: [
            'Defesa da propriedade privada e segurança no campo',
            'Recuperação de estradas rurais',
            'Crédito e seguro agrícola para o pequeno produtor',
            'Menos entraves burocráticos para quem produz'
        ]
    },
    {
        id: 'infraestrutura',
        titulo: 'Infraestrutura e Mobilidade',
        resumo: 'Estrada boa, pedágio justo, obra que sai do papel.',
        conteudo: [
            'O paranaense paga caro e continua vendo buraco na pista. Isso precisa mudar.',
            'Vamos cobrar contrato de pedágio com contrapartida real, fiscalizar as obras federais no estado e destinar recursos para a mobilidade nas cidades.'
        ],
        topicos: [
            'Fiscalização dos contratos de pedágio',
            'Duplicação e recuperação de rodovias federais no Paraná',
            'Investimento em mobilidade urbana',
            'Acompanhamento público do andamento das obras'
        ]
    },
    {
        id: 'transparencia',
        titulo: 'Transparência e Combate à Corrupção',
        resumo: 'Dinheiro público na conta de quem paga: você.',
        conteudo: [
            'Combater a corrupção não é discurso de campanha, é rotina de trabalho. Foi assim que esta caminhada começou: denunciando o que estava errado.',
            'O compromisso é publicar cada gasto, cada emenda e cada voto, e continuar denunciando desvio de dinheiro público doa a quem doer.'
        ],
        topicos: [
            'Publicação aberta de todas as emendas e votos',
            'Apoio a projetos de endurecimento contra a corrupção',
            'Fiscalização permanente de contratos públicos',
            'Canal direto para o cidadão denunciar irregularidades'
        ]
    },
    {
        id: 'familia',
        titulo: 'Família e Assistência Social',
        resumo: 'Apoio a quem cuida de quem mais precisa.',
        conteudo: [
            'A família é a base da sociedade e precisa de apoio de verdade, não de discurso.',
            'Defendemos recursos para as entidades que atendem crianças, idosos e pessoas com deficiência, e políticas que ajudem o pai e a mãe que sustentam a casa.'
        ],
        topicos: [
            'Emendas para APAEs, asilos e entidades assistenciais',
            'Apoio a políticas de proteção à criança e ao idoso',
            'Ampliação do atendimento a pessoas com deficiência',
            'Programas de acolhimento e recuperação de dependentes químicos'
        ]
    },
    {
        id: 'turismo',
        titulo: 'Turismo e Cultura',
        resumo: 'O Paraná gerando renda com o que tem de melhor.',
        conteudo: [
            'O Paraná tem litoral, serra, cataratas e uma cultura forte no interior. Isso é emprego e renda esperando para ser destravado.',
            'Vamos buscar recursos federais para sinalização, estrutura e divulgação dos destinos turísticos do estado, valorizando o comércio e o artesanato local.'
        ],
        topicos: [
            'Recursos federais para estrutura turística',
            'Apoio ao artesanato e à produção cultural local',
            'Calendário de eventos com apoio institucional',
            'Valorização do comércio e do turismo do interior'
        ]
    }
];
