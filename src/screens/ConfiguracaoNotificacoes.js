import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obterTodosProdutos, obterSetoresSuper, obterSetores, obterSubsetores } from '../services/estoque';
import {
  configurarNotificacaoProduto,
  obterConfiguracaoNotificacao,
  obterTodasConfiguracoes,
  alterarStatusNotificacao,
  solicitarPermissaoNotificacao
} from '../services/notificacao';
import DropDown from '../components/DropDown';

const ConfiguracaoNotificacoes = ({ navigation }) => {
  const [configuracoes, setConfiguracoes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados para novo produto
  const [produtos, setProdutos] = useState([]);
  const [setoresSuper, setSetoresSuper] = useState([]);
  const [setores, setSetores] = useState([]);
  const [subsetores, setSubsetores] = useState([]);
  
  // Estados de seleção
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [superSetorSelecionado, setSuperSetorSelecionado] = useState(null);
  const [setorSelecionado, setSetorSelecionado] = useState(null);
  const [subsetorSelecionado, setSubsetorSelecionado] = useState(null);
  
  // Estados de configuração
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [estoqueMaximo, setEstoqueMaximo] = useState('');

  useFocusEffect(
    useCallback(() => {
      carregarConfiguracoes();
      solicitarPermissaoNotificacao();
    }, [])
  );

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const configs = obterTodasConfiguracoes();
      setConfiguracoes(configs);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarConfiguracoes().finally(() => setRefreshing(false));
  }, []);

  const carregarDadosModal = async () => {
    try {
      // Carregar produtos
      const produtosData = obterTodosProdutos();
      setProdutos(produtosData);
      
      // Carregar setores
      const setoresSuperData = obterSetoresSuper();
      setSetoresSuper(setoresSuperData);
      
    } catch (error) {
      console.error('Erro ao carregar dados do modal:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    }
  };

  const handleSuperSetorChange = (superSetorId) => {
    setSuperSetorSelecionado(superSetorId);
    setSetorSelecionado(null);
    setSubsetorSelecionado(null);
    
    if (superSetorId) {
      const setoresData = obterSetores(superSetorId);
      setSetores(setoresData);
    } else {
      setSetores([]);
    }
    setSubsetores([]);
  };

  const handleSetorChange = (setorId) => {
    setSetorSelecionado(setorId);
    setSubsetorSelecionado(null);
    
    if (setorId) {
      const subsetoresData = obterSubsetores(setorId);
      setSubsetores(subsetoresData);
    } else {
      setSubsetores([]);
    }
  };

  const abrirModalNovaConfiguracao = () => {
    // Resetar estados
    setProdutoSelecionado(null);
    setSuperSetorSelecionado(null);
    setSetorSelecionado(null);
    setSubsetorSelecionado(null);
    setEstoqueMinimo('');
    setEstoqueMaximo('');
    
    carregarDadosModal();
    setModalVisible(true);
  };

  const salvarConfiguracao = async () => {
    try {
      if (!produtoSelecionado || !subsetorSelecionado || !estoqueMinimo) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
        return;
      }

      const minimo = parseInt(estoqueMinimo);
      const maximo = estoqueMaximo ? parseInt(estoqueMaximo) : null;

      if (isNaN(minimo) || minimo < 0) {
        Alert.alert('Erro', 'Estoque mínimo deve ser um número válido');
        return;
      }

      if (maximo && (isNaN(maximo) || maximo <= minimo)) {
        Alert.alert('Erro', 'Estoque máximo deve ser maior que o mínimo');
        return;
      }

      await configurarNotificacaoProduto(produtoSelecionado, subsetorSelecionado, minimo, maximo);
      
      Alert.alert('Sucesso', 'Configuração salva com sucesso!');
      setModalVisible(false);
      carregarConfiguracoes();
      
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração');
    }
  };

  const alterarStatusConfig = async (produtoId, subsetorId, novoStatus) => {
    try {
      await alterarStatusNotificacao(produtoId, subsetorId, novoStatus);
      carregarConfiguracoes();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status da notificação');
    }
  };

  const confirmarExclusao = (item) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a configuração de notificação para "${item.produto_nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirConfiguracao(item) }
      ]
    );
  };

  const excluirConfiguracao = async (item) => {
    try {
      await alterarStatusNotificacao(item.produto_id, item.subsetor_id, false);
      carregarConfiguracoes();
      Alert.alert('Sucesso', 'Configuração removida com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      Alert.alert('Erro', 'Não foi possível excluir a configuração');
    }
  };

  const renderItemConfiguracao = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.produtoNome}>{item.produto_nome}</Text>
        <Switch
          value={item.notificacao_ativa === 1}
          onValueChange={(value) => alterarStatusConfig(item.produto_id, item.subsetor_id, value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.notificacao_ativa === 1 ? '#007bff' : '#f4f3f4'}
        />
      </View>
      
      <Text style={styles.itemSubtitle}>{item.marca}</Text>
      <Text style={styles.itemLocation}>{item.setor_nome} {' > '} {item.subsetor_nome}</Text>
      
      <View style={styles.itemLimites}>
        <Text style={styles.limiteTexto}>Mínimo: {item.estoque_minimo}</Text>
        {item.estoque_maximo && (
          <Text style={styles.limiteTexto}>Máximo: {item.estoque_maximo}</Text>
        )}
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.botaoEditar}
          onPress={() => {
            // Implementar edição
            setProdutoSelecionado(item.produto_id);
            setSubsetorSelecionado(item.subsetor_id);
            setEstoqueMinimo(item.estoque_minimo.toString());
            setEstoqueMaximo(item.estoque_maximo ? item.estoque_maximo.toString() : '');
            carregarDadosModal();
            setModalVisible(true);
          }}
        >
          <Text style={styles.botaoTexto}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botaoExcluir}
          onPress={() => confirmarExclusao(item)}
        >
          <Text style={styles.botaoTexto}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando configurações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações de Notificação</Text>
        <TouchableOpacity 
          style={styles.botaoAdicionar}
          onPress={abrirModalNovaConfiguracao}
        >
          <Text style={styles.botaoAdicionarTexto}>+ Nova Configuração</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={configuracoes}
        renderItem={renderItemConfiguracao}
        keyExtractor={(item) => `${item.produto_id}-${item.subsetor_id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma configuração encontrada</Text>
            <Text style={styles.emptySubtext}>Adicione uma nova configuração para começar</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Configurar Notificação</Text>
              
              <Text style={styles.label}>Produto *</Text>
              <DropDown
                data={produtos}
                onSelect={(item) => setProdutoSelecionado(item.id)}
                selectedValue={produtoSelecionado}
                placeholder="Selecione o produto"
                displayKey="nome"
                valueKey="id"
              />

              <Text style={styles.label}>Super Setor *</Text>
              <DropDown
                data={setoresSuper}
                onSelect={(item) => handleSuperSetorChange(item.id)}
                selectedValue={superSetorSelecionado}
                placeholder="Selecione o super setor"
                displayKey="nome"
                valueKey="id"
              />

              {setores.length > 0 && (
                <>
                  <Text style={styles.label}>Setor *</Text>
                  <DropDown
                    data={setores}
                    onSelect={(item) => handleSetorChange(item.id)}
                    selectedValue={setorSelecionado}
                    placeholder="Selecione o setor"
                    displayKey="nome"
                    valueKey="id"
                  />
                </>
              )}

              {subsetores.length > 0 && (
                <>
                  <Text style={styles.label}>Subsetor *</Text>
                  <DropDown
                    data={subsetores}
                    onSelect={(item) => setSubsetorSelecionado(item.id)}
                    selectedValue={subsetorSelecionado}
                    placeholder="Selecione o subsetor"
                    displayKey="nome"
                    valueKey="id"
                  />
                </>
              )}

              <Text style={styles.label}>Estoque Mínimo *</Text>
              <TextInput
                style={styles.input}
                value={estoqueMinimo}
                onChangeText={setEstoqueMinimo}
                placeholder="Digite o estoque mínimo"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Estoque Máximo (opcional)</Text>
              <TextInput
                style={styles.input}
                value={estoqueMaximo}
                onChangeText={setEstoqueMaximo}
                placeholder="Digite o estoque máximo"
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarConfiguracao}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  botaoAdicionar: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botaoAdicionarTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  itemLimites: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  limiteTexto: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  botaoEditar: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  botaoExcluir: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ConfiguracaoNotificacoes;
