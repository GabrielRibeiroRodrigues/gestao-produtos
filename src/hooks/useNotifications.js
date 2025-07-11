import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  obterContadorNotificacoes,
  verificarTodosEstoques,
  obterHistoricoNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas
} from '../services/notificacao';

export const useNotifications = () => {
  const [contadorNotificacoes, setContadorNotificacoes] = useState(0);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Atualizar contador
  const atualizarContador = () => {
    try {
      const contador = obterContadorNotificacoes();
      setContadorNotificacoes(contador);
    } catch (error) {
      console.error('Erro ao atualizar contador:', error);
    }
  };

  // Carregar notificações
  const carregarNotificacoes = async (apenasNaoLidas = false) => {
    try {
      setLoading(true);
      const notifications = obterHistoricoNotificacoes(apenasNaoLidas);
      setNotificacoes(notifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar estoques
  const verificarEstoques = async () => {
    try {
      setLoading(true);
      await verificarTodosEstoques();
      atualizarContador();
    } catch (error) {
      console.error('Erro ao verificar estoques:', error);
      Alert.alert('Erro', 'Não foi possível verificar os estoques');
    } finally {
      setLoading(false);
    }
  };

  // Marcar como lida
  const marcarComoLida = async (notificacaoId) => {
    try {
      marcarNotificacaoLida(notificacaoId);
      atualizarContador();
      return true;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      return false;
    }
  };

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    try {
      marcarTodasNotificacoesLidas();
      atualizarContador();
      return true;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return false;
    }
  };

  // Inicializar
  useEffect(() => {
    atualizarContador();
  }, []);

  return {
    contadorNotificacoes,
    notificacoes,
    loading,
    atualizarContador,
    carregarNotificacoes,
    verificarEstoques,
    marcarComoLida,
    marcarTodasComoLidas,
  };
};
