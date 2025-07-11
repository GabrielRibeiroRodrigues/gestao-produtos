import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { obterProdutosComEstoque, obterTodosProdutos } from '../services/estoque';
import { debugDatabase } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';

const ListaProdutos = ({ navigation }) => {
  const { fixedSubsetorId } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(true); // Novo estado para controlar visualização

  const carregarProdutos = () => {
    try {
      setLoading(true);
      
      // Debug do banco de dados
      debugDatabase();
      
      const produtosList = mostrarTodos 
        ? obterTodosProdutos(fixedSubsetorId)
        : obterProdutosComEstoque(fixedSubsetorId);
      
      console.log('Produtos carregados:', produtosList.length);
      setProdutos(produtosList);
      setProdutosFiltrados(produtosList);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [fixedSubsetorId, mostrarTodos]) // Adicionar mostrarTodos como dependência
  );

  useEffect(() => {
    if (filtro.trim() === '') {
      setProdutosFiltrados(produtos);
    } else {
      const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        produto.marca.toLowerCase().includes(filtro.toLowerCase()) ||
        produto.fabricante.toLowerCase().includes(filtro.toLowerCase())
      );
      setProdutosFiltrados(produtosFiltrados);
    }
  }, [filtro, produtos]);

  const renderProduto = ({ item }) => (
    <View style={styles.produtoCard}>
      <View style={styles.produtoHeader}>
        <Text style={styles.produtoNome}>{item.nome}</Text>
        <Text style={styles.produtoQuantidade}>Qtd: {item.quantidade}</Text>
      </View>
      
      <View style={styles.produtoDetalhes}>
        <Text style={styles.produtoInfo}>Marca: {item.marca}</Text>
        <Text style={styles.produtoInfo}>Modelo: {item.modelo}</Text>
        <Text style={styles.produtoInfo}>Fabricante: {item.fabricante}</Text>
        {item.cor && <Text style={styles.produtoInfo}>Cor: {item.cor}</Text>}
        {item.sabor && <Text style={styles.produtoInfo}>Sabor: {item.sabor}</Text>}
      </View>
      
      <View style={styles.produtoPrecos}>
        <Text style={styles.precoCusto}>Custo: R$ {parseFloat(item.preco_custo).toFixed(2)}</Text>
        <Text style={styles.precoVenda}>Venda: R$ {parseFloat(item.preco_venda).toFixed(2)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Produtos</Text>
      
      {/* Botões de filtro */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, mostrarTodos && styles.filterButtonActive]}
          onPress={() => setMostrarTodos(true)}
        >
          <Text style={[styles.filterButtonText, mostrarTodos && styles.filterButtonTextActive]}>
            Todos os Produtos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, !mostrarTodos && styles.filterButtonActive]}
          onPress={() => setMostrarTodos(false)}
        >
          <Text style={[styles.filterButtonText, !mostrarTodos && styles.filterButtonTextActive]}>
            Apenas com Estoque
          </Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.filtroInput}
        placeholder="Filtrar por nome, marca ou fabricante..."
        value={filtro}
        onChangeText={setFiltro}
      />

      {produtosFiltrados.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {filtro ? 'Nenhum produto encontrado com o filtro aplicado' : 'Nenhum produto em estoque'}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CadastroProduto')}
          >
            <Text style={styles.addButtonText}>Cadastrar Primeiro Produto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={produtosFiltrados}
          renderItem={renderProduto}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CadastroProduto')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filtroInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 80,
  },
  produtoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  produtoQuantidade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  produtoDetalhes: {
    marginBottom: 8,
  },
  produtoInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  produtoPrecos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  precoCusto: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  precoVenda: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#28a745',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ListaProdutos;

