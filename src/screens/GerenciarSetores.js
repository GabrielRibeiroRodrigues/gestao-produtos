import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import DropDown from '../components/DropDown';
import { getAllRows, executeQuery, getFirstRow } from '../database/database';
import { 
  obterSetoresSuper, 
  obterSetores, 
  obterSubsetores,
  adicionarSetorSuper,
  adicionarSetor,
  adicionarSubsetor
} from '../services/estoque';

const GerenciarSetores = ({ navigation }) => {
  const [setoresSuper, setSetoresSuper] = useState([]);
  const [setores, setSetores] = useState([]);
  const [subsetores, setSubsetores] = useState([]);
  
  // Estados para modais
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(''); // 'super', 'setor', 'subsetor'
  const [novoItemNome, setNovoItemNome] = useState('');
  const [setorSuperSelecionado, setSetorSuperSelecionado] = useState(null);
  const [setorSelecionado, setSetorSelecionado] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    try {
      // Carregar setores super
      const setoresSuperArray = obterSetoresSuper();
      setSetoresSuper(setoresSuperArray);

      // Carregar setores
      const setoresArray = obterSetores();
      setSetores(setoresArray);

      // Carregar subsetores
      const subsetoresArray = obterSubsetores();
      setSubsetores(subsetoresArray);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    }
  };

  const abrirModal = (tipo) => {
    setModalTipo(tipo);
    setNovoItemNome('');
    setModalVisible(true);
  };

  const adicionarSetorSuperLocal = () => {
    if (!novoItemNome.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome válido');
      return;
    }

    try {
      adicionarSetorSuper(novoItemNome.trim());
      Alert.alert('Sucesso', 'Setor Super adicionado com sucesso!');
      setModalVisible(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar setor super:', error);
      if (error.message.includes('já existe')) {
        Alert.alert('Aviso', 'Este setor super já existe!');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o setor super');
      }
    }
  };

  const adicionarSetorLocal = () => {
    if (!novoItemNome.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome válido');
      return;
    }

    if (!setorSuperSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um setor super');
      return;
    }

    try {
      adicionarSetor(novoItemNome.trim(), setorSuperSelecionado);
      Alert.alert('Sucesso', 'Setor adicionado com sucesso!');
      setModalVisible(false);
      setSetorSuperSelecionado(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar setor:', error);
      if (error.message.includes('já existe')) {
        Alert.alert('Aviso', 'Este setor já existe neste setor super!');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o setor');
      }
    }
  };

  const adicionarSubsetorLocal = () => {
    if (!novoItemNome.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome válido');
      return;
    }

    if (!setorSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um setor');
      return;
    }

    try {
      adicionarSubsetor(novoItemNome.trim(), setorSelecionado);
      Alert.alert('Sucesso', 'Subsetor adicionado com sucesso!');
      setModalVisible(false);
      setSetorSelecionado(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar subsetor:', error);
      if (error.message.includes('já existe')) {
        Alert.alert('Aviso', 'Este subsetor já existe neste setor!');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o subsetor');
      }
    }
  };

  const confirmarAdicao = () => {
    switch (modalTipo) {
      case 'super':
        adicionarSetorSuperLocal();
        break;
      case 'setor':
        adicionarSetorLocal();
        break;
      case 'subsetor':
        adicionarSubsetorLocal();
        break;
    }
  };

  const excluirItem = (tipo, id, nome) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${nome}"?\n\nAtenção: Isso pode afetar registros relacionados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            try {
              let tabela = '';
              switch (tipo) {
                case 'super':
                  tabela = 'SetorSuper';
                  break;
                case 'setor':
                  tabela = 'Setor';
                  break;
                case 'subsetor':
                  tabela = 'SetorSub';
                  break;
              }
              
              executeQuery(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
              Alert.alert('Sucesso', 'Item excluído com sucesso!');
              carregarDados();
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o item. Pode haver registros relacionados.');
            }
          }
        }
      ]
    );
  };

  const renderSetorSuper = (item) => (
    <View key={item.id} style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => excluirItem('super', item.id, item.nome)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSetor = (item) => (
    <View key={item.id} style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text style={styles.itemSubtitle}>({item.super_setor_nome})</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => excluirItem('setor', item.id, item.nome)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSubsetor = (item) => (
    <View key={item.id} style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text style={styles.itemSubtitle}>
          {item.super_setor_nome} {'>'}  {item.setor_nome}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => excluirItem('subsetor', item.id, item.nome)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Gerenciar Setores</Text>

        {/* Setores Super */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Setores Super</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => abrirModal('super')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {setoresSuper.map(renderSetorSuper)}
        </View>

        {/* Setores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Setores</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => abrirModal('setor')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {setores.map(renderSetor)}
        </View>

        {/* Subsetores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subsetores</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => abrirModal('subsetor')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {subsetores.map(renderSubsetor)}
        </View>
      </ScrollView>

      {/* Modal para adicionar novos itens */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalTipo === 'super' && 'Novo Setor Super'}
              {modalTipo === 'setor' && 'Novo Setor'}
              {modalTipo === 'subsetor' && 'Novo Subsetor'}
            </Text>

            <Text style={styles.modalLabel}>Nome:</Text>
            <TextInput
              style={styles.modalInput}
              value={novoItemNome}
              onChangeText={setNovoItemNome}
              placeholder="Digite o nome..."
              autoFocus={true}
            />

            {modalTipo === 'setor' && (
              <>
                <Text style={styles.modalLabel}>Setor Super:</Text>
                <DropDown
                  data={setoresSuper}
                  value={setorSuperSelecionado}
                  onSelect={(item) => setSetorSuperSelecionado(item.id)}
                  placeholder="Selecione um setor super"
                />
              </>
            )}

            {modalTipo === 'subsetor' && (
              <>
                <Text style={styles.modalLabel}>Setor:</Text>
                <DropDown
                  data={setores.map(setor => ({
                    ...setor,
                    nome: `${setor.super_setor_nome} > ${setor.nome}`
                  }))}
                  value={setorSelecionado}
                  onSelect={(item) => setSetorSelecionado(item.id)}
                  placeholder="Selecione um setor"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSetorSuperSelecionado(null);
                  setSetorSelecionado(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmarAdicao}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
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
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GerenciarSetores;
