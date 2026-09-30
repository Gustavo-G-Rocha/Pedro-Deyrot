import AvisoEleitoral from '../components/AvisoEleitoral';
import {
    CNPJ_CAMPANHA,
    EMAIL_PRIVACIDADE,
    ENCARREGADO,
    IDADE_MINIMA,
    NOME_COMPLETO,
    NOME_URNA,
    NUMERO_CANDIDATO,
    OPERADORES,
    POLITICA_ATUALIZADA_EM,
    PRAZO_DESCADASTRO,
    PRAZO_RETENCAO
} from '../config/campanha';

/** Link de e-mail repetido varias vezes ao longo da politica. */
function EmailPrivacidade() {
    return (
        <a
            href={`mailto:${EMAIL_PRIVACIDADE}`}
            className="text-[#D4A017] hover:text-[#ca8a04] underline font-semibold"
        >
            {EMAIL_PRIVACIDADE}
        </a>
    );
}

export default function LGPD() {
    return (
        <div className="min-h-screen bg-[#111111]">
            {/* Header */}
            <header className="bg-[#111111]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-black text-white">
                        Política de <span className="text-[#D4A017]">Privacidade</span>
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Última atualização: {POLITICA_ATUALIZADA_EM}
                    </p>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-[#2a2a2a] rounded-2xl shadow-2xl p-8 md:p-12 border border-white/10">
                    <div className="prose prose-invert prose-zinc max-w-none">

                        {/* Resumo: a lei pede linguagem clara, e quase ninguem le a
                            politica inteira. O resumo nao substitui o texto abaixo. */}
                        <div className="mb-10 rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/5 p-6">
                            <h2 className="text-lg font-black uppercase tracking-wider text-[#D4A017] mt-0 mb-4">
                                O essencial, em poucas linhas
                            </h2>
                            <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-0">
                                <li>Só coletamos dados de quem preenche um formulário aqui no site.</li>
                                <li>
                                    Apoiar uma campanha revela opinião política, que a lei trata como
                                    dado sensível. Por isso o cadastro depende de consentimento
                                    específico, dado em caixas separadas e nunca pré-marcadas.
                                </li>
                                <li>O cadastro é para quem tem {IDADE_MINIMA} anos ou mais.</li>
                                <li>Não vendemos, não alugamos e não cedemos seus dados a outras campanhas ou partidos.</li>
                                <li>
                                    Você pode sair da lista quando quiser, e o pedido é atendido em até{' '}
                                    {PRAZO_DESCADASTRO}: escreva para <EmailPrivacidade />.
                                </li>
                            </ul>
                        </div>

                        <p className="text-zinc-300 leading-relaxed mb-8">
                            Esta política explica como a campanha {NOME_URNA} {NUMERO_CANDIDATO} trata
                            os dados pessoais coletados neste site, em conformidade com a Lei nº
                            13.709/2018 (Lei Geral de Proteção de Dados) e com a legislação eleitoral.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Quem é o responsável pelos seus dados</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            O controlador dos dados pessoais é {NOME_COMPLETO} ({NOME_URNA}), candidato
                            a Deputado Federal, por meio da campanha eleitoral inscrita no CNPJ nº{' '}
                            {CNPJ_CAMPANHA} junto à Justiça Eleitoral.
                        </p>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            {ENCARREGADO
                                ? `O encarregado pelo tratamento de dados pessoais é ${ENCARREGADO}, e pode ser contatado pelo e-mail `
                                : 'O canal de atendimento do encarregado pelo tratamento de dados pessoais é o e-mail '}
                            <EmailPrivacidade />. É por ele que passam pedidos de acesso, correção,
                            exclusão, descadastro e qualquer dúvida sobre esta política.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Quais dados são coletados</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            Você fornece os dados diretamente, ao preencher um formulário. Nenhum
                            cadastro é obrigatório para navegar pelo site.
                        </p>
                        <p className="text-zinc-300 leading-relaxed mb-2 font-semibold">
                            No cadastro de voluntário e na inscrição em eventos:
                        </p>
                        <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-6 ml-4">
                            <li>Nome completo;</li>
                            <li>WhatsApp (com o código do país);</li>
                            <li>E-mail;</li>
                            <li>CEP, cidade, estado e bairro;</li>
                            <li>Especialidade ou disponibilidade que você quiser informar;</li>
                            <li>O registro do seu consentimento: data, hora e versão desta política.</li>
                        </ul>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Também são registrados dados técnicos de funcionamento, como endereço IP e
                            informações do navegador, usados para segurança, proteção contra abuso e
                            medição de audiência do site.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Opinião política é dado sensível</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            Ao se cadastrar como voluntário ou apoiador de uma campanha, você revela
                            uma convicção política. A LGPD classifica esse tipo de informação como dado
                            pessoal sensível (art. 5º, II), e para ele a única base legal aplicável
                            aqui é o seu consentimento específico e destacado (art. 11, I).
                        </p>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Por isso o formulário separa as autorizações: uma para o tratamento dos
                            dados necessário à organização do voluntariado, que é obrigatória para
                            concluir o cadastro, e outra, opcional, para receber mensagens da campanha.
                            Nenhuma caixa vem marcada, e recusar a segunda não impede o cadastro.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Idade mínima</h2>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Os formulários deste site são destinados a pessoas com {IDADE_MINIMA} anos
                            ou mais, idade em que se pode tirar o título de eleitor. No cadastro você
                            declara ter essa idade. Se identificarmos o cadastro de alguém com menos de{' '}
                            {IDADE_MINIMA} anos, os dados são eliminados; se isso acontecer, avise pelo
                            e-mail <EmailPrivacidade /> que apagamos o registro.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Para que os dados são usados</h2>
                        <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-6 ml-4">
                            <li>Organizar o trabalho voluntário e distribuir as tarefas por cidade e bairro;</li>
                            <li>Confirmar inscrições e presença em eventos da campanha;</li>
                            <li>Responder ao que você pedir por esses canais;</li>
                            <li>
                                Enviar mensagens da campanha por WhatsApp e e-mail, apenas para quem
                                autorizou esse envio;
                            </li>
                            <li>Cumprir obrigações legais e prestar contas à Justiça Eleitoral.</li>
                        </ul>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Os dados não são usados para nenhuma outra finalidade. Se em algum momento
                            a campanha precisar usá-los de outro modo, você será avisado antes e poderá
                            revogar o consentimento (art. 9º, §2º).
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Mensagens e descadastro</h2>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            A campanha só envia mensagens para quem autorizou, não contrata disparo em
                            massa e não compra listas. Toda mensagem traz como sair da lista, e o
                            descadastro é atendido em até {PRAZO_DESCADASTRO}, como manda a legislação
                            eleitoral (Lei nº 9.504/1997, art. 57-G). Você também pode pedir o
                            descadastro a qualquer momento pelo e-mail <EmailPrivacidade />.
                        </p>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            O grupo e a comunidade de WhatsApp da campanha funcionam dentro do
                            aplicativo da Meta, que é controladora independente desses dados e aplica a
                            própria política de privacidade. Atenção: em um grupo comum de WhatsApp,
                            todos os participantes enxergam o número de telefone uns dos outros. Se
                            preferir não expor o seu, acompanhe a campanha pelos canais de avisos, em
                            que só a administração publica.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Com quem os dados são compartilhados</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            Seus dados não são vendidos, alugados nem cedidos a outros candidatos,
                            campanhas, partidos ou empresas. A legislação eleitoral inclusive proíbe a
                            venda de cadastro de eleitores (Lei nº 9.504/1997, art. 57-E).
                        </p>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            O acesso fica restrito à equipe da campanha e aos operadores contratados
                            para fazer o site funcionar, que tratam os dados apenas sob instrução do
                            controlador:
                        </p>
                        <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-6 ml-4">
                            {OPERADORES.map((op) => (
                                <li key={op.nome}>
                                    <span className="font-semibold text-white">{op.nome}</span> ({op.pais}):{' '}
                                    {op.papel};
                                </li>
                            ))}
                        </ul>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Parte desses fornecedores está sediada fora do Brasil, o que caracteriza
                            transferência internacional de dados (LGPD, art. 33). Ela ocorre para a
                            execução do próprio serviço que você solicitou e sob cláusulas contratuais
                            de proteção dos fornecedores. Dados também podem ser fornecidos à Justiça
                            Eleitoral, a autoridades ou ao Poder Judiciário quando houver determinação
                            legal.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Por quanto tempo os dados são guardados</h2>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Os dados coletados neste site são eliminados em até {PRAZO_RETENCAO} após a
                            prestação de contas da campanha à Justiça Eleitoral. Antes disso, você pode
                            pedir a exclusão quando quiser, e o pedido é atendido. A campanha mantém
                            apenas o que for exigido por obrigação legal ou regulatória, ou para o
                            exercício de direitos em processo judicial, administrativo ou arbitral, e
                            só pelo tempo dessa exigência.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Segurança</h2>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Os dados trafegam por conexão criptografada e ficam em banco de dados com
                            acesso restrito e autenticado. A campanha adota medidas para prevenir
                            acessos não autorizados e situações de perda, alteração ou divulgação
                            indevida. Em caso de incidente de segurança relevante, os titulares
                            afetados e a Autoridade Nacional de Proteção de Dados são comunicados, como
                            determina o art. 48 da LGPD.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Os seus direitos</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">
                            O art. 18 da LGPD garante a você, a qualquer momento e sem custo, os
                            direitos abaixo. Basta escrever para <EmailPrivacidade /> com o pedido:
                        </p>
                        <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-6 ml-4">
                            <li>Confirmar se tratamos dados seus e acessar esses dados;</li>
                            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                            <li>Pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados fora da lei;</li>
                            <li>Pedir a portabilidade dos dados a outro fornecedor, nos termos da regulamentação da ANPD;</li>
                            <li>Pedir a eliminação dos dados tratados com base no seu consentimento;</li>
                            <li>Saber com quais entidades públicas e privadas os seus dados foram compartilhados;</li>
                            <li>
                                Ser informado sobre a possibilidade de não fornecer consentimento e sobre
                                as consequências disso: recusar o consentimento obrigatório significa não
                                concluir o cadastro, e recusar o opcional significa apenas não receber
                                mensagens, sem nenhum outro prejuízo;
                            </li>
                            <li>Revogar o consentimento a qualquer momento, o que interrompe o tratamento dali em diante;</li>
                            <li>Opor-se a tratamento feito sem o seu consentimento, quando houver descumprimento da lei.</li>
                        </ul>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Se a resposta da campanha não resolver, você pode apresentar reclamação à
                            Autoridade Nacional de Proteção de Dados (ANPD), pelos canais oficiais em{' '}
                            <a
                                href="https://www.gov.br/anpd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#D4A017] hover:text-[#ca8a04] underline font-semibold"
                            >
                                gov.br/anpd
                            </a>
                            .
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Cookies e medição de audiência</h2>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            O site usa apenas o necessário para funcionar e para medir, de forma
                            agregada, quantas pessoas o visitam, por meio da Cloudflare. Não há
                            rastreamento publicitário nem perfis de comportamento individual. Você pode
                            bloquear cookies nas configurações do navegador sem perder o acesso ao
                            conteúdo.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Alterações nesta política</h2>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Esta política pode ser atualizada. A data da última revisão fica no topo da
                            página, e a versão publicada substitui as anteriores. Quando a mudança
                            alterar a finalidade do tratamento ou reduzir os seus direitos, os
                            titulares cadastrados são comunicados antes, e você pode revogar o
                            consentimento se não concordar (LGPD, art. 9º, §2º).
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Contato</h2>
                        <p className="text-zinc-300 leading-relaxed mb-6">
                            Qualquer dúvida, pedido ou reclamação sobre dados pessoais:{' '}
                            <EmailPrivacidade />. A campanha responde no prazo da LGPD e, para pedidos
                            de descadastro, em até {PRAZO_DESCADASTRO}.
                        </p>
                    </div>

                    {/* Identificacao exigida pela legislacao eleitoral: esta pagina roda
                        fora do Layout, entao nao herda o rodape do site. */}
                    <AvisoEleitoral className="mt-12 border-t border-white/10 pt-8" />

                    {/* Botão de voltar/fechar */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <button
                            onClick={() => window.close()}
                            className="w-full sm:w-auto bg-[#D4A017] text-black hover:bg-[#ca8a04] active:scale-[0.98] transition-all py-3 px-8 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-yellow-500/20"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
