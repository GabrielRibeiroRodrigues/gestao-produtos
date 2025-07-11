import { getAllRows, executeQuery, getFirstRow } from '../database/database';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Tipos de notificação
export const TIPOS_NOTIFICACAO = {
  ESTOQUE_BAIXO: 'ESTOQUE_BAIXO',
  ESTOQUE_ALTO: 'ESTOQUE_ALTO',
  ESTOQUE_ZERADO: 'ESTOQUE_ZERADO',
  PRODUTO_VENCENDO: 'PRODUTO_VENCENDO'
};

// Solicitar permissão para notificações
export const solicitarPermissaoNotificacao = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão para notificações:', error);
    return false;
  }
};

// Configurar configuração de notificação para um produto
export const configurarNotificacaoProduto = async (produtoId, subsetorId, estoqueMinimo, estoqueMaximo = null) => {
  try {
    // Verificar se já existe configuração
    const configuracaoExistente = getFirstRow(
      'SELECT * FROM ConfiguracaoNotificacao WHERE produto_id = ? AND subsetor_id = ?',
      [produtoId, subsetorId]
    );
    
    if (configuracaoExistente) {
      // Atualizar configuração existente
      executeQuery(
        `UPDATE ConfiguracaoNotificacao 
         SET estoque_minimo = ?, estoque_maximo = ?, data_atualizacao = CURRENT_TIMESTAMP 
         WHERE produto_id = ? AND subsetor_id = ?`,
        [estoqueMinimo, estoqueMaximo, produtoId, subsetorId]
      );
    } else {
      // Criar nova configuração
      executeQuery(
        `INSERT INTO ConfiguracaoNotificacao (produto_id, subsetor_id, estoque_minimo, estoque_maximo) 
         VALUES (?, ?, ?, ?)`,
        [produtoId, subsetorId, estoqueMinimo, estoqueMaximo]
      );
    }
    
    console.log('Configuração de notificação salva com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao configurar notificação:', error);
    throw error;
  }
};

// Obter configurações de notificação
export const obterConfiguracaoNotificacao = (produtoId, subsetorId) => {
  try {
    return getFirstRow(
      'SELECT * FROM ConfiguracaoNotificacao WHERE produto_id = ? AND subsetor_id = ?',
      [produtoId, subsetorId]
    );
  } catch (error) {
    console.error('Erro ao obter configuração de notificação:', error);
    throw error;
  }
};

// Obter todas as configurações de notificação
export const obterTodasConfiguracoes = () => {
  try {
    return getAllRows(`
      SELECT 
        cn.*,
        p.nome as produto_nome,
        m.nome as marca,
        mo.nome as modelo,
        ss.nome as subsetor_nome,
        s.nome as setor_nome
      FROM ConfiguracaoNotificacao cn
      JOIN DetalheProduto dp ON cn.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN Modelo mo ON p.modelo_id = mo.id
      JOIN SetorSub ss ON cn.subsetor_id = ss.id
      JOIN Setor s ON ss.setor_id = s.id
      WHERE cn.notificacao_ativa = 1
      ORDER BY p.nome, ss.nome
    `);
  } catch (error) {
    console.error('Erro ao obter todas as configurações:', error);
    throw error;
  }
};

// Verificar estoque e gerar notificações
export const verificarEstoqueENotificar = async (produtoId, subsetorId, quantidadeAtual) => {
  try {
    const configuracao = obterConfiguracaoNotificacao(produtoId, subsetorId);
    
    if (!configuracao || !configuracao.notificacao_ativa) {
      return;
    }
    
    const { estoque_minimo, estoque_maximo } = configuracao;
    let tipoNotificacao = null;
    let mensagem = '';
    
    // Verificar diferentes tipos de alerta
    if (quantidadeAtual === 0) {
      tipoNotificacao = TIPOS_NOTIFICACAO.ESTOQUE_ZERADO;
      mensagem = 'Produto em falta no estoque!';
    } else if (quantidadeAtual <= estoque_minimo) {
      tipoNotificacao = TIPOS_NOTIFICACAO.ESTOQUE_BAIXO;
      mensagem = `Estoque baixo! Quantidade atual: ${quantidadeAtual}, Mínimo: ${estoque_minimo}`;
    } else if (estoque_maximo && quantidadeAtual >= estoque_maximo) {
      tipoNotificacao = TIPOS_NOTIFICACAO.ESTOQUE_ALTO;
      mensagem = `Estoque alto! Quantidade atual: ${quantidadeAtual}, Máximo: ${estoque_maximo}`;
    }
    
    if (tipoNotificacao) {
      await criarNotificacao(produtoId, subsetorId, tipoNotificacao, quantidadeAtual, 
                           tipoNotificacao === TIPOS_NOTIFICACAO.ESTOQUE_ALTO ? estoque_maximo : estoque_minimo, 
                           mensagem);
    }
    
  } catch (error) {
    console.error('Erro ao verificar estoque e notificar:', error);
  }
};

// Criar notificação
export const criarNotificacao = async (produtoId, subsetorId, tipoNotificacao, quantidadeAtual, limiteConfigurado, mensagem) => {
  try {
    // Verificar se já existe notificação similar não lida (evitar spam)
    const notificacaoExistente = getFirstRow(
      `SELECT * FROM HistoricoNotificacao 
       WHERE produto_id = ? AND subsetor_id = ? AND tipo_notificacao = ? AND lida = 0 
       AND date(data_notificacao) = date('now')`,
      [produtoId, subsetorId, tipoNotificacao]
    );
    
    if (notificacaoExistente) {
      console.log('Notificação similar já existe para hoje');
      return;
    }
    
    // Obter dados do produto para a notificação
    const produtoInfo = getFirstRow(`
      SELECT 
        p.nome as produto_nome,
        m.nome as marca,
        ss.nome as subsetor_nome,
        s.nome as setor_nome
      FROM DetalheProduto dp
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN SetorSub ss ON ? = ss.id
      JOIN Setor s ON ss.setor_id = s.id
      WHERE dp.id = ?
    `, [subsetorId, produtoId]);
    
    // Salvar no histórico
    executeQuery(
      `INSERT INTO HistoricoNotificacao 
       (produto_id, subsetor_id, tipo_notificacao, quantidade_atual, limite_configurado, mensagem) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [produtoId, subsetorId, tipoNotificacao, quantidadeAtual, limiteConfigurado, mensagem]
    );
    
    // Enviar notificação push local
    if (produtoInfo) {
      const titulo = getTextoTitulo(tipoNotificacao);
      const corpo = `${produtoInfo.produto_nome} - ${produtoInfo.marca}\n${produtoInfo.setor_nome} > ${produtoInfo.subsetor_nome}\n${mensagem}`;
      
      await enviarNotificacaoLocal(titulo, corpo, {
        produtoId,
        subsetorId,
        tipoNotificacao,
        quantidadeAtual
      });
    }
    
    console.log(`Notificação criada: ${tipoNotificacao} para produto ${produtoId}`);
    
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
};

// Enviar notificação local
export const enviarNotificacaoLocal = async (titulo, corpo, dados = {}) => {
  try {
    const hasPermission = await solicitarPermissaoNotificacao();
    
    if (!hasPermission) {
      console.log('Sem permissão para notificações');
      return;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: corpo,
        data: dados,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Imediatamente
    });
    
    console.log('Notificação local enviada');
    
  } catch (error) {
    console.error('Erro ao enviar notificação local:', error);
  }
};

// Obter texto do título baseado no tipo
const getTextoTitulo = (tipoNotificacao) => {
  switch (tipoNotificacao) {
    case TIPOS_NOTIFICACAO.ESTOQUE_BAIXO:
      return '⚠️ Estoque Baixo';
    case TIPOS_NOTIFICACAO.ESTOQUE_ALTO:
      return '📈 Estoque Alto';
    case TIPOS_NOTIFICACAO.ESTOQUE_ZERADO:
      return '🚨 Estoque Zerado';
    case TIPOS_NOTIFICACAO.PRODUTO_VENCENDO:
      return '⏰ Produto Vencendo';
    default:
      return '📱 Notificação de Estoque';
  }
};

// Marcar notificação como lida
export const marcarNotificacaoLida = (notificacaoId) => {
  try {
    executeQuery(
      'UPDATE HistoricoNotificacao SET lida = 1 WHERE id = ?',
      [notificacaoId]
    );
    console.log('Notificação marcada como lida');
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
};

// Marcar todas as notificações como lidas
export const marcarTodasNotificacoesLidas = () => {
  try {
    executeQuery('UPDATE HistoricoNotificacao SET lida = 1 WHERE lida = 0');
    console.log('Todas as notificações marcadas como lidas');
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
  }
};

// Obter histórico de notificações
export const obterHistoricoNotificacoes = (apenasNaoLidas = false) => {
  try {
    const whereClause = apenasNaoLidas ? 'WHERE hn.lida = 0' : '';
    
    return getAllRows(`
      SELECT 
        hn.*,
        p.nome as produto_nome,
        m.nome as marca,
        ss.nome as subsetor_nome,
        s.nome as setor_nome
      FROM HistoricoNotificacao hn
      JOIN DetalheProduto dp ON hn.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN SetorSub ss ON hn.subsetor_id = ss.id
      JOIN Setor s ON ss.setor_id = s.id
      ${whereClause}
      ORDER BY hn.data_notificacao DESC
    `);
  } catch (error) {
    console.error('Erro ao obter histórico de notificações:', error);
    throw error;
  }
};

// Obter contagem de notificações não lidas
export const obterContadorNotificacoes = () => {
  try {
    const result = getFirstRow(
      'SELECT COUNT(*) as total FROM HistoricoNotificacao WHERE lida = 0'
    );
    return result ? result.total : 0;
  } catch (error) {
    console.error('Erro ao obter contador de notificações:', error);
    return 0;
  }
};

// Verificar todos os produtos e gerar notificações
export const verificarTodosEstoques = async () => {
  try {
    console.log('Iniciando verificação de todos os estoques...');
    
    // Buscar todos os produtos com configuração de notificação ativa
    const produtosConfigurados = getAllRows(`
      SELECT 
        cn.produto_id,
        cn.subsetor_id,
        cn.estoque_minimo,
        cn.estoque_maximo,
        COALESCE(dpe.quantidade, 0) as quantidade_atual
      FROM ConfiguracaoNotificacao cn
      LEFT JOIN DetalheProdutoEstoque dpe ON cn.produto_id = dpe.produto_id AND cn.subsetor_id = dpe.subsetor_id
      WHERE cn.notificacao_ativa = 1
    `);
    
    for (const produto of produtosConfigurados) {
      await verificarEstoqueENotificar(
        produto.produto_id,
        produto.subsetor_id,
        produto.quantidade_atual
      );
    }
    
    console.log(`Verificação concluída para ${produtosConfigurados.length} produtos`);
    
  } catch (error) {
    console.error('Erro ao verificar todos os estoques:', error);
  }
};

// Ativar/desativar notificação para um produto
export const alterarStatusNotificacao = (produtoId, subsetorId, ativo) => {
  try {
    executeQuery(
      'UPDATE ConfiguracaoNotificacao SET notificacao_ativa = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE produto_id = ? AND subsetor_id = ?',
      [ativo ? 1 : 0, produtoId, subsetorId]
    );
    console.log(`Status da notificação alterado para ${ativo ? 'ativo' : 'inativo'}`);
  } catch (error) {
    console.error('Erro ao alterar status da notificação:', error);
    throw error;
  }
};

// Limpar histórico de notificações antigas
export const limparHistoricoAntigo = (diasParaManter = 30) => {
  try {
    executeQuery(
      `DELETE FROM HistoricoNotificacao 
       WHERE date(data_notificacao) < date('now', '-${diasParaManter} days')`,
      []
    );
    console.log(`Histórico de notificações antigas removido (${diasParaManter} dias)`);
  } catch (error) {
    console.error('Erro ao limpar histórico antigo:', error);
  }
};

// Obter estatísticas de notificações
export const obterEstatisticasNotificacoes = () => {
  try {
    const estatisticas = {
      totalNotificacoes: 0,
      naoLidas: 0,
      porTipo: {},
      ultimos7Dias: 0
    };
    
    // Total de notificações
    const total = getFirstRow('SELECT COUNT(*) as total FROM HistoricoNotificacao');
    estatisticas.totalNotificacoes = total ? total.total : 0;
    
    // Não lidas
    const naoLidas = getFirstRow('SELECT COUNT(*) as total FROM HistoricoNotificacao WHERE lida = 0');
    estatisticas.naoLidas = naoLidas ? naoLidas.total : 0;
    
    // Por tipo
    const porTipo = getAllRows('SELECT tipo_notificacao, COUNT(*) as total FROM HistoricoNotificacao GROUP BY tipo_notificacao');
    porTipo.forEach(item => {
      estatisticas.porTipo[item.tipo_notificacao] = item.total;
    });
    
    // Últimos 7 dias
    const ultimos7Dias = getFirstRow('SELECT COUNT(*) as total FROM HistoricoNotificacao WHERE date(data_notificacao) >= date(\'now\', \'-7 days\')');
    estatisticas.ultimos7Dias = ultimos7Dias ? ultimos7Dias.total : 0;
    
    return estatisticas;
  } catch (error) {
    console.error('Erro ao obter estatísticas de notificações:', error);
    return {
      totalNotificacoes: 0,
      naoLidas: 0,
      porTipo: {},
      ultimos7Dias: 0
    };
  }
};
