Guia de Contribuição - SJCCObrigado pelo seu interesse em contribuir para o SJCC! Este documento serve como um guia para configurar o ambiente de desenvolvimento local e explicar nossos padrões de código e versionamento.🚀 Como rodar o projeto localmenteSiga os passos abaixo para clonar o repositório, configurar as dependências e iniciar o servidor.1. InstalaçãoPrimeiro, clone o repositório da Equipe 5 e instale as dependências do Node.js:# Clone o repositório
git clone [https://github.com/jggrimaldi/Equipe-5](https://github.com/jggrimaldi/Equipe-5)

# Entre na pasta do projeto
cd Equipe-5

# Instale as dependências
npm install
2. Configuração de Variáveis de Ambiente (Supabase)O projeto utiliza o Supabase como backend. Você precisará configurar as chaves de acesso localmente.Crie um arquivo chamado .env na raiz do projeto.Acesse o painel do seu projeto no Supabase.Vá em Settings > API.Copie a Project URL e a Anon / Public Key.Preencha o arquivo .env seguindo o modelo abaixo:NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_public_key_do_supabase
3. Executando o ServidorApós configurar as variáveis de ambiente, inicie o projeto em modo de desenvolvimento:npm run dev
O servidor iniciará geralmente em http://localhost:3000.📝 Padrões de CommitPara manter o histórico do Git organizado e legível, utilizamos a convenção Conventional Commits.Formato ObrigatórioTodas as mensagens de commit devem seguir estritamente o seguinte formato, onde o escopo (o texto entre parênteses) deve ser o nome do seu grupo/equipe:<tipo>(nome_do_grupo): <descrição breve e no imperativo>
Tipos de Commit Permitidosfeat: Introduz uma nova funcionalidade.fix: Corrige um bug.docs: Alterações apenas na documentação.style: Alterações que não afetam o significado do código (espaços em branco, formatação, ponto e vírgula faltando, etc).refactor: Uma alteração de código que não corrige um bug nem adiciona uma funcionalidade.chore: Atualização de tarefas de build, configurações de ferramentas, etc.✅ Exemplos Válidosfeat(Equipe-5): adiciona componente de login
fix(Equipe-Alpha): corrige erro de alinhamento no header
docs(Equipe-Beta): atualiza instruções no README
❌ Exemplos Inválidosadicionando login             (Falta o tipo e o escopo)
feat: novo botão              (Falta o nome do grupo no escopo)
fixed bug na home             (Uso de inglês misturado e verbo no passado)
