import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkDenunciaAccess, clearDenunciaAccess } from '@/src/utils/denunciaAccess';

export default function DenunciaArquivos() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAccess = async () => {
            const { hasAccess, userData } = await checkDenunciaAccess();

            if (hasAccess && userData) {
                setHasAccess(true);
                setUserName(userData.nome || 'Visitante');
                setIsLoading(false);
            } else {
                // Redirecionar para o formulário após 3 segundos
                setTimeout(() => {
                    navigate('/safadao');
                }, 3000);
            }
        };

        verifyAccess();
    }, [navigate]);

    if (!hasAccess) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url('/safadao@2x.png')`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '200px auto',
                        backgroundPosition: 'top left',
                        opacity: 0.25
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md bg-[#242424]/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10 text-center"
                >
                    <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-white mb-3">Acesso Negado</h1>
                    <p className="text-zinc-400 mb-6">
                        Você precisa preencher o formulário antes de acessar os arquivos.
                    </p>
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Redirecionando para o formulário...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-4 lg:p-8 overflow-hidden bg-black">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('/safadao@2x.png')`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px auto',
                    backgroundPosition: 'top left',
                    opacity: 0.25
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#242424]/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-12 border border-white/20 mb-8"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-white/10">
                        <div>
                            <p className="text-zinc-400 text-sm mb-2">Bem-vindo(a), <span className="text-[#eab308] font-semibold">{userName}</span></p>
                        </div>
                        <button
                            onClick={() => {
                                clearDenunciaAccess();
                                navigate('/');
                            }}
                            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                            Sair
                        </button>
                    </div>

                    {/* Aviso */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3 mb-8">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-zinc-300">
                            <p className="font-semibold text-yellow-400 mb-1">Documento de Acesso Público</p>
                            <p>Este dossiê contém exclusivamente fatos verificáveis extraídos de documentos públicos. Não constitui acusação, opinião ou conclusão jurídica. Fontes: Receita Federal, TCE-AM, tribunais estaduais e plataforma DirectData.</p>
                        </div>
                    </div>

                    {/* Título da Denúncia */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            DOSSIÊ DE FATOS DOCUMENTADOS
                        </h1>
                        <p className="text-zinc-400 text-lg mb-4">
                            Estrutura Societária do Grupo WS e Contratos Públicos
                        </p>
                        <div className="inline-block bg-white/10 rounded-lg px-6 py-3 border border-white/20">
                            <p className="text-sm text-zinc-300 font-semibold">
                                ARTISTA: WESLEY OLIVEIRA DA SILVA | WESLEY SAFADÃO
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                                Data de levantamento: 28 de abril de 2026
                            </p>
                        </div>
                    </div>

                    {/* Conteúdo da Denúncia */}
                    <div className="prose prose-invert max-w-none space-y-8">

                        {/* Seção 1: Natureza do Documento */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">1</span>
                                Natureza do Documento
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <p>
                                    Este dossiê reúne exclusivamente <strong className="text-white">fatos verificáveis extraídos de documentos públicos</strong>.
                                </p>
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <p className="text-red-300 italic">
                                        Nenhuma afirmação neste documento constitui acusação, opinião ou conclusão jurídica.
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 mt-4">
                                    <p className="text-sm text-zinc-400 mb-2"><strong>Fontes primárias:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Receita Federal do Brasil</li>
                                        <li>Diário Oficial do TCE-AM</li>
                                        <li>TJMA, TJBA, TJPB, TRT-7</li>
                                        <li>Contrato Público PMV 161/2023</li>
                                        <li>Plataforma DirectData (consultada em 28/04/2026)</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.section>

                        {/* Seção 2: Identificação e Estrutura Societária */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">2</span>
                                Identificação e Estrutura Societária
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h3 className="font-bold text-white mb-3">🎤 Identificação do Artista</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-zinc-400">Nome Civil:</span> <strong className="text-white">Wesley Oliveira da Silva</strong></div>
                                        <div><span className="text-zinc-400">Nome Artístico:</span> <strong className="text-white">Wesley Safadão</strong></div>
                                        <div><span className="text-zinc-400">Naturalidade:</span> Fortaleza, Ceará</div>
                                        <div><span className="text-zinc-400">Atividade:</span> Artista musical / cantor de forró e axé</div>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-blue-300 mb-3">🏢 Empresa Pessoal do Artista - DYW Participações Ltda</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div><span className="text-zinc-400">Razão Social:</span> <strong className="text-white">DYW Participações Ltda</strong></div>
                                            <div><span className="text-zinc-400">CNPJ:</span> 29.409.339/0001-28</div>
                                            <div><span className="text-zinc-400">Data de Fundação:</span> 11/01/2018</div>
                                            <div><span className="text-zinc-400">Tributação:</span> Lucro Presumido</div>
                                            <div><span className="text-zinc-400">Faturamento Declarado:</span> <strong className="text-green-300">R$ 1.273.086,39</strong></div>
                                            <div><span className="text-zinc-400">CNAE Principal:</span> 6463-8/00</div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <p className="text-xs text-zinc-400 mb-1">
                                                <strong className="text-white">Endereço:</strong> Rua Hércules, 64, Itaoca, Fortaleza-CE, CEP 60740-370
                                            </p>
                                            <p className="text-xs text-zinc-400 mb-1">
                                                <strong className="text-white">Sócio Administrador (fundação):</strong> Wesley Oliveira da Silva (desde 11/01/2018)
                                            </p>
                                            <p className="text-xs text-zinc-400 mb-1">
                                                <strong className="text-white">Administradora (inclusão posterior):</strong> Thyane Dantas de Oliveira (esposa) — desde 30/09/2025
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                <strong className="text-white">E-mail registrado:</strong> juridico@wsparticipacoes.com.br
                                            </p>
                                        </div>
                                        <div className="bg-blue-500/10 rounded p-2 mt-3">
                                            <p className="text-xs text-blue-200">
                                                ℹ️ <strong>CNAE 6463-8/00:</strong> Outras sociedades de participação, exceto holdings
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-white mb-3">🏢 Holding Central - GRUPO WS</h3>
                                    <p className="text-sm mb-3"><strong>Oliveira Participações Ltda</strong> (Nome Fantasia: GRUPO WS)</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-zinc-400">CNPJ:</span> 46.955.499/0001-91</div>
                                        <div><span className="text-zinc-400">Fundação:</span> 29/06/2022</div>
                                        <div><span className="text-zinc-400">CNAE Principal:</span> 6463-8/00</div>
                                        <div><span className="text-zinc-400">Tributação:</span> Lucro Presumido</div>
                                        <div><span className="text-zinc-400">Faturamento Presumido:</span> R$ 2.021.725,24</div>
                                        <div><span className="text-zinc-400">Telefone:</span> (85) 98124-4111</div>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-3">
                                        <strong>Endereço:</strong> Rua 1º de Janeiro, 561, Sala G, Itaperi, Fortaleza-CE, CEP 60714-180
                                    </p>
                                    <p className="text-xs text-zinc-400">
                                        <strong>E-mail registrado:</strong> dayane@wsparticipacoes.com.br
                                    </p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-white mb-3">📋 Quadro de Sócios da Oliveira Participações Ltda</h3>
                                    <p className="text-xs text-zinc-400 mb-3">
                                        Conforme registro na Receita Federal, os sócios da Oliveira Participações Ltda na data da consulta (28/04/2026):
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-white/10">
                                                <tr>
                                                    <th className="text-left p-2 text-zinc-300">Sócio / Empresa</th>
                                                    <th className="text-left p-2 text-zinc-300">Tipo de Vínculo</th>
                                                    <th className="text-left p-2 text-zinc-300">Data de Entrada</th>
                                                    <th className="text-left p-2 text-zinc-300">Observação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-zinc-400">
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">DARO Participações Ltda</td>
                                                    <td className="p-2">Sócio</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Diego Anderson</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">DYW Participações Ltda</td>
                                                    <td className="p-2">Sócio</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Wesley Safadão</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">Believe Participações Ltda</td>
                                                    <td className="p-2">Sócio</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Yvens Watila</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">Wellington S.O. Participações Ltda</td>
                                                    <td className="p-2">Sócio</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Irmão</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">Francisco Alves de Oliveira Participações</td>
                                                    <td className="p-2">Sócio</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Pai</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">Maria Valmiria S. Oliveira Participações</td>
                                                    <td className="p-2">Sócio</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Mãe</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2">Yvens Watila Oliveira da Silva</td>
                                                    <td className="p-2">Administrador</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Irmão / PF</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-purple-300 mb-3">📅 Holdings Familiares — Datas de Fundação</h3>
                                    <p className="text-xs text-zinc-300 mb-3">
                                        As seguintes empresas de participações foram registradas na Receita Federal, todas com endereço
                                        na Rua 1º de Janeiro, 561, Sala G, Itaperi, Fortaleza-CE ou endereço associado ao mesmo complexo.
                                        As datas de fundação são conforme comprovantes de inscrição da Receita Federal:
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-white/10">
                                                <tr>
                                                    <th className="text-left p-2 text-zinc-300">Razão Social</th>
                                                    <th className="text-left p-2 text-zinc-300">Data Fundação</th>
                                                    <th className="text-left p-2 text-zinc-300">Titular</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-zinc-400">
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">Wellington S.O. Participações Ltda</td>
                                                    <td className="p-2">07/06/2022</td>
                                                    <td className="p-2">Wellington Silva de Oliveira (irmão)</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">Francisco Alves de Oliveira Part. Ltda</td>
                                                    <td className="p-2">07/06/2022</td>
                                                    <td className="p-2">Francisco Alves de Oliveira (pai)</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">Maria Valmiria S. Oliveira Part. Ltda</td>
                                                    <td className="p-2">07/06/2022</td>
                                                    <td className="p-2">Maria Valmiria S. de Oliveira (mãe)</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-2">DARO Participações Ltda</td>
                                                    <td className="p-2">09/06/2022</td>
                                                    <td className="p-2">Diego Anderson R. de Oliveira</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2">Oliveira Participações Ltda (Grupo WS)</td>
                                                    <td className="p-2">29/06/2022</td>
                                                    <td className="p-2">Holding central do grupo</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-purple-500/20 rounded p-3 mt-4">
                                        <p className="text-xs text-purple-200">
                                            <strong>OBSERVAÇÃO FACTUAL:</strong> As empresas Wellington S.O. Participações, Francisco Alves de Oliveira
                                            Participações e Maria Valmiria S. Oliveira Participações registram como data de entrada na Oliveira
                                            Participações o mesmo dia de sua fundação (29/06/2022), indicando que foram constituídas para
                                            ingressar diretamente na holding central.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-yellow-400 mb-2">👥 Sócios da Holding Central</h3>
                                    <ul className="text-sm space-y-1">
                                        <li>• <strong>DYW Participações Ltda</strong> (Wesley Safadão)</li>
                                        <li>• <strong>Believe Participações Ltda</strong> (Yvens Watila - irmão)</li>
                                        <li>• <strong>DARO Participações Ltda</strong> (Diego Anderson)</li>
                                        <li>• <strong>Wellington S.O. Participações</strong> (Wellington - irmão)</li>
                                        <li>• <strong>Francisco Alves de Oliveira Part.</strong> (Pai)</li>
                                        <li>• <strong>Maria Valmiria S. Oliveira Part.</strong> (Mãe)</li>
                                    </ul>
                                    <p className="text-xs text-yellow-400 mt-3 italic">
                                        ⚠️ As holdings familiares foram criadas em junho/2022, apenas 23 dias antes da criação do Grupo WS.
                                    </p>
                                </div>
                            </div>
                        </motion.section>

                        {/* Seção 3: Empresas Operacionais e Contratos Públicos */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">3</span>
                                Empresas Operacionais e Contratos Públicos
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <p className="text-sm">
                                    <strong className="text-white">Empresas do grupo que figuram como contratadas em contratos públicos de shows ou como rés em processos judiciais de inadimplemento.</strong>
                                    Os faturamentos abaixo foram declarados à Receita Federal e estão registrados nos respectivos dossiês societários, página 5 de cada documento.
                                </p>

                                <div className="grid gap-3 mt-4">
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">Zade Shows Grav. e Ed. Musicais Ltda</h3>
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">R$ 360.000,00</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">CNPJ: 30.244.228/0001-98 | Fundada: 19/04/2018</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">OK Producoes e Rep. Artisticas Ltda</h3>
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">R$ 360.000,00</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">CNPJ: 36.623.504/0001-05 | Fundada: 10/03/2020</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">Musica Viva Ltda</h3>
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">R$ 340.929,60</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">CNPJ: 35.359.387/0001-51 | Fundada: 30/10/2019</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">Virtual Ticket Ltda</h3>
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">R$ 360.000,00</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">CNPJ: 27.956.430/0001-38 | Fundada: Não consta</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">Vitor Vaqueiro Shows e Eventos Ltda</h3>
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">R$ 360.000,00</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">CNPJ: 42.972.590/0001-64 | Fundada: Não consta</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">Raphaela Santos Producoes Ltda</h3>
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">R$ 360.001,00</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">CNPJ: Não consta no dossiê | Fundada: Não consta</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">Camarote Shows e Eventos Ltda</h3>
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">R$ 270k-R$ 360k</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">CNPJ: 38.149.318/0001-01 | Fundada: 19/08/2020</p>
                                    </div>
                                </div>

                                <div className="bg-white/10 rounded-lg p-3 mt-4">
                                    <p className="text-xs text-zinc-400">
                                        <strong className="text-white">FONTE:</strong> Cada valor de faturamento presumido declarado foi extraído do campo
                                        'Faturamento Presumido' da página 5 do respectivo dossiê societário, consultado na plataforma DirectData em 28/04/2026.
                                        Os dados da Receita Federal são de consulta pública.
                                    </p>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
                                    <h3 className="font-bold text-red-300 mb-3">📄 Contratos Públicos Documentados</h3>

                                    <div className="space-y-4">
                                        {/* Contrato PMV 161/2023 - Vitória de Santo Antão */}
                                        <div className="bg-black/30 rounded p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-white text-base">Contrato PMV nº 161/2023 — Vitória de Santo Antão (PE)</h4>
                                                <span className="text-sm font-bold text-yellow-400">R$ 150.000,00</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                <p><span className="text-zinc-500">Número do contrato:</span> <span className="text-zinc-300">PMV 161/2023 (LICON nº 715/2023)</span></p>
                                                <p><span className="text-zinc-500">Contratante:</span> <span className="text-zinc-300">Prefeitura Municipal de Vitória de Santo Antão — PE</span></p>
                                                <p><span className="text-zinc-500">Contratada:</span> <span className="text-zinc-300">Zade Shows Gravações e Edições Musicais Ltda</span></p>
                                                <p><span className="text-zinc-500">CNPJ da Contratada:</span> <span className="text-zinc-300">30.244.228/0001-98</span></p>
                                                <p><span className="text-zinc-500">Signatário:</span> <span className="text-zinc-300">Diego Anderson Rocha de Oliveira (Administrador)</span></p>
                                                <p><span className="text-zinc-500">Objeto:</span> <span className="text-zinc-300">Contratação de show artístico</span></p>
                                                <p><span className="text-zinc-500">Modalidade:</span> <span className="text-zinc-300">Inexigibilidade de licitação nº 018/2023</span></p>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-2">
                                                FONTE: Contrato físico digitalizado — Arquivo: LICON_Contrato_715_2023_161_1276083.pdf — páginas 1 a 5
                                            </p>
                                        </div>

                                        {/* Contrato Tefé 2026 */}
                                        <div className="bg-black/30 rounded p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-white text-base">Contrato — Tefé (AM), 2026</h4>
                                                <span className="text-sm font-bold text-yellow-400">R$ 1.200.000,00</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                <p><span className="text-zinc-500">Contratante:</span> <span className="text-zinc-300">Prefeitura Municipal de Tefé — AM</span></p>
                                                <p><span className="text-zinc-500">Contratada:</span> <span className="text-zinc-300">WS Shows Ltda</span></p>
                                                <p><span className="text-zinc-500">Valor:</span> <span className="text-zinc-300">R$ 1.200.000,00</span></p>
                                                <p><span className="text-zinc-500">Data de realização:</span> <span className="text-zinc-300">1º de maio de 2026</span></p>
                                                <p className="md:col-span-2"><span className="text-zinc-500">Status:</span> <span className="text-red-300">Show realizado. Processo de fiscalização nº 14.122/2026 aberto no TCE-AM.</span></p>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-2">
                                                FONTE: Diário Oficial do TCE-AM — Edição nº 3766, de 15 de abril de 2026. Arquivo: Edicaoden_3766de15deAbrilde2026_1.pdf, páginas 1 a 5.
                                            </p>
                                        </div>

                                        {/* Demais Contratos no Amazonas */}
                                        <div className="bg-black/30 rounded p-4">
                                            <h4 className="font-bold text-white text-base mb-3">Demais Contratos no Estado do Amazonas — Fontes Jornalísticas e Processuais</h4>
                                            <p className="text-xs text-zinc-400 mb-3">
                                                Os contratos abaixo foram identificados por meio de combinação de registros em processos judiciais
                                                (Dossiê Camarote Shows — DirectData), notícias publicadas em veículos de imprensa regionais, e dados do TCE-AM.
                                                Não há cópia física dos contratos nos arquivos desta investigação para estes casos.
                                            </p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-white/10">
                                                        <tr>
                                                            <th className="text-left p-2 text-zinc-300">Município</th>
                                                            <th className="text-left p-2 text-zinc-300">Ano</th>
                                                            <th className="text-left p-2 text-zinc-300">Empresa</th>
                                                            <th className="text-left p-2 text-zinc-300">Valor</th>
                                                            <th className="text-left p-2 text-zinc-300">Status</th>
                                                            <th className="text-left p-2 text-zinc-300">Fonte</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-zinc-400">
                                                        <tr className="border-b border-white/5">
                                                            <td className="p-2">São Gabriel da Cachoeira-AM</td>
                                                            <td className="p-2">2019</td>
                                                            <td className="p-2">WS Shows</td>
                                                            <td className="p-2">R$ 250.000</td>
                                                            <td className="p-2">Realizado</td>
                                                            <td className="p-2">Portal EM TEMPO; TCE-AM</td>
                                                        </tr>
                                                        <tr className="border-b border-white/5">
                                                            <td className="p-2">Rio Preto da Eva-AM</td>
                                                            <td className="p-2">2022</td>
                                                            <td className="p-2">WS Shows</td>
                                                            <td className="p-2">R$ 650.000</td>
                                                            <td className="p-2">Realizado</td>
                                                            <td className="p-2">Dossiê Camarote; Imprensa local</td>
                                                        </tr>
                                                        <tr className="border-b border-white/5">
                                                            <td className="p-2">Autazes-AM</td>
                                                            <td className="p-2">2022</td>
                                                            <td className="p-2">WS Shows</td>
                                                            <td className="p-2">R$ 600.000</td>
                                                            <td className="p-2">Realizado</td>
                                                            <td className="p-2">Dossiê Camarote; TCE-AM recebeu denúncias</td>
                                                        </tr>
                                                        <tr className="border-b border-white/5">
                                                            <td className="p-2">Novo Airão-AM</td>
                                                            <td className="p-2">2022</td>
                                                            <td className="p-2">WS Shows</td>
                                                            <td className="p-2">R$ 700.000</td>
                                                            <td className="p-2">Realizado</td>
                                                            <td className="p-2">Dossiê Camarote; TCE suspendeu e revogou</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2">Tabatinga-AM</td>
                                                            <td className="p-2">2022</td>
                                                            <td className="p-2">WS Shows</td>
                                                            <td className="p-2">R$ 700.000</td>
                                                            <td className="p-2 text-yellow-300">SUSPENSO</td>
                                                            <td className="p-2">Processo TJ-AM 0600606-47.2022.8.04.7300</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-3">
                                                FONTE: As informações sobre os municípios amazonenses (exceto Tefé) foram identificadas por meio de:
                                                (a) Dossiê Camarote Shows e Eventos Ltda — DirectData, 28/04/2026; (b) Notícias publicadas pelos portais
                                                EM TEMPO (Manaus) e D24am.com em 2022; (c) Registros de processos judiciais nos respectivos tribunais.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Seção 4: Processos Judiciais */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">4</span>
                                Processos Judiciais Relevantes
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <h3 className="font-bold text-red-300 mb-3">⚖️ Municípios que Ingressaram com Ação por Inadimplemento</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="bg-black/30 rounded p-3">
                                            <p className="font-bold text-white">Município de Zé Doca - MA</p>
                                            <p className="text-xs text-zinc-400 mt-1">Processo: 08016116720248100063 (TJ-MA)</p>
                                            <p className="text-xs text-zinc-400">Valor: R$ 665.000 | Assunto: Rescisão e devolução</p>
                                        </div>
                                        <div className="bg-black/30 rounded p-3">
                                            <p className="font-bold text-white">Município de Aurelino Leal - BA</p>
                                            <p className="text-xs text-zinc-400 mt-1">Processo: 80027584220248050264 (TJ-BA)</p>
                                            <p className="text-xs text-zinc-400">Valor: R$ 250.000 | Assunto: Inadimplemento / perdas e danos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-yellow-300 mb-3">🎵 Execução Judicial - ECAD (Direitos Autorais)</h3>
                                    <div className="text-sm bg-black/30 rounded p-3">
                                        <p className="font-bold text-white">ECAD vs Camarote Shows e Eventos Ltda</p>
                                        <p className="text-xs text-zinc-400 mt-1">Processo: 08156901920248152001 (TJ-PB)</p>
                                        <p className="text-xs text-zinc-400">Valor: R$ 26.809 | Fase: <strong className="text-yellow-300">Cumprimento de sentença</strong></p>
                                        <p className="text-xs text-yellow-300 mt-2 italic">⚠️ ECAD já possui sentença favorável - execução forçada</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-white mb-3">👥 Processos Trabalhistas com 'Grupo Econômico'</h3>
                                    <p className="text-xs text-zinc-400 mb-3">Reconhecimento de responsabilidade solidária entre empresas:</p>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-center bg-black/30 rounded p-2">
                                            <span>TRT-7 (CE): Camarote + Zade Shows</span>
                                            <span className="text-yellow-400">R$ 89.456</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-black/30 rounded p-2">
                                            <span>TRT-7 (CE): Camarote + XT Entret.</span>
                                            <span className="text-yellow-400">R$ 46.450</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-black/30 rounded p-2">
                                            <span>TRT-21 (RN): Camarote Shows</span>
                                            <span className="text-yellow-400">R$ 46.450</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-red-300 mb-2">🚨 Ação Civil Pública - Ministério Público do Maranhão</h3>
                                    <div className="text-sm">
                                        <p className="text-white mb-2">Processo: 08024525120258100055 (TJ-MA)</p>
                                        <p className="text-xs text-zinc-400">Autor: <strong>MP do Estado do Maranhão</strong></p>
                                        <p className="text-xs text-zinc-400">Réus: Prefeitura de Turilândia-MA e Camarote Shows</p>
                                        <p className="text-xs text-zinc-400">Valor: <strong className="text-yellow-300">R$ 600.000</strong> | Ajuizado: Dezembro/2025</p>
                                    </div>
                                </div>

                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-orange-300 mb-3">⚠️ Wesley Oliveira da Silva como Réu Pessoalmente</h3>
                                    <p className="text-xs text-orange-200 mb-3">
                                        O CPF do artista (***.925.683-**) figura diretamente como parte ré nestes processos,
                                        não apenas como representante de empresa:
                                    </p>
                                    <div className="space-y-2 text-xs">
                                        <div className="bg-black/30 rounded p-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-white">TJ-BA (07/03/2023)</span>
                                                <span className="text-orange-300">R$ 20.445</span>
                                            </div>
                                            <p className="text-zinc-400">Co-réus: Camarote Shows, WS Shows, Os Barões da Pisadinha, Work Show</p>
                                        </div>
                                        <div className="bg-black/30 rounded p-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-white">TJ-BA (07/03/2023)</span>
                                                <span className="text-orange-300">R$ 20.755</span>
                                            </div>
                                            <p className="text-zinc-400">Co-réus: Camarote Shows, WS Shows</p>
                                        </div>
                                        <div className="bg-black/30 rounded p-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-white">TJ-BA (31/01/2023)</span>
                                                <span className="text-orange-300">R$ 21.340</span>
                                            </div>
                                            <p className="text-zinc-400">Co-réus: Camarote Shows, WS Shows</p>
                                        </div>
                                        <div className="bg-black/30 rounded p-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-white">TJ-RJ (29/09/2025)</span>
                                                <span className="text-orange-300">R$ 31.350</span>
                                            </div>
                                            <p className="text-zinc-400">Co-réus: Camarote Shows e SAF Botafogo S.A.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-purple-300 mb-2">💼 Processo de Direito Autoral - Alto Valor</h3>
                                    <div className="text-sm">
                                        <p className="text-white mb-2">Processo: 00282506220268250001 (TJ-SE)</p>
                                        <p className="text-xs text-zinc-400">Assunto: <strong>Crimes contra propriedade intelectual / direito autoral</strong></p>
                                        <p className="text-xs text-zinc-400">Réus: Camarote Shows, OK Produções</p>
                                        <p className="text-lg font-black text-purple-300 mt-2">Valor da causa: R$ 17.800.000,00</p>
                                        <p className="text-xs text-zinc-400 mt-1">Ajuizado: Abril de 2026 | Status: Em andamento</p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Seção 5: Investigações e Conclusão */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">5</span>
                                Investigações e Conclusão
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                                    <h3 className="font-bold text-orange-300 mb-3">📝 Investigação do TCE-AM - Tefé (2026)</h3>
                                    <div className="text-sm space-y-2">
                                        <p><strong className="text-white">Órgão:</strong> Tribunal de Contas do Estado do Amazonas</p>
                                        <p><strong className="text-white">Processo:</strong> 14.122/2026</p>
                                        <p><strong className="text-white">Publicação:</strong> Diário Oficial TCE-AM, Edição nº 3766 (15/04/2026)</p>
                                        <p><strong className="text-white">Objeto:</strong> Contrato Prefeitura de Tefé-AM e WS Shows Ltda</p>
                                        <p className="text-yellow-300 font-bold">Valor: R$ 1.200.000,00</p>
                                        <p className="text-xs text-orange-300 mt-2">
                                            ⚠️ Status: Processo de fiscalização aberto. TCE-AM solicitou informações à Prefeitura. Em andamento.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                                    <h3 className="font-bold text-blue-300 mb-3">🏛️ Emenda Parlamentar - São Gabriel da Cachoeira (2019)</h3>
                                    <div className="text-sm space-y-2">
                                        <p><strong className="text-white">Evento:</strong> 23º Festribal - Festival das Tribos Indígenas</p>
                                        <p><strong className="text-white">Valor:</strong> R$ 250.000,00</p>
                                        <p><strong className="text-white">Origem declarada:</strong> Emenda parlamentar do Dep. Estadual Sinésio Campos (PT-AM)</p>
                                        <p className="text-xs text-zinc-400 mt-2">
                                            MPC-AM solicitou suspensão. TCE-AM concedeu prazo de 5 dias para explicações. Show foi realizado.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4 mt-6">
                                    <h3 className="font-bold text-white mb-3">📂 Notas Metodológicas</h3>
                                    <div className="text-xs text-zinc-400 space-y-2">
                                        <p>
                                            <strong className="text-white">Metodologia:</strong> Todos os fatos registrados foram extraídos de:
                                        </p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Dossiês societários da plataforma DirectData (28/04/2026)</li>
                                            <li>Contrato público PMV 161/2023 digitalizado</li>
                                            <li>Diário Oficial do TCE-AM - Edição 3766 (15/04/2026)</li>
                                            <li>Notícias de imprensa regional (Portal EM TEMPO, D24am.com)</li>
                                        </ul>
                                        <p className="mt-3">
                                            <strong className="text-white">Limitações:</strong> Defesas ou contestações apresentadas pelas empresas não constam nos dossiês.
                                            Desfecho definitivo dos processos reflete status na data da consulta.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
                                    <h3 className="font-bold text-red-300 mb-2">⚠️ Declaração de Isenção</h3>
                                    <p className="text-sm text-red-200 leading-relaxed">
                                        Este documento <strong>NÃO formula acusações</strong>, NÃO atribui responsabilidade penal, civil ou
                                        administrativa a qualquer pessoa física ou jurídica mencionada, e <strong>NÃO constitui peça jurídica</strong>.
                                    </p>
                                    <p className="text-xs text-red-300 mt-2 italic">
                                        Todas as informações aqui registradas são de acesso público. A responsabilidade pela
                                        interpretação jurídica dos fatos narrados cabe exclusivamente às autoridades competentes.
                                    </p>
                                </div>
                            </div>
                        </motion.section>

                    </div>

                    {/* Seção de Downloads */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 pt-8 border-t border-white/10"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white mb-2">Arquivos para Download</h2>
                            <p className="text-zinc-400">Baixe a documentação completa e os anexos</p>
                        </div>

                        {/* PDF Principal em Destaque */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="mb-8"
                        >
                            <div className="bg-gradient-to-r from-[#eab308]/20 to-orange-500/20 border-2 border-[#eab308] rounded-2xl p-6 shadow-lg shadow-yellow-500/20">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-[#eab308] rounded-xl flex-shrink-0">
                                        <FileText className="w-10 h-10 text-black" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <h3 className="text-2xl font-black text-white mb-2">
                                                    📄 Dossiê Completo - PDF
                                                </h3>
                                                <p className="text-zinc-300 text-sm mb-2">
                                                    Documento completo de 9 páginas com todos os fatos documentados, estrutura societária,
                                                    contratos públicos e processos judiciais.
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-zinc-400">
                                                    <span>📅 Data: 28/04/2026</span>
                                                    <span>📊 9 páginas</span>
                                                    <span>💾 Tamanho estimado: 3.2 MB</span>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href="https://drive.google.com/file/d/1K7nLdXgUAMpwyFdA2tIJKCWPgEPGhncu/view?usp=sharing"
                                            target="_blank"
                                            className="inline-flex items-center gap-3 px-6 py-3 bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-xl transition-all font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                        >
                                            <Download className="w-5 h-5" />
                                            Baixar Dossiê Completo (PDF)
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <p className="text-center text-xs text-zinc-500 mt-8">
                            Se você encontrar algum problema com o arquivo, entre em contato conosco.
                        </p>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}
