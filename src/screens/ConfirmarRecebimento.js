import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import database, { getAllRows, executeQuery } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';

const ConfirmarRecebimento = ({ navigation }) => {
  const { fixedSubsetorId } = useAuth();
  const [movimentacoesPendentes, setMovimentacoesPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [observacaoRecusa, setObservacaoRecusa] = useState('');

  const carregarMovimentacoesPendentes = async () => {
    try {
      setLoading(true);
      const movimentacoesArray = getAllRows(
        `SELECT 
          mp.id as movimentacao_id,
          pmi.id as item_id,
          mp.data_hora_movimentacao,
          ss_origem.nome as subsetor_origem,
          t.transacao,
          p.nome as produto_nome,
          m.nome as marca,
          dp.cor,
          dp.sabor,
          pmi.qtde,
          pmi.preco_saida,
          pmi.valor_desconto,
          pmi.status
        FROM MovimentacaoProduto mp
        JOIN SetorSub ss_origem ON mp.subsetor_origem_id = ss_origem.id
        JOIN Transacao t ON mp.transacao_id = t.id
        JOIN ProdutoMovimentoItem pmi ON mp.id = pmi.movimentacao_produto_id
        JOIN DetalheProduto dp ON pmi.produto_id = dp.id
        JOIN Produto p ON dp.produto_id = p.id
        JOIN Marca m ON p.marca_id = m.id
        WHERE mp.subsetor_destino_id = ? AND pmi.status = 'Pendente'
        ORDER BY mp.data_hora_movimentacao DESC`,
        [fixedSubsetorId]
      );
      
      setMovimentacoesPendentes(movimentacoesArray);
    } catch (error) {
      console.error('Erro ao carregar movimentações pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarMovimentacoesPendentes();
    }, [fixedSubsetorId])
  );

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  const confirmarRecebimento = (item) => {
    Alert.alert(
      'Confirmar Recebimento',
      `Confirmar o recebimento de ${item.qtde} unidades de ${item.produto_nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => atualizarStatusItem(item.item_id, 'Confirmado') }
      ]
    );
  };

  const recusarRecebimento = (item) => {
    setItemSelecionado(item);
    setObservacaoRecusa('');
    setModalVisible(true);
  };

  const confirmarRecusa = () => {
    if (!observacaoRecusa.trim()) {
      Alert.alert('Erro', 'Por favor, informe o motivo da recusa');
      return;
    }
    
    atualizarStatusItem(itemSelecionado.item_id, 'Recusado', observacaoRecusa);
    setModalVisible(false);
    setItemSelecionado(null);
    setObservacaoRecusa('');
  };

  const atualizarStatusItem = (itemId, novoStatus, observacao = null) => {
    try {
      const query = observacao 
        ? 'UPDATE ProdutoMovimentoItem SET status = ?, observacao_recusa = ? WHERE id = ?'
        : 'UPDATE ProdutoMovimentoItem SET status = ? WHERE id = ?';
      
      const params = observacao 
        ? [novoStatus, observacao, itemId]
        : [novoStatus, itemId];

      executeQuery(query, params);
      
      const mensagem = novoStatus === 'Confirmado' 
        ? 'Recebimento confirmado com sucesso!'
        : 'Recebimento recusado com sucesso!';
      
      Alert.alert('Sucesso', mensagem);
      carregarMovimentacoesPendentes(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    }
  };

  const renderMovimentacao = ({ item }) => (
    <View style={styles.movimentacaoCard}>
      <View style={styles.movimentacaoHeader}>
        <Text style={styles.produtoNome}>{item.produto_nome} - {item.marca}</Text>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.dataMovimentacao}>{formatarData(item.data_hora_movimentacao)}</Text>

      <View style={styles.movimentacaoDetalhes}>
        <View style={styles.detalheRow}>
          <Text style={styles.detalheLabel}>Origem:</Text>
          <Text style={styles.detalheValor}>{item.subsetor_origem}</Text>
        </View>
        <View style={styles.detalheRow}>
          <Text style={styles.detalheLabel}>Tipo:</Text>
          <Text style={styles.detalheValor}>{item.transacao}</Text>
        </View>
        <View style={styles.detalheRow}>
          <Text style={styles.detalheLabel}>Quantidade:</Text>
          <Text style={styles.detalheValor}>{item.qtde}</Text>
        </View>
        {item.cor && (
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Cor:</Text>
            <Text style={styles.detalheValor}>{item.cor}</Text>
          </View>
        )}
        {item.sabor && (
          <View style={styles.detalheRow}>
            <Text style={styles.detalheLabel}>Sabor:</Text>
            <Text style={styles.detalheValor}>{item.sabor}</Text>
          </View>
        )}
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

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={styles.botaoConfirmar}
          onPress={() => confirmarRecebimento(item)}
        >
          <Text style={styles.botaoTexto}>✓ Confirmar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.botaoRecusar}
          onPress={() => recusarRecebimento(item)}
        >
          <Text style={styles.botaoTexto}>✗ Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Carregando movimentações pendentes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Recebimento</Text>
      
      {movimentacoesPendentes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Nenhuma movimentação pendente para confirmação</Text>
        </View>
      ) : (
        <FlatList
          data={movimentacoesPendentes}
          renderItem={renderMovimentacao}
          keyExtractor={(item) => item.item_id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal para observação de recusa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Motivo da Recusa</Text>
            
            <TextInput
              style={styles.observacaoInput}
              placeholder="Digite o motivo da recusa..."
              value={observacaoRecusa}
              onChangeText={setObservacaoRecusa}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.modalBotaoCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBotaoTexto}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalBotaoConfirmar}
                onPress={confirmarRecusa}
              >
                <Text style={styles.modalBotaoTexto}>Confirmar Recusa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  listContainer: {
    paddingBottom: 20,
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
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusIndicator: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 16,
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
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoConfirmar: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  botaoRecusar: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  observacaoInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 100,
    marginBottom: 16,
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBotaoCancelar: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  modalBotaoConfirmar: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  modalBotaoTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ConfirmarRecebimento;

