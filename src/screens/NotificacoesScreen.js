import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Badge
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  obterHistoricoNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
  obterContadorNotificacoes,
  obterEstatisticasNotificacoes,
  TIPOS_NOTIFICACAO
} from '../services/notificacao';

const NotificacoesScreen = ({ navigation }) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState('todas'); // 'todas', 'naoLidas'
  const [estatisticas, setEstatisticas] = useState({});

  useFocusEffect(
    useCallback(() => {
      carregarNotificacoes();
      carregarEstatisticas();
    }, [filtroAtivo])
  );

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const apenasNaoLidas = filtroAtivo === 'naoLidas';
      const notifications = obterHistoricoNotificacoes(apenasNaoLidas);
      setNotificacoes(notifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as notificações');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = () => {
    try {
      const stats = obterEstatisticasNotificacoes();
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarNotificacoes().finally(() => setRefreshing(false));
    carregarEstatisticas();
  }, [filtroAtivo]);

  const marcarComoLida = async (notificacaoId) => {
    try {
      marcarNotificacaoLida(notificacaoId);
      carregarNotificacoes();
      carregarEstatisticas();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      Alert.alert('Erro', 'Não foi possível marcar a notificação como lida');
    }
  };

  const marcarTodasComoLidas = () => {
    Alert.alert(
      'Confirmar',
      'Deseja marcar todas as notificações como lidas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              marcarTodasNotificacoesLidas();
              carregarNotificacoes();
              carregarEstatisticas();
              Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas');
            } catch (error) {
              console.error('Erro ao marcar todas como lidas:', error);
              Alert.alert('Erro', 'Não foi possível marcar as notificações como lidas');
            }
          }
        }
      ]
    );
  };

  const obterCorTipo = (tipo) => {
    switch (tipo) {
      case TIPOS_NOTIFICACAO.ESTOQUE_BAIXO:
        return '#ff9800';
      case TIPOS_NOTIFICACAO.ESTOQUE_ALTO:
        return '#2196f3';
      case TIPOS_NOTIFICACAO.ESTOQUE_ZERADO:
        return '#f44336';
      case TIPOS_NOTIFICACAO.PRODUTO_VENCENDO:
        return '#ff5722';
      default:
        return '#6c757d';
    }
  };

  const obterIconeTipo = (tipo) => {
    switch (tipo) {
      case TIPOS_NOTIFICACAO.ESTOQUE_BAIXO:
        return '⚠️';
      case TIPOS_NOTIFICACAO.ESTOQUE_ALTO:
        return '📈';
      case TIPOS_NOTIFICACAO.ESTOQUE_ZERADO:
        return '🚨';
      case TIPOS_NOTIFICACAO.PRODUTO_VENCENDO:
        return '⏰';
      default:
        return '📱';
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    const formatarHora = (date) => {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje às ${formatarHora(data)}`;
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem às ${formatarHora(data)}`;
    } else {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderItemNotificacao = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.lida && styles.unreadItem
      ]}
      onPress={() => !item.lida && marcarComoLida(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.tipoContainer}>
          <Text style={styles.tipoIcone}>{obterIconeTipo(item.tipo_notificacao)}</Text>
          <View 
            style={[
              styles.tipoIndicador, 
              { backgroundColor: obterCorTipo(item.tipo_notificacao) }
            ]} 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.produtoNome}>{item.produto_nome}</Text>
          <Text style={styles.produtoMarca}>{item.marca}</Text>
          <Text style={styles.localizacao}>{item.setor_nome} {' > '} {item.subsetor_nome}</Text>
        </View>
        {!item.lida && <View style={styles.unreadIndicator} />}
      </View>
      
      <Text style={styles.mensagem}>{item.mensagem}</Text>
      
      <View style={styles.notificationFooter}>
        <Text style={styles.dataNotificacao}>
          {formatarData(item.data_notificacao)}
        </Text>
        <Text style={styles.quantidadeInfo}>
          Qtd: {item.quantidade_atual} | Limite: {item.limite_configurado}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.estatisticasContainer}>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{estatisticas.naoLidas || 0}</Text>
          <Text style={styles.estatisticaLabel}>Não Lidas</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{estatisticas.ultimos7Dias || 0}</Text>
          <Text style={styles.estatisticaLabel}>Últimos 7 dias</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{estatisticas.totalNotificacoes || 0}</Text>
          <Text style={styles.estatisticaLabel}>Total</Text>
        </View>
      </View>
      
      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroAtivo === 'todas' && styles.filtroAtivo
          ]}
          onPress={() => setFiltroAtivo('todas')}
        >
          <Text style={[
            styles.filtroText,
            filtroAtivo === 'todas' && styles.filtroTextoAtivo
          ]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filtroButton,
            filtroAtivo === 'naoLidas' && styles.filtroAtivo
          ]}
          onPress={() => setFiltroAtivo('naoLidas')}
        >
          <Text style={[
            styles.filtroText,
            filtroAtivo === 'naoLidas' && styles.filtroTextoAtivo
          ]}>
            Não Lidas {estatisticas.naoLidas > 0 && `(${estatisticas.naoLidas})`}
          </Text>
        </TouchableOpacity>
      </View>
      
      {estatisticas.naoLidas > 0 && (
        <TouchableOpacity
          style={styles.marcarTodasButton}
          onPress={marcarTodasComoLidas}
        >
          <Text style={styles.marcarTodasText}>Marcar todas como lidas</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notificacoes}
        renderItem={renderItemNotificacao}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filtroAtivo === 'naoLidas' ? 
                'Nenhuma notificação não lida' : 
                'Nenhuma notificação encontrada'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              As notificações aparecerão aqui quando os limites de estoque forem atingidos
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  estatisticasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  estatisticaItem: {
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filtrosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  filtroAtivo: {
    backgroundColor: '#007bff',
  },
  filtroText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filtroTextoAtivo: {
    color: '#fff',
  },
  marcarTodasButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  marcarTodasText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoIcone: {
    fontSize: 20,
    marginRight: 8,
  },
  tipoIndicador: {
    width: 4,
    height: 30,
    borderRadius: 2,
  },
  notificationContent: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  produtoMarca: {
    fontSize: 14,
    color: '#666',
  },
  localizacao: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  mensagem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataNotificacao: {
    fontSize: 12,
    color: '#666',
  },
  quantidadeInfo: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default NotificacoesScreen;
