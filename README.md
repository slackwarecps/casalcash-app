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
- **Componentes de UI:** Utilização da biblioteca de componentes ShadCN UI para uma interface moderna e consistente.
- **Persistência de Dados:** O banco de dados utilizado é o Firestore (Firebase), com atualizações em tempo real.
- **Responsividade:** A interface é adaptável para uso em desktops e dispositivos móveis.
- **Notificações:** O sistema exibe notificações (toasts) para confirmar ações do usuário (criação, edição, exclusão).
- **Performance:** Os dados são carregados de forma assíncrona, com indicadores de carregamento (loaders) para feedback visual ao usuário.
- **Segurança:** Regras de segurança do Firestore devem ser configuradas para garantir que cada usuário acesse apenas seus próprios dados. (Atualmente em modo de desenvolvimento).
