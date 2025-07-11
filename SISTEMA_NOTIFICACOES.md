# Sistema de Notificações de Estoque

## Visão Geral

O sistema de notificações de estoque foi implementado para alertar automaticamente quando os produtos atingem limites críticos de estoque. O sistema é composto por:

### Componentes Principais

1. **Serviço de Notificações** (`src/services/notificacao.js`)
   - Gerencia todas as operações de notificação
   - Configura limites de estoque
   - Envia notificações push locais
   - Mantém histórico de notificações

2. **Gerenciador de Notificações** (`src/utils/NotificationManager.js`)
   - Monitora automaticamente os níveis de estoque
   - Executa verificações periódicas (a cada 5 minutos)
   - Gerencia limpeza automática do histórico

3. **Contexto de Notificações** (`src/context/NotificationContext.js`)
   - Fornece estado global do sistema
   - Integra com o ciclo de vida do app
   - Disponibiliza dados para todos os componentes

### Funcionalidades

#### 1. Configuração de Limites
- **Estoque Mínimo**: Limite abaixo do qual o produto é considerado em falta
- **Estoque Máximo**: Limite acima do qual o produto é considerado em excesso
- **Configuração por Produto/Subsetor**: Cada combinação pode ter limites específicos

#### 2. Tipos de Notificação
- **🚨 Estoque Zerado**: Produto sem estoque disponível
- **⚠️ Estoque Baixo**: Produto próximo ao limite mínimo
- **📈 Estoque Alto**: Produto acima do limite máximo
- **⏰ Produto Vencendo**: Para futuras implementações

#### 3. Telas do Sistema

##### Configuração de Notificações (`ConfiguracaoNotificacoes.js`)
- Criar/editar configurações de limite
- Ativar/desativar notificações por produto
- Visualizar todas as configurações existentes

##### Visualizar Notificações (`NotificacoesScreen.js`)
- Listar todas as notificações
- Filtrar por status (lidas/não lidas)
- Marcar notificações como lidas
- Estatísticas do sistema

##### Dashboard de Notificações (`NotificationDashboard.js`)
- Visão geral das notificações
- Produtos críticos
- Notificações recentes
- Estatísticas resumidas

### Banco de Dados

#### Tabelas Criadas

1. **ConfiguracaoNotificacao**
   - `id`: ID único da configuração
   - `produto_id`: ID do produto
   - `subsetor_id`: ID do subsetor
   - `estoque_minimo`: Limite mínimo de estoque
   - `estoque_maximo`: Limite máximo de estoque (opcional)
   - `notificacao_ativa`: Status da notificação (ativo/inativo)
   - `data_criacao`: Data de criação
   - `data_atualizacao`: Data da última atualização

2. **HistoricoNotificacao**
   - `id`: ID único da notificação
   - `produto_id`: ID do produto
   - `subsetor_id`: ID do subsetor
   - `tipo_notificacao`: Tipo de alerta
   - `quantidade_atual`: Estoque atual quando a notificação foi gerada
   - `limite_configurado`: Limite que foi ultrapassado
   - `mensagem`: Mensagem da notificação
   - `data_notificacao`: Data/hora da notificação
   - `lida`: Status de leitura

### Integração com o Sistema Existente

#### Serviço de Estoque Atualizado
- A função `atualizarEstoque` agora verifica automaticamente se precisa gerar notificações
- Integração transparente com as operações existentes

#### Navegação
- Novas telas adicionadas ao stack de navegação
- Badge de notificação no header de todas as telas
- Acesso direto via menu principal

### Configuração e Uso

#### 1. Instalação de Dependências
```bash
npm install expo-notifications
```

#### 2. Permissões
- O sistema solicita automaticamente permissões para notificações
- Suporte para Android e iOS

#### 3. Configuração Inicial
1. Acesse "Configurar Notificações" no menu principal
2. Selecione o produto e subsetor
3. Configure os limites mínimo e máximo
4. Salve a configuração

#### 4. Monitoramento
- O sistema verifica automaticamente os estoques a cada 5 minutos
- Notificações são enviadas quando os limites são atingidos
- Histórico completo fica disponível na tela de notificações

### Características Técnicas

#### Performance
- Verificações otimizadas com queries específicas
- Evita spam de notificações (uma por produto/dia)
- Limpeza automática do histórico antigo

#### Confiabilidade
- Tratamento robusto de erros
- Fallbacks para casos de falha
- Logging detalhado para debug

#### Escalabilidade
- Suporte a múltiplos produtos e subsetores
- Configuração flexível por combinação
- Estrutura preparada para novas funcionalidades

### Próximas Funcionalidades

1. **Notificações Push Remotas**
   - Integração com serviços de push
   - Notificações mesmo com app fechado

2. **Relatórios de Notificações**
   - Análise de tendências
   - Relatórios de produtos críticos

3. **Integração com Fornecedores**
   - Pedidos automáticos
   - Alertas para reposição

4. **Notificações por Vencimento**
   - Controle de validade
   - Alertas preventivos

### Troubleshooting

#### Problemas Comuns

1. **Notificações não aparecem**
   - Verificar permissões do sistema
   - Verificar se existem configurações ativas

2. **Verificação não funciona**
   - Verificar logs no console
   - Verificar se o NotificationManager está ativo

3. **Performance lenta**
   - Verificar quantidade de configurações
   - Considerar limpeza do histórico

#### Logs Importantes
- `Verificando níveis de estoque...`
- `Notificação criada: [TIPO] para produto [ID]`
- `Monitoramento de notificações iniciado`

### Manutenção

#### Limpeza Regular
- Histórico é limpo automaticamente após 30 dias
- Configurações desativadas podem ser removidas manualmente

#### Monitoramento
- Verificar estatísticas regularmente
- Ajustar limites conforme necessário
- Revisar configurações inconsistentes

---

## Conclusão

O sistema de notificações de estoque fornece uma solução completa e robusta para monitoramento automático de inventário. Com integração transparente ao sistema existente e interface intuitiva, garante que os usuários sejam alertados proativamente sobre situações críticas de estoque.
