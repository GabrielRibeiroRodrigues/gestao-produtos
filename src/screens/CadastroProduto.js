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
import Input from '../components/Input';
import DropDown from '../components/DropDown';
import database, { getAllRows, executeQuery, getFirstRow } from '../database/database';
import { useAuth } from '../context/AuthContext';
import { atualizarEstoque } from '../services/estoque';

const CadastroProduto = ({ navigation }) => {
  const { fixedSubsetorId } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: '',
    marca_id: null,
    modelo_id: null,
    fabricante_id: null,
    cor: '',
    sabor: '',
    quantidade_unidades: '',
    quantidade_embalagem: '',
    tipo_embalagem_id: null,
    preco_custo: '',
    preco_venda: '',
    estoque_inicial: '',
    gtin: '',
  });

  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [tiposEmbalagem, setTiposEmbalagem] = useState([]);

  // Estados para modal de entrada de texto
  const [modalVisible, setModalVisible] = useState(false);
  const [novoItemNome, setNovoItemNome] = useState('');
  const [tipoItemModal, setTipoItemModal] = useState('');
  const [tituloModal, setTituloModal] = useState('');

  useEffect(() => {
    carregarDadosAuxiliares();
  }, []);

  const carregarDadosAuxiliares = async () => {
    try {
      // Carregar marcas
      const marcasArray = getAllRows('SELECT * FROM Marca ORDER BY nome');
      setMarcas(marcasArray);

      // Carregar modelos
      const modelosArray = getAllRows('SELECT * FROM Modelo ORDER BY nome');
      setModelos(modelosArray);

      // Carregar fabricantes
      const fabricantesArray = getAllRows('SELECT * FROM Fabricante ORDER BY nome');
      setFabricantes(fabricantesArray);

      // Carregar tipos de embalagem
      const tiposArray = getAllRows('SELECT * FROM TipoEmbalagem ORDER BY nome');
      setTiposEmbalagem(tiposArray);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  };

  const handleScanGTIN = () => {
    navigation.navigate('ScannerScreen', {
      title: 'Escanear GTIN/Código de Barras',
      onScanResult: (data) => {
        setFormData({ ...formData, gtin: data });
        Alert.alert('Sucesso', `GTIN escaneado: ${data}`);
      }
    });
  };

  const adicionarNovoItem = async (tipo, nome) => {
    try {
      // Primeiro verificar se o item já existe
      const itemExistente = getFirstRow(
        `SELECT * FROM ${tipo} WHERE nome = ?`,
        [nome]
      );
      
      if (itemExistente) {
        // Item já existe, retornar o existente
        return itemExistente;
      }
      
      // Item não existe, criar novo
      const result = executeQuery(
        `INSERT INTO ${tipo} (nome) VALUES (?)`,
        [nome]
      );
      
      const novoItem = { id: result.lastInsertRowId, nome };
      return novoItem;
    } catch (error) {
      console.error(`Erro ao adicionar ${tipo}:`, error);
      throw error;
    }
  };

  const abrirModalNovoItem = (tipo, titulo) => {
    setTipoItemModal(tipo);
    setTituloModal(titulo);
    setNovoItemNome('');
    setModalVisible(true);
  };

  const confirmarNovoItem = async () => {
    if (!novoItemNome.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome válido');
      return;
    }

    const nomeFormatado = novoItemNome.trim();

    try {
      // Verificar se o item já existe na lista local primeiro
      let listaAtual = [];
      let jaExisteNaLista = false;

      switch (tipoItemModal) {
        case 'Marca':
          listaAtual = marcas;
          break;
        case 'Modelo':
          listaAtual = modelos;
          break;
        case 'Fabricante':
          listaAtual = fabricantes;
          break;
        case 'TipoEmbalagem':
          listaAtual = tiposEmbalagem;
          break;
      }

      jaExisteNaLista = listaAtual.some(item => 
        item.nome.toLowerCase() === nomeFormatado.toLowerCase()
      );

      if (jaExisteNaLista) {
        Alert.alert('Aviso', `${tipoItemModal} já existe na lista!`);
        return;
      }

      const novoItem = await adicionarNovoItem(tipoItemModal, nomeFormatado);
      
      // Verificar se o item retornado já existia no banco (mesmo ID que um item da lista)
      const jaExistiaNoBlanco = listaAtual.some(item => item.id === novoItem.id);
      
      // Atualizar o estado correspondente apenas se não existia na lista local
      if (!jaExistiaNoBlanco) {
        switch (tipoItemModal) {
          case 'Marca':
            setMarcas([...marcas, novoItem]);
            break;
          case 'Modelo':
            setModelos([...modelos, novoItem]);
            break;
          case 'Fabricante':
            setFabricantes([...fabricantes, novoItem]);
            break;
          case 'TipoEmbalagem':
            setTiposEmbalagem([...tiposEmbalagem, novoItem]);
            break;
        }
      }
      
      // Sempre definir o item selecionado
      setFormData({ 
        ...formData, 
        [`${tipoItemModal.toLowerCase() === 'tipoembalagem' ? 'tipo_embalagem' : tipoItemModal.toLowerCase()}_id`]: novoItem.id 
      });
      
      setModalVisible(false);
      
      if (jaExistiaNoBlanco) {
        Alert.alert('Aviso', `${tipoItemModal} já existia no banco de dados e foi selecionado!`);
      } else {
        Alert.alert('Sucesso', `${tipoItemModal} adicionado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao confirmar novo item:', error);
      Alert.alert('Erro', `Não foi possível adicionar o ${tipoItemModal.toLowerCase()}`);
    }
  };

  const handleAdicionarMarca = () => {
    abrirModalNovoItem('Marca', 'Nova Marca');
  };

  const handleAdicionarModelo = () => {
    abrirModalNovoItem('Modelo', 'Novo Modelo');
  };

  const handleAdicionarFabricante = () => {
    abrirModalNovoItem('Fabricante', 'Novo Fabricante');
  };

  const handleAdicionarTipoEmbalagem = () => {
    abrirModalNovoItem('TipoEmbalagem', 'Novo Tipo de Embalagem');
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return false;
    }
    if (!formData.marca_id) {
      Alert.alert('Erro', 'Marca é obrigatória');
      return false;
    }
    if (!formData.modelo_id) {
      Alert.alert('Erro', 'Modelo é obrigatório');
      return false;
    }
    if (!formData.fabricante_id) {
      Alert.alert('Erro', 'Fabricante é obrigatório');
      return false;
    }
    if (!formData.tipo_embalagem_id) {
      Alert.alert('Erro', 'Tipo de embalagem é obrigatório');
      return false;
    }
    if (!formData.preco_custo || parseFloat(formData.preco_custo) <= 0) {
      Alert.alert('Erro', 'Preço de custo deve ser maior que zero');
      return false;
    }
    if (!formData.preco_venda || parseFloat(formData.preco_venda) <= 0) {
      Alert.alert('Erro', 'Preço de venda deve ser maior que zero');
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    try {
      console.log('=== INICIANDO CADASTRO ===');
      console.log('Dados do formulário:', formData);
      
      // Inserir produto
      const produtoResult = executeQuery(
        'INSERT INTO Produto (nome, marca_id, modelo_id, fabricante_id) VALUES (?, ?, ?, ?)',
        [formData.nome, formData.marca_id, formData.modelo_id, formData.fabricante_id]
      );
      
      const produtoId = produtoResult.lastInsertRowId;
      console.log('Produto inserido com ID:', produtoId);
      
      // Inserir detalhes do produto
      const detalheResult = executeQuery(
        `INSERT INTO DetalheProduto 
         (produto_id, quantidade_unidades, cor, sabor, quantidade_embalagem, 
          tipo_embalagem_id, preco_custo, preco_venda) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          produtoId,
          parseInt(formData.quantidade_unidades) || 0,
          formData.cor,
          formData.sabor,
          parseInt(formData.quantidade_embalagem) || 0,
          formData.tipo_embalagem_id,
          parseFloat(formData.preco_custo),
          parseFloat(formData.preco_venda)
        ]
      );
      
      const detalheProdutoId = detalheResult.lastInsertRowId;
      console.log('Detalhe do produto inserido com ID:', detalheProdutoId);
      
      // Adicionar estoque inicial se especificado
      if (formData.estoque_inicial && parseInt(formData.estoque_inicial) > 0) {
        try {
          console.log('Adicionando estoque inicial:', formData.estoque_inicial);
          atualizarEstoque(
            detalheProdutoId,
            fixedSubsetorId,
            parseInt(formData.estoque_inicial),
            'adicionar'
          );
          console.log('Estoque inicial adicionado com sucesso');
        } catch (error) {
          console.error('Erro ao adicionar estoque inicial:', error);
        }
      }
      
      console.log('=== CADASTRO CONCLUÍDO ===');
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o produto');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Cadastro de Produto</Text>
      
      <Input
        label="Nome do Produto"
        value={formData.nome}
        onChangeText={(text) => setFormData({ ...formData, nome: text })}
        placeholder="Digite o nome do produto"
      />

      <View style={styles.gtinContainer}>
        <Input
          label="GTIN/Código de Barras"
          value={formData.gtin}
          onChangeText={(text) => setFormData({ ...formData, gtin: text })}
          placeholder="Digite ou escaneie o código"
        />
        <TouchableOpacity style={styles.scanButton} onPress={handleScanGTIN}>
          <Text style={styles.scanButtonText}>📷</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dropdownContainer}>
        <DropDown
          label="Marca"
          data={marcas}
          value={formData.marca_id}
          onSelect={(item) => setFormData({ ...formData, marca_id: item.id })}
          placeholder="Selecione uma marca"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarMarca}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dropdownContainer}>
        <DropDown
          label="Modelo"
          data={modelos}
          value={formData.modelo_id}
          onSelect={(item) => setFormData({ ...formData, modelo_id: item.id })}
          placeholder="Selecione um modelo"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarModelo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dropdownContainer}>
        <DropDown
          label="Fabricante"
          data={fabricantes}
          value={formData.fabricante_id}
          onSelect={(item) => setFormData({ ...formData, fabricante_id: item.id })}
          placeholder="Selecione um fabricante"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarFabricante}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dropdownContainer}>
        <DropDown
          label="Tipo de Embalagem"
          data={tiposEmbalagem}
          value={formData.tipo_embalagem_id}
          onSelect={(item) => setFormData({ ...formData, tipo_embalagem_id: item.id })}
          placeholder="Selecione o tipo de embalagem"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarTipoEmbalagem}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Cor"
        value={formData.cor}
        onChangeText={(text) => setFormData({ ...formData, cor: text })}
        placeholder="Digite a cor do produto"
      />

      <Input
        label="Sabor"
        value={formData.sabor}
        onChangeText={(text) => setFormData({ ...formData, sabor: text })}
        placeholder="Digite o sabor do produto"
      />

      <Input
        label="Quantidade em Unidades"
        value={formData.quantidade_unidades}
        onChangeText={(text) => setFormData({ ...formData, quantidade_unidades: text })}
        placeholder="0"
        keyboardType="numeric"
      />

      <Input
        label="Quantidade na Embalagem"
        value={formData.quantidade_embalagem}
        onChangeText={(text) => setFormData({ ...formData, quantidade_embalagem: text })}
        placeholder="0"
        keyboardType="numeric"
      />

      <Input
        label="Preço de Custo"
        value={formData.preco_custo}
        onChangeText={(text) => setFormData({ ...formData, preco_custo: text })}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Input
        label="Preço de Venda"
        value={formData.preco_venda}
        onChangeText={(text) => setFormData({ ...formData, preco_venda: text })}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Input
        label="Estoque Inicial"
        value={formData.estoque_inicial}
        onChangeText={(text) => setFormData({ ...formData, estoque_inicial: text })}
        placeholder="0"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
        <Text style={styles.saveButtonText}>Salvar Produto</Text>
      </TouchableOpacity>
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
          <Text style={styles.modalTitle}>{tituloModal}</Text>
          <Text style={styles.modalLabel}>Digite o nome:</Text>
          <TextInput
            style={styles.modalInput}
            value={novoItemNome}
            onChangeText={setNovoItemNome}
            placeholder="Nome..."
            autoFocus={true}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={confirmarNovoItem}
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
  gtinContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  scanButton: {
    marginLeft: 8,
    backgroundColor: '#17a2b8',
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 20,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  addButton: {
    marginLeft: 8,
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
  saveButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos para o modal
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
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default CadastroProduto;

