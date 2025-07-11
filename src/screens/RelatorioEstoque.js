import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { obterRelatorioEstoque } from '../services/estoque';

const RelatorioEstoque = ({ navigation, route }) => {
  const { currentSubsetorId, currentSubsetor } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState(route.params?.filtro || 'todos');

  const carregarProdutos = () => {
    try {
      setLoading(true);
      const produtosList = obterRelatorioEstoque(currentSubsetorId);
      setProdutos(produtosList);
      aplicarFiltros(produtosList, filtroAtivo, filtro);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (produtosList, tipoFiltro, textoFiltro) => {
    let produtosFiltrados = [...produtosList];

    // Aplicar filtro por tipo
    switch (tipoFiltro) {
      case 'baixo':
        produtosFiltrados = produtosFiltrados.filter(p => p.quantidade < 5);
        break;
      case 'zero':
        produtosFiltrados = produtosFiltrados.filter(p => p.quantidade === 0);
        break;
      case 'alto':
        produtosFiltrados = produtosFiltrados.filter(p => p.quantidade >= 20);
        break;
      default:
        break;
    }

    // Aplicar filtro de texto
    if (textoFiltro.trim()) {
      produtosFiltrados = produtosFiltrados.filter(produto =>
        produto.produto_nome.toLowerCase().includes(textoFiltro.toLowerCase()) ||
        produto.marca.toLowerCase().includes(textoFiltro.toLowerCase()) ||
        produto.fabricante.toLowerCase().includes(textoFiltro.toLowerCase())
      );
    }

    setProdutosFiltrados(produtosFiltrados);
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarProdutos();
    }, [currentSubsetorId])
  );

  useEffect(() => {
    aplicarFiltros(produtos, filtroAtivo, filtro);
  }, [filtro, filtroAtivo, produtos]);

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getQuantidadeColor = (quantidade) => {
    if (quantidade === 0) return '#dc3545';
    if (quantidade < 5) return '#ffc107';
    if (quantidade < 10) return '#fd7e14';
    return '#28a745';
  };

  const calcularResumo = () => {
    const total = produtosFiltrados.length;
    const valorTotalCusto = produtosFiltrados.reduce((sum, item) => sum + item.valor_custo_total, 0);
    const valorTotalVenda = produtosFiltrados.reduce((sum, item) => sum + item.valor_venda_total, 0);
    const quantidadeTotal = produtosFiltrados.reduce((sum, item) => sum + item.quantidade, 0);

    return { total, valorTotalCusto, valorTotalVenda, quantidadeTotal };
  };

  const renderProduto = ({ item }) => (
    <View style={styles.produtoCard}>
      <View style={styles.produtoHeader}>
        <View style={styles.produtoInfo}>
          <Text style={styles.produtoNome}>{item.produto_nome}</Text>
          <Text style={styles.produtoMarca}>{item.marca} - {item.modelo}</Text>
          <Text style={styles.produtoFabricante}>{item.fabricante}</Text>
        </View>
        <View style={styles.quantidadeContainer}>
          <Text style={[styles.quantidade, { color: getQuantidadeColor(item.quantidade) }]}>
            {item.quantidade}
          </Text>
          <Text style={styles.quantidadeLabel}>unidades</Text>
        </View>
      </View>
      
      {(item.cor || item.sabor) && (
        <View style={styles.detalhesContainer}>
          {item.cor && <Text style={styles.detalhe}>Cor: {item.cor}</Text>}
          {item.sabor && <Text style={styles.detalhe}>Sabor: {item.sabor}</Text>}
        </View>
      )}

      <View style={styles.valoresContainer}>
        <View style={styles.valorItem}>
          <Text style={styles.valorLabel}>Custo Unit.</Text>
          <Text style={styles.valorCusto}>{formatarValor(item.preco_custo)}</Text>
        </View>
        <View style={styles.valorItem}>
          <Text style={styles.valorLabel}>Venda Unit.</Text>
          <Text style={styles.valorVenda}>{formatarValor(item.preco_venda)}</Text>
        </View>
        <View style={styles.valorItem}>
          <Text style={styles.valorLabel}>Total Custo</Text>
          <Text style={styles.valorTotalCusto}>{formatarValor(item.valor_custo_total)}</Text>
        </View>
      </View>

      <View style={styles.localizacaoContainer}>
        <Text style={styles.localizacao}>
          📍 {item.super_setor_nome} {'>'} {item.setor_nome} {'>'} {item.subsetor_nome}
        </Text>
      </View>
    </View>
  );

  const renderFiltroButton = (key, label, isActive) => (
    <TouchableOpacity
      key={key}
      style={[styles.filtroButton, isActive && styles.filtroButtonActive]}
      onPress={() => setFiltroAtivo(key)}
    >
      <Text style={[styles.filtroButtonText, isActive && styles.filtroButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const resumo = calcularResumo();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando estoque...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Estoque</Text>
        {currentSubsetor && (
          <Text style={styles.subtitle}>
            {currentSubsetor.nome_completo || currentSubsetor.nome}
          </Text>
        )}
      </View>

      {/* Resumo */}
      <View style={styles.resumoContainer}>
        <View style={styles.resumoRow}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValor}>{resumo.total}</Text>
            <Text style={styles.resumoLabel}>Produtos</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValor}>{resumo.quantidadeTotal}</Text>
            <Text style={styles.resumoLabel}>Itens</Text>
          </View>
        </View>
        <View style={styles.resumoRow}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValor}>{formatarValor(resumo.valorTotalCusto)}</Text>
            <Text style={styles.resumoLabel}>Valor Custo</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoValor}>{formatarValor(resumo.valorTotalVenda)}</Text>
            <Text style={styles.resumoLabel}>Valor Venda</Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.filtroButtonsContainer}>
          {renderFiltroButton('todos', 'Todos', filtroAtivo === 'todos')}
          {renderFiltroButton('baixo', 'Est. Baixo', filtroAtivo === 'baixo')}
          {renderFiltroButton('zero', 'Sem Estoque', filtroAtivo === 'zero')}
          {renderFiltroButton('alto', 'Est. Alto', filtroAtivo === 'alto')}
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, marca ou fabricante..."
          value={filtro}
          onChangeText={setFiltro}
        />
      </View>

      {/* Lista de Produtos */}
      {produtosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filtro || filtroAtivo !== 'todos' 
              ? 'Nenhum produto encontrado com os filtros aplicados' 
              : 'Nenhum produto em estoque'
            }
          </Text>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setFiltro('');
              setFiltroAtivo('todos');
            }}
          >
            <Text style={styles.clearFiltersButtonText}>Limpar Filtros</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={produtosFiltrados}
          renderItem={renderProduto}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Botão Flutuante para Relatórios Completos */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('RelatoriosCompletos')}
      >
        <Text style={styles.floatingButtonText}>📊</Text>
      </TouchableOpacity>
    </View>
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
    fontSize: 24,
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
  resumoContainer: {
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
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  resumoItem: {
    alignItems: 'center',
  },
  resumoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtroButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  filtroButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filtroButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filtroButtonTextActive: {
    color: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  produtoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  produtoMarca: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  produtoFabricante: {
    fontSize: 12,
    color: '#999',
  },
  quantidadeContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  quantidade: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantidadeLabel: {
    fontSize: 10,
    color: '#666',
  },
  detalhesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detalhe: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
  },
  valoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  valorItem: {
    alignItems: 'center',
  },
  valorLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  valorCusto: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  valorVenda: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: 'bold',
  },
  valorTotalCusto: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: 'bold',
  },
  localizacaoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
  },
  localizacao: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingButtonText: {
    fontSize: 24,
  },
});

export default RelatorioEstoque;
