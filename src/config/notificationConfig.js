// Configurações globais para o sistema de notificações

export const NOTIFICATION_CONFIG = {
  // Intervalo de verificação em milissegundos (5 minutos)
  CHECK_INTERVAL: 5 * 60 * 1000,
  
  // Dias para manter no histórico
  HISTORY_RETENTION_DAYS: 30,
  
  // Configurações de notificação
  SOUND_ENABLED: true,
  VIBRATION_ENABLED: true,
  
  // Prioridade das notificações
  PRIORITY: {
    HIGH: 'high',
    NORMAL: 'normal',
    LOW: 'low'
  },
  
  // Configurações por tipo de notificação
  NOTIFICATION_TYPES: {
    ESTOQUE_ZERADO: {
      priority: 'high',
      sound: true,
      vibration: true,
      persistent: true,
      color: '#f44336'
    },
    ESTOQUE_BAIXO: {
      priority: 'normal',
      sound: true,
      vibration: false,
      persistent: false,
      color: '#ff9800'
    },
    ESTOQUE_ALTO: {
      priority: 'low',
      sound: false,
      vibration: false,
      persistent: false,
      color: '#2196f3'
    },
    PRODUTO_VENCENDO: {
      priority: 'high',
      sound: true,
      vibration: true,
      persistent: true,
      color: '#ff5722'
    }
  },
  
  // Limites padrão
  DEFAULT_LIMITS: {
    MIN_STOCK: 10,
    MAX_STOCK: 1000,
    CRITICAL_STOCK: 0
  },
  
  // Configurações de interface
  UI: {
    REFRESH_INTERVAL: 30000, // 30 segundos
    MAX_NOTIFICATIONS_DISPLAY: 100,
    BADGE_MAX_COUNT: 99
  }
};

// Textos das notificações
export const NOTIFICATION_MESSAGES = {
  ESTOQUE_ZERADO: {
    title: '🚨 Estoque Zerado',
    body: 'Produto sem estoque disponível!'
  },
  ESTOQUE_BAIXO: {
    title: '⚠️ Estoque Baixo',
    body: 'Produto próximo ao limite mínimo'
  },
  ESTOQUE_ALTO: {
    title: '📈 Estoque Alto',
    body: 'Produto acima do limite máximo'
  },
  PRODUTO_VENCENDO: {
    title: '⏰ Produto Vencendo',
    body: 'Produto próximo ao vencimento'
  }
};

// Configurações de permissões
export const PERMISSION_CONFIG = {
  NOTIFICATIONS: {
    android: {
      allowWhileIdle: true,
      priority: 'high',
      smallIcon: null,
      color: '#007bff'
    },
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowCriticalAlerts: true
    }
  }
};

export default NOTIFICATION_CONFIG;
