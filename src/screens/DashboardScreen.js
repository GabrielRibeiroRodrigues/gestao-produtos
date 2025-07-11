import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { 
  obterMetricasDashboard,
  obterProdutosMaisMovimentados,
  obterGraficoMovimentacoesDiarias
} from '../services/estoque';

const DashboardScreen = ({ navigation }) => {
  const { currentSubsetorId, currentSubsetor } = useAuth();
  const [metricas, setMetricas] = useState({});
  const [produtosMaisMovimentados, setProdutosMaisMovimentados] = useState([]);
  const [graficoMovimentacoes, setGraficoMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      // Carregar métricas principais
      const metricasData = obterMetricasDashboard(currentSubsetorId);
      setMetricas(metricasData);

      // Carregar produtos mais movimentados
      const produtosMovimentados = obterProdutosMaisMovimentados(5, currentSubsetorId);
      setProdutosMaisMovimentados(produtosMovimentados);

      // Carregar dados do gráfico
      const dadosGrafico = obterGraficoMovimentacoesDiarias(currentSubsetorId);
      setGraficoMovimentacoes(dadosGrafico);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [currentSubsetorId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const renderMetricCard = (title, value, color, icon, onPress) => (
    <TouchableOpacity 
      style={[styles.metricCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );

  const renderProdutoMovimentado = (produto, index) => (
    <View key={index} style={styles.produtoCard}>
      <View style={styles.produtoHeader}>
        <Text style={styles.produtoNome}>{produto.produto_nome}</Text>
        <Text style={styles.produtoMarca}>{produto.marca}</Text>
      </View>
      <View style={styles.produtoStats}>
        <Text style={styles.produtoStat}>Movimentações: {produto.total_movimentacoes}</Text>
        <Text style={styles.produtoStat}>Quantidade: {produto.quantidade_total_movimentada}</Text>
        <Text style={styles.produtoStat}>Valor: {formatarValor(produto.valor_total_movimentado)}</Text>
      </View>
    </View>
  );

  const renderGraficoSimples = () => {
    if (graficoMovimentacoes.length === 0) {
      return (
        <View style={styles.graficoEmpty}>
          <Text style={styles.graficoEmptyText}>Sem dados para exibir</Text>
        </View>
      );
    }

    const maxValue = Math.max(...graficoMovimentacoes.map(item => item.quantidade_movimentacoes));
    const screenWidth = Dimensions.get('window').width - 60;

    return (
      <View style={styles.graficoContainer}>
        {graficoMovimentacoes.slice(0, 7).reverse().map((item, index) => {
          const height = maxValue > 0 ? (item.quantidade_movimentacoes / maxValue) * 100 : 0;
          const barWidth = (screenWidth / 7) - 10;
          
          return (
            <View key={index} style={styles.graficoBar}>
              <View style={styles.graficoBarContainer}>
                <View 
                  style={[
                    styles.graficoBarFill, 
                    { 
                      height: `${height}%`,
                      width: barWidth,
                      backgroundColor: height > 50 ? '#28a745' : height > 20 ? '#ffc107' : '#dc3545'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.graficoBarLabel}>
                {new Date(item.data).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </Text>
              <Text style={styles.graficoBarValue}>{item.quantidade_movimentacoes}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header com informações do subsetor */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        {currentSubsetor && (
          <Text style={styles.subtitle}>
            {currentSubsetor.nome_completo || currentSubsetor.nome}
          </Text>
        )}
      </View>

      {/* Cards de Métricas Principais */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          {renderMetricCard(
            'Total de Produtos',
            metricas.totalProdutos || 0,
            '#007bff',
            '📦',
            () => navigation.navigate('ListaProdutos')
          )}
          {renderMetricCard(
            'Com Estoque',
            metricas.produtosComEstoque || 0,
            '#28a745',
            '✅',
            () => navigation.navigate('RelatorioEstoque')
          )}
        </View>
        
        <View style={styles.metricsRow}>
          {renderMetricCard(
            'Estoque Baixo',
            metricas.estoqueBaixo || 0,
            '#ffc107',
            '⚠️',
            () => navigation.navigate('RelatorioEstoque', { filtro: 'baixo' })
          )}
          {renderMetricCard(
            'Movim. Hoje',
            metricas.movimentacoesHoje || 0,
            '#6f42c1',
            '🔄',
            () => navigation.navigate('ListaMovimentacoes')
          )}
        </View>

        <View style={styles.metricsRow}>
          {renderMetricCard(
            'Pendentes',
            metricas.recebimentosPendentes || 0,
            '#dc3545',
            '⏳',
            () => navigation.navigate('ConfirmarRecebimento')
          )}
          {renderMetricCard(
            'Valor Estoque',
            formatarValor(metricas.valorTotalEstoque || 0),
            '#17a2b8',
            '💰',
            () => navigation.navigate('RelatorioEstoque')
          )}
        </View>
      </View>

      {/* Gráfico Simples de Movimentações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Movimentações (Últimos 7 dias)</Text>
        {renderGraficoSimples()}
      </View>

      {/* Produtos Mais Movimentados */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produtos Mais Movimentados</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('RelatorioProdutos')}
            style={styles.sectionButton}
          >
            <Text style={styles.sectionButtonText}>Ver Todos</Text>
          </TouchableOpacity>
        </View>
        
        {produtosMaisMovimentados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma movimentação encontrada</Text>
          </View>
        ) : (
          produtosMaisMovimentados.map((produto, index) => 
            renderProdutoMovimentado(produto, index)
          )
        )}
      </View>

      {/* Botões de Ação Rápida */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            onPress={() => navigation.navigate('CadastroProduto')}
          >
            <Text style={styles.actionButtonIcon}>📦</Text>
            <Text style={styles.actionButtonText}>Cadastrar Produto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ffc107' }]}
            onPress={() => navigation.navigate('MovimentacaoProduto')}
          >
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.actionButtonText}>Movimentar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
            onPress={() => navigation.navigate('RelatoriosCompletos')}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  metricsContainer: {
    padding: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sectionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  graficoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 10,
  },
  graficoBar: {
    alignItems: 'center',
    flex: 1,
  },
  graficoBarContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  graficoBarFill: {
    borderRadius: 4,
    minHeight: 4,
  },
  graficoBarLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  graficoBarValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  graficoEmpty: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graficoEmptyText: {
    color: '#666',
    fontSize: 14,
  },
  produtoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  produtoHeader: {
    marginBottom: 8,
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
  produtoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  produtoStat: {
    fontSize: 12,
    color: '#555',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DashboardScreen;
