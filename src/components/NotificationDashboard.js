import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  obterContadorNotificacoes, 
  obterEstatisticasNotificacoes,
  obterHistoricoNotificacoes 
} from '../services/notificacao';
import { useNotification } from '../context/NotificationContext';

const NotificationDashboard = () => {
  const navigation = useNavigation();
  const { contadorNotificacoes, obterProdutosCriticos } = useNotification();
  const [estatisticas, setEstatisticas] = useState({});
  const [produtosCriticos, setProdutosCriticos] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar estatísticas
      const stats = obterEstatisticasNotificacoes();
      setEstatisticas(stats);
      
      // Carregar produtos críticos
      const criticos = await obterProdutosCriticos();
      setProdutosCriticos(criticos.slice(0, 5)); // Mostrar apenas os 5 primeiros
      
      // Carregar notificações recentes
      const notificacoesRecentes = obterHistoricoNotificacoes(true);
      setNotificacoes(notificacoesRecentes.slice(0, 3)); // Mostrar apenas as 3 mais recentes
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const navegarParaNotificacoes = () => {
    navigation.navigate('NotificacoesScreen');
  };

  const navegarParaConfiguracoes = () => {
    navigation.navigate('ConfiguracaoNotificacoes');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sistema de Notificações</Text>
      
      {/* Estatísticas Gerais */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{contadorNotificacoes}</Text>
          <Text style={styles.statLabel}>Não Lidas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estatisticas.ultimos7Dias || 0}</Text>
          <Text style={styles.statLabel}>Últimos 7 dias</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{produtosCriticos.length}</Text>
          <Text style={styles.statLabel}>Produtos Críticos</Text>
        </View>
      </View>

      {/* Produtos Críticos */}
      {produtosCriticos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Produtos Críticos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {produtosCriticos.map((produto, index) => (
              <View key={index} style={styles.criticalItem}>
                <Text style={styles.criticalProductName}>{produto.produto_nome}</Text>
                <Text style={styles.criticalProductDetails}>
                  {produto.marca} - {produto.subsetor_nome}
                </Text>
                <Text style={styles.criticalProductStock}>
                  Estoque: {produto.quantidade_atual} (Min: {produto.estoque_minimo})
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Notificações Recentes */}
      {notificacoes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notificações Recentes</Text>
          {notificacoes.map((notificacao, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={styles.notificationText} numberOfLines={2}>
                {notificacao.produto_nome}: {notificacao.mensagem}
              </Text>
              <Text style={styles.notificationTime}>
                {new Date(notificacao.data_notificacao).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={navegarParaNotificacoes}
        >
          <Text style={styles.actionButtonText}>Ver Todas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={navegarParaConfiguracoes}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Configurar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  criticalItem: {
    backgroundColor: '#fff5f5',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
    minWidth: 200,
  },
  criticalProductName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  criticalProductDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  criticalProductStock: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#007bff',
  },
});

export default NotificationDashboard;
