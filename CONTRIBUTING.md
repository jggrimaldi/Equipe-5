# 📚 Guia de Contribuição - SJCC

Obrigado pelo seu interesse em contribuir para o SJCC! Este documento serve como um guia para configurar o ambiente de desenvolvimento local e explicar nossos padrões de código e versionamento.

---

## 🚀 Como Rodar o Projeto Localmente

Siga os passos abaixo para clonar o repositório, configurar as dependências e iniciar o servidor.

### 1. Instalação

Primeiro, clone o repositório da Equipe 5 e instale as dependências do Node.js:

```bash
# Clone o repositório
git clone [https://github.com/jggrimaldi/Equipe-5](https://github.com/jggrimaldi/Equipe-5)

# Entre na pasta do projeto
cd Equipe-5

# Instale as dependências
npm install
````

### 2\. Configuração de Variáveis de Ambiente (Supabase)

O projeto utiliza o **Supabase** como backend. Você precisará configurar as chaves de acesso localmente.

1.  Crie um arquivo chamado **`.env`** na raiz do projeto.
2.  Acesse o painel do seu projeto no Supabase.
3.  Vá em **Settings \> API**.
4.  Copie a **Project URL** e a **Anon / Public Key**.
5.  Preencha o arquivo `.env` seguindo o modelo abaixo:

<!-- end list -->

```ini
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_public_key_do_supabase
```

### 3\. Executando o Servidor

Após configurar as variáveis de ambiente, inicie o projeto em modo de desenvolvimento:

```bash
npm run dev
```

O servidor iniciará geralmente em `http://localhost:3000`.

-----

## 📝 Padrões de Commit

Para manter o histórico do Git organizado e legível, utilizamos a convenção **Conventional Commits**.

### Formato Obrigatório

Todas as mensagens de commit devem seguir estritamente o seguinte formato, onde o escopo (o texto entre parênteses) deve ser o nome do seu grupo/equipe:

```
<tipo>(nome_do_grupo): <descrição breve e no imperativo>
```

### Tipos de Commit Permitidos

| Tipo | Descrição |
| :--- | :--- |
| `feat` | Introduz uma **nova funcionalidade**. |
| `fix` | Corrige um **bug**. |
| `docs` | Alterações apenas na **documentação**. |
| `style` | Alterações que não afetam o significado do código (espaços em branco, formatação, ponto e vírgula faltando, etc). |
| `refactor` | Uma alteração de código que **não corrige um bug** nem **adiciona uma funcionalidade**. |
| `chore` | Atualização de tarefas de build, configurações de ferramentas, etc. |

### ✅ Exemplos Válidos

```
feat(Equipe-5): adiciona componente de login
fix(Equipe-Alpha): corrige erro de alinhamento no header
docs(Equipe-Beta): atualiza instruções no README
```

### ❌ Exemplos Inválidos

| Commit Inválido | Razão |
| :--- | :--- |
| `adicionando login` | Falta o **tipo** e o **escopo**. |
| `feat: novo botão` | Falta o **nome do grupo** no escopo. |
| `fixed bug na home` | Uso de inglês misturado e verbo no **passado**. |
