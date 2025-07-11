import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { verificarTodosEstoques, obterContadorNotificacoes } from '../services/notificacao';
import NotificationManager from '../utils/NotificationManager';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [contadorNotificacoes, setContadorNotificacoes] = useState(0);
  const [verificandoEstoque, setVerificandoEstoque] = useState(false);

  useEffect(() => {
    // Iniciar o gerenciador de notificações
    NotificationManager.start();
    
    // Verificar estoque ao inicializar
    verificarEstoquesIniciais();
    
    // Listener para quando o app volta ao primeiro plano
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        verificarEstoquePeriodico();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Parar o gerenciador ao desmontar
      NotificationManager.stop();
      
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const verificarEstoquesIniciais = async () => {
    try {
      setVerificandoEstoque(true);
      await verificarTodosEstoques();
      atualizarContador();
    } catch (error) {
      console.error('Erro ao verificar estoques iniciais:', error);
    } finally {
      setVerificandoEstoque(false);
    }
  };

  const verificarEstoquePeriodico = async () => {
    try {
      console.log('Verificando estoques periodicamente...');
      await verificarTodosEstoques();
      atualizarContador();
    } catch (error) {
      console.error('Erro na verificação periódica:', error);
    }
  };

  const atualizarContador = () => {
    try {
      const contador = obterContadorNotificacoes();
      setContadorNotificacoes(contador);
      console.log(`Contador de notificações atualizado: ${contador}`);
    } catch (error) {
      console.error('Erro ao atualizar contador:', error);
    }
  };

  const forcarVerificacaoEstoque = async () => {
    try {
      setVerificandoEstoque(true);
      await verificarTodosEstoques();
      atualizarContador();
      return true;
    } catch (error) {
      console.error('Erro ao forçar verificação de estoque:', error);
      return false;
    } finally {
      setVerificandoEstoque(false);
    }
  };

  const obterProdutosCriticos = async () => {
    try {
      return await NotificationManager.getCriticalProducts();
    } catch (error) {
      console.error('Erro ao obter produtos críticos:', error);
      return [];
    }
  };

  const obterEstatisticasGerenciador = () => {
    return NotificationManager.getStats();
  };

  const value = {
    contadorNotificacoes,
    verificandoEstoque,
    atualizarContador,
    forcarVerificacaoEstoque,
    obterProdutosCriticos,
    obterEstatisticasGerenciador,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
