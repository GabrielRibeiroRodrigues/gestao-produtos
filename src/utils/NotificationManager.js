import { verificarTodosEstoques, limparHistoricoAntigo } from '../services/notificacao';
import { getAllRows } from '../database/database';

class NotificationManager {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.lastCheck = null;
  }

  // Iniciar monitoramento automático
  start() {
    if (this.isRunning) {
      console.log('Monitoramento já está em execução');
      return;
    }

    this.isRunning = true;
    console.log('Iniciando monitoramento de notificações');

    // Verificação inicial
    this.checkStockLevels();

    // Verificar a cada 5 minutos
    this.intervalId = setInterval(() => {
      this.checkStockLevels();
    }, 5 * 60 * 1000);

    // Limpar histórico antigo uma vez por dia
    this.scheduleCleanup();
  }

  // Parar monitoramento
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Monitoramento de notificações parado');
  }

  // Verificar níveis de estoque
  async checkStockLevels() {
    try {
      console.log('Verificando níveis de estoque...');
      this.lastCheck = new Date();
      
      await verificarTodosEstoques();
      
      console.log('Verificação de estoque concluída');
    } catch (error) {
      console.error('Erro na verificação de estoque:', error);
    }
  }

  // Programar limpeza do histórico
  scheduleCleanup() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
    
    setTimeout(() => {
      this.performCleanup();
      
      // Agendar limpeza diária
      setInterval(() => {
        this.performCleanup();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  // Executar limpeza
  performCleanup() {
    try {
      console.log('Executando limpeza de histórico...');
      limparHistoricoAntigo(30); // Manter 30 dias
      console.log('Limpeza de histórico concluída');
    } catch (error) {
      console.error('Erro na limpeza do histórico:', error);
    }
  }

  // Obter estatísticas do monitoramento
  getStats() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      uptime: this.isRunning ? new Date().getTime() - this.lastCheck?.getTime() : null,
    };
  }

  // Verificar produtos críticos
  async getCriticalProducts() {
    try {
      const criticalProducts = getAllRows(`
        SELECT 
          cn.produto_id,
          cn.subsetor_id,
          cn.estoque_minimo,
          COALESCE(dpe.quantidade, 0) as quantidade_atual,
          p.nome as produto_nome,
          m.nome as marca,
          ss.nome as subsetor_nome,
          s.nome as setor_nome
        FROM ConfiguracaoNotificacao cn
        JOIN DetalheProduto dp ON cn.produto_id = dp.id
        JOIN Produto p ON dp.produto_id = p.id
        JOIN Marca m ON p.marca_id = m.id
        JOIN SetorSub ss ON cn.subsetor_id = ss.id
        JOIN Setor s ON ss.setor_id = s.id
        LEFT JOIN DetalheProdutoEstoque dpe ON cn.produto_id = dpe.produto_id AND cn.subsetor_id = dpe.subsetor_id
        WHERE cn.notificacao_ativa = 1 
        AND COALESCE(dpe.quantidade, 0) <= cn.estoque_minimo
        ORDER BY COALESCE(dpe.quantidade, 0) ASC
      `);

      return criticalProducts;
    } catch (error) {
      console.error('Erro ao obter produtos críticos:', error);
      return [];
    }
  }

  // Verificar configurações inconsistentes
  async checkInconsistentConfigurations() {
    try {
      const inconsistentConfigs = getAllRows(`
        SELECT 
          cn.*,
          p.nome as produto_nome,
          ss.nome as subsetor_nome
        FROM ConfiguracaoNotificacao cn
        JOIN DetalheProduto dp ON cn.produto_id = dp.id
        JOIN Produto p ON dp.produto_id = p.id
        JOIN SetorSub ss ON cn.subsetor_id = ss.id
        WHERE cn.estoque_maximo IS NOT NULL 
        AND cn.estoque_maximo <= cn.estoque_minimo
      `);

      if (inconsistentConfigs.length > 0) {
        console.warn('Configurações inconsistentes encontradas:', inconsistentConfigs);
      }

      return inconsistentConfigs;
    } catch (error) {
      console.error('Erro ao verificar configurações inconsistentes:', error);
      return [];
    }
  }
}

// Instância singleton
const notificationManager = new NotificationManager();

export default notificationManager;
