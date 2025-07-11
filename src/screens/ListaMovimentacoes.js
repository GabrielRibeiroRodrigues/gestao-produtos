import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import database, { getAllRows } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';

const ListaMovimentacoes = ({ navigation }) => {
  const { fixedSubsetorId } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarMovimentacoes = async () => {
    try {
      setLoading(true);
      const movimentacoesArray = getAllRows(
        `SELECT 
          mp.id,
          mp.data_hora_movimentacao,
          ss_origem.nome as subsetor_origem,
          ss_destino.nome as subsetor_destino,
          t.transacao,
          p.nome as produto_nome,
          m.nome as marca,
          pmi.qtde,
          pmi.preco_saida,
          pmi.valor_desconto,
          pmi.status,
          pmi.observacao_recusa
        FROM MovimentacaoProduto mp
        JOIN SetorSub ss_origem ON mp.subsetor_origem_id = ss_origem.id
        JOIN SetorSub ss_destino ON mp.subsetor_destino_id = ss_destino.id
        JOIN Transacao t ON mp.transacao_id = t.id
        JOIN ProdutoMovimentoItem pmi ON mp.id = pmi.movimentacao_produto_id
        JOIN DetalheProduto dp ON pmi.produto_id = dp.id
        JOIN Produto p ON dp.produto_id = p.id
        JOIN Marca m ON p.marca_id = m.id
        WHERE mp.subsetor_origem_id = ? OR mp.subsetor_destino_id = ?
        ORDER BY mp.data_hora_movimentacao DESC`,
        [fixedSubsetorId, fixedSubsetorId]
      );
      
      setMovimentacoes(movimentacoesArray);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarMovimentacoes();
    }, [fixedSubsetorId])
  );

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return '#ffc107';
      case 'Confirmado':
        return '#28a745';
      case 'Recusado':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getTipoMovimentacao = (subsetorOrigem, subsetorDestino) => {
    if (subsetorOrigem === 'Horta') {
      return { tipo: 'Saída', cor: '#dc3545' };
    } else if (subsetorDestino === 'Horta') {
      return { tipo: 'Entrada', cor: '#28a745' };
    } else {
      return { tipo: 'Transferência', cor: '#007bff' };
    }
  };

  const renderMovimentacao = ({ item }) => {
    const tipoMovimentacao = getTipoMovimentacao(item.subsetor_origem, item.subsetor_destino);
    
    return (
      <View style={styles.movimentacaoCard}>
        <View style={styles.movimentacaoHeader}>
          <View style={[styles.tipoIndicator, { backgroundColor: tipoMovimentacao.cor }]}>
            <Text style={styles.tipoText}>{tipoMovimentacao.tipo}</Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.produtoNome}>{item.produto_nome} - {item.marca}</Text>
        <Text style={styles.dataMovimentacao}>{formatarData(item.data_hora_movimentacao)}</Text>

        <View style={styles.movimentacaoDetalhes}>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Origem:</Text>
            <Text style={styles.detalheValor}>{item.subsetor_origem}</Text>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Destino:</Text>
            <Text style={styles.detalheValor}>{item.subsetor_destino}</Text>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Tipo:</Text>
            <Text style={styles.detalheValor}>{item.transacao}</Text>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Quantidade:</Text>
            <Text style={styles.detalheValor}>{item.qtde}</Text>
          </View>
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Preço:</Text>
            <Text style={styles.detalheValor}>R$ {parseFloat(item.preco_saida).toFixed(2)}</Text>
          </View>
          {item.valor_desconto > 0 && (
            <View style={styles.detalheRow}>
              <Text style={styles.detalheLabel}>Desconto:</Text>
              <Text style={styles.detalheValor}>R$ {parseFloat(item.valor_desconto).toFixed(2)}</Text>
            </View>
          )}
        </View>

        {item.observacao_recusa && (
          <View style={styles.observacaoContainer}>
            <Text style={styles.observacaoLabel}>Observação de Recusa:</Text>
            <Text style={styles.observacaoTexto}>{item.observacao_recusa}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Carregando movimentações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Movimentações</Text>
      
      {movimentacoes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Nenhuma movimentação encontrada</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('MovimentacaoProduto')}
          >
            <Text style={styles.addButtonText}>Realizar Primeira Movimentação</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movimentacoes}
          renderItem={renderMovimentacao}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('MovimentacaoProduto')}
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
  movimentacaoCard: {
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
  movimentacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tipoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dataMovimentacao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  movimentacaoDetalhes: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  detalheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detalheLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  detalheValor: {
    fontSize: 14,
    color: '#333',
  },
  observacaoContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  observacaoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  observacaoTexto: {
    fontSize: 12,
    color: '#856404',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffc107',
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
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ListaMovimentacoes;

