# CasalCash

Um aplicativo de controle financeiro para casais, projetado para simplificar a gestão de despesas, empréstimos e o balanço financeiro mensal.

## Requisitos Funcionais

### Gestão de Despesas
- **CRUD de Despesas:** Criar, visualizar, editar e apagar despesas.
- **Tipos de Despesa:** Diferenciar entre despesas **variáveis** (pontuais) e **fixas** (recorrentes).
- **Detalhes do Pagamento:** Indicar quem pagou (Fabão ou Tati), o valor, a data e a categoria.
- **Rateio:** Definir como a despesa deve ser dividida: "50/50", "100% Fabão" ou "100% Tati".
- **Status do Pagamento:** Marcar uma despesa como "Paga" ou "Não Paga" e adicionar uma observação sobre o pagamento.
  - Despesas variáveis são marcadas como "Pagas" por padrão na criação.
- **Aplicar Despesas Recorrentes:** Lançar todas as despesas fixas cadastradas para o mês selecionado com um único clique.
- **Apagar Despesas do Mês:** Remover todas as despesas de um mês específico para "limpar" o período.

### Gestão de Empréstimos
- **CRUD de Empréstimos:** Criar, visualizar, editar e apagar empréstimos e compras parceladas.
- **Detalhes do Empréstimo:** Definir descrição, valor total, quem emprestou (credor), quem deve (devedor), número de parcelas e data de início.
- **Acompanhamento de Parcelas:** Visualizar o progresso de pagamento, registrar o pagamento de parcelas individualmente e adicionar detalhes.

### Gestão de Pré-Créditos (Adiantamentos)
- **CRUD de Pré-Créditos:** Criar, editar e apagar adiantamentos feitos por um dos parceiros.
- **Detalhes:** Registrar descrição, valor, autor do crédito e data.

### Dashboard e Visualização
- **Resumo Mensal:** Visualizar um resumo financeiro para o mês selecionado, incluindo total gasto, divisão por pessoa, e totais de pré-créditos e empréstimos.
- **Navegação por Mês:** Navegar facilmente entre os meses para consultar o histórico financeiro.
- **Listas com Filtros e Paginação:**
  - **Despesas:** Organizadas em abas ("Geral 50/50", "Adicionais Tati", "Adicionais Fabão", "Fixas"), com filtros por pagador e status (pago/não pago). As abas de adicionais exibem a somatória dos gastos variáveis.
  - **Empréstimos:** Filtrar por devedor e status ("Ativo" ou "Quitado"), com paginação. O filtro padrão é "Ativos".
- **Gráfico de Despesas:** Gráfico de pizza que mostra a distribuição dos gastos por categoria.

### Inteligência Artificial
- **Reconciliação de Dívidas:** Utilizar IA para analisar todas as despesas, pré-créditos e parcelas de empréstimos do mês e calcular o balanço final, informando de forma clara quem deve pagar a quem e o valor exato.

### Autenticação e Usuários
- **Login:** Acesso ao sistema através de email e senha.

## Requisitos Não Funcionais

- **Tecnologia:** Aplicação web desenvolvida com Next.js, React, TypeScript e Tailwind CSS.
- **Componentes de UI:** Utilização da biblioteca de componentes **ShadCN UI** para uma interface moderna, acessível e consistente.
- **Persistência de Dados e Autenticação:**
  - **Banco de Dados:** **Firebase Firestore** para armazenamento de dados em tempo real.
  - **Autenticação:** **Firebase Authentication** para gerenciar o login dos usuários.
- **Inteligência Artificial:** **Genkit** para orquestrar chamadas a modelos de linguagem, como na funcionalidade de "Reconciliar Dívidas".
- **Responsividade:** A interface é adaptável para uso em desktops e dispositivos móveis.
- **Notificações:** O sistema exibe notificações (toasts) para confirmar ações do usuário (criação, edição, exclusão).
- **Performance:** Os dados são carregados de forma assíncrona, com indicadores de carregamento (loaders) para feedback visual ao usuário.
- **Segurança:** Regras de segurança do Firestore devem ser configuradas para garantir que cada usuário acesse apenas seus próprios dados. (Atualmente em modo de desenvolvimento).

### Stack Tecnológica
- **Framework Principal:** **Next.js** com App Router para renderização no servidor e no cliente, e um sistema de roteamento otimizado.
- **Linguagem:** **TypeScript** para adicionar tipagem estática e garantir um código mais seguro.
- **Biblioteca de UI:** **React** para a construção da interface de usuário de forma componentizada.
- **Estilização:** **Tailwind CSS** para criar o design da aplicação com classes utilitárias.
- **Componentes de UI:** **ShadCN UI** para uma interface moderna, acessível e consistente.
- **Banco de Dados e Autenticação:**
    - **Firebase Firestore:** Banco de dados NoSQL em tempo real para armazenar todos os dados da aplicação.
    - **Firebase Authentication:** Serviço para gerenciar a autenticação de usuários por email e senha.
- **Inteligência Artificial:** **Genkit** para orquestrar chamadas a modelos de linguagem na nuvem.

### Estrutura do Banco de Dados (Firestore)
A estrutura de dados no Firestore é organizada para dar suporte a múltiplos casais, embora a implementação atual utilize um ID fixo (`casalUnico`).

- **`users/{userId}`**: Armazena os perfis dos usuários (nome, email).
- **`couples/{coupleId}`**: Documento central que representa o casal. Todas as informações financeiras compartilhadas estão aninhadas sob este documento para garantir o isolamento dos dados.
  - **`expenses/{expenseId}`**: Coleção que armazena todas as despesas, tanto as fixas (recorrentes) quanto as variáveis (pontuais).
  - **`loans/{loanId}`**: Coleção para registrar empréstimos ou compras parceladas significativas entre o casal.
  - **`preCredits/{preCreditId}`**: Coleção para registrar adiantamentos financeiros feitos por um dos parceiros.
  - **`recurringExpenses/{recurringExpenseId}`**: Coleção que serve como um "modelo" para as despesas fixas, utilizada para gerar os lançamentos mensais.

## LEMBRE-SE

* lembre-se: sempre registre os requisitos funcionais e nao funcionais no readme.md em portugues.
