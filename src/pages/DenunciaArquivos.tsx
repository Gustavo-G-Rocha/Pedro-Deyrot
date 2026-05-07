import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Lock, AlertCircle, Archive } from 'lucide-react';
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

    // Lista de arquivos de denúncia (exemplo - ajuste conforme necessário)
    const arquivos = [
        {
            id: 1,
            titulo: 'Denúncia - Documento Principal',
            descricao: 'Documento principal com todas as informações da denúncia.',
            arquivo: '/documentos/denuncia-principal.pdf',
            tamanho: '2.4 MB'
        },
        {
            id: 2,
            titulo: 'Anexo 1 - Comprovantes',
            descricao: 'Comprovantes e evidências relacionadas à denúncia.',
            arquivo: '/documentos/anexo-1-comprovantes.pdf',
            tamanho: '1.8 MB'
        },
        {
            id: 3,
            titulo: 'Anexo 2 - Documentação Complementar',
            descricao: 'Documentação complementar e provas adicionais.',
            arquivo: '/documentos/anexo-2-complementar.pdf',
            tamanho: '3.1 MB'
        },
        {
            id: 4,
            titulo: 'Relatório Técnico',
            descricao: 'Análise técnica detalhada dos fatos denunciados.',
            arquivo: '/documentos/relatorio-tecnico.pdf',
            tamanho: '4.2 MB'
        }
    ];

    if (!hasAccess) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/fundo.png')`
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
        <div className="relative min-h-screen p-4 lg:p-8 overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('/fundo.png')`
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#242424]/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-12 border border-white/10 mb-8"
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
                            <p className="font-semibold text-yellow-400 mb-1">Informação Importante</p>
                            <p>Este documento contém informações sensíveis relacionadas a denúncias. Utilize-o com responsabilidade e discrição.</p>
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

                        {/* Seção 1: Introdução */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">1</span>
                                Introdução
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <p>
                                    Este documento apresenta denúncia formal sobre irregularidades observadas e comprovadas através de
                                    documentação e evidências concretas. As informações aqui contidas são de interesse público e visam
                                    a transparência e o cumprimento da lei.
                                </p>
                                <p>
                                    A denúncia foi elaborada com base em documentos oficiais, depoimentos e análises técnicas que
                                    comprovam os fatos narrados. Todos os anexos e comprovantes estão disponíveis ao final deste documento.
                                </p>
                            </div>
                        </motion.section>

                        {/* Seção 2: Fatos Denunciados */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">2</span>
                                Fatos Denunciados
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <p>
                                    Durante o período investigado, foram identificadas as seguintes irregularidades:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Uso indevido de recursos públicos para fins particulares</li>
                                    <li>Desvio de finalidade em contratos e licitações</li>
                                    <li>Favorecimento de empresas específicas sem justificativa técnica</li>
                                    <li>Ausência de transparência em processos administrativos</li>
                                    <li>Violação de procedimentos legais estabelecidos</li>
                                </ul>
                                <p className="mt-4">
                                    Cada uma dessas irregularidades está documentada com provas materiais, incluindo documentos oficiais,
                                    comprovantes bancários, contratos e depoimentos.
                                </p>
                            </div>
                        </motion.section>

                        {/* Seção 3: Evidências e Provas */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">3</span>
                                Evidências e Provas
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <p>
                                    As evidências coletadas incluem:
                                </p>
                                <div className="grid gap-3 mt-4">
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <h3 className="font-bold text-white mb-2">📄 Documentos Oficiais</h3>
                                        <p className="text-sm">Contratos, licitações, atas de reunião e correspondências oficiais</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <h3 className="font-bold text-white mb-2">💰 Comprovantes Financeiros</h3>
                                        <p className="text-sm">Extratos bancários, notas fiscais e comprovantes de pagamento</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <h3 className="font-bold text-white mb-2">🗣️ Depoimentos</h3>
                                        <p className="text-sm">Testemunhos de envolvidos e testemunhas dos fatos</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <h3 className="font-bold text-white mb-2">📊 Análises Técnicas</h3>
                                        <p className="text-sm">Perícias e relatórios técnicos elaborados por especialistas</p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Seção 4: Análise Jurídica */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">4</span>
                                Análise Jurídica
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <p>
                                    Os fatos narrados configuram possível violação dos seguintes dispositivos legais:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Lei de Improbidade Administrativa (Lei 8.429/1992)</li>
                                    <li>Lei de Licitações e Contratos (Lei 14.133/2021)</li>
                                    <li>Lei de Responsabilidade Fiscal (Lei Complementar 101/2000)</li>
                                    <li>Código Penal Brasileiro - Crimes contra a Administração Pública</li>
                                </ul>
                                <p className="mt-4">
                                    A documentação anexa comprova elementos suficientes para caracterizar as infrações mencionadas,
                                    justificando a apuração pelos órgãos competentes.
                                </p>
                            </div>
                        </motion.section>

                        {/* Seção 5: Conclusão */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/5 rounded-xl p-6 border border-white/10"
                        >
                            <h2 className="text-2xl font-bold text-[#eab308] mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#eab308]/20 rounded-lg flex items-center justify-center text-sm">5</span>
                                Conclusão
                            </h2>
                            <div className="text-zinc-300 space-y-4 leading-relaxed">
                                <p>
                                    Diante dos fatos e provas apresentados, solicita-se a apuração rigorosa das irregularidades
                                    denunciadas, bem como a aplicação das sanções cabíveis aos responsáveis, nos termos da legislação vigente.
                                </p>
                                <p>
                                    A documentação completa está disponível para download na seção abaixo, incluindo todos os anexos,
                                    comprovantes e relatórios técnicos que fundamentam esta denúncia.
                                </p>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
                                    <p className="text-red-400 font-semibold text-sm">
                                        ⚠️ Este documento possui caráter sigiloso e seu conteúdo deve ser tratado com a devida confidencialidade.
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {arquivos.map((arquivo, index) => (
                                <motion.div
                                    key={arquivo.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.05 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-[#eab308]/10 rounded-lg group-hover:bg-[#eab308]/20 transition-colors flex-shrink-0">
                                            <FileText className="w-6 h-6 text-[#eab308]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white mb-1 group-hover:text-[#eab308] transition-colors">
                                                {arquivo.titulo}
                                            </h3>
                                            <p className="text-xs text-zinc-400 mb-3">
                                                {arquivo.descricao}
                                            </p>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs text-zinc-500 font-medium">
                                                    {arquivo.tamanho}
                                                </span>
                                                <a
                                                    href={arquivo.arquivo}
                                                    download
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-lg transition-all text-xs font-bold"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Baixar
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Botão para baixar todos */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="flex justify-center"
                        >
                            <button
                                onClick={() => {
                                    // Baixar todos os arquivos
                                    arquivos.forEach((arquivo, index) => {
                                        setTimeout(() => {
                                            const link = document.createElement('a');
                                            link.href = arquivo.arquivo;
                                            link.download = arquivo.titulo;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }, index * 500);
                                    });
                                }}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-xl transition-all font-black text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-105 active:scale-95"
                            >
                                <Archive className="w-5 h-5" />
                                Baixar Todos os Arquivos
                            </button>
                        </motion.div>

                        <p className="text-center text-xs text-zinc-500 mt-6">
                            Se você encontrar algum problema com os arquivos, entre em contato conosco.
                        </p>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
}
