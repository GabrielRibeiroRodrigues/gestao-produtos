import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Input from '../components/Input';
import DropDown from '../components/DropDown';
import database, { getAllRows, executeQuery } from '../database/database';
import { useAuth } from '../context/AuthContext';
import { verificarEstoque, atualizarEstoque } from '../services/estoque';

const MovimentacaoProduto = ({ navigation }) => {
  const { fixedSubsetorId } = useAuth();
  
  const [formData, setFormData] = useState({
    produto_id: null,
    quantidade: '',
    subsetor_destino_id: null,
    transacao_id: null,
    preco_saida: '',
    valor_desconto: '0',
  });

  const [produtos, setProdutos] = useState([]);
  const [subsetores, setSubsetores] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    try {
      // Carregar produtos com estoque no subsetor atual
      const produtosRaw = getAllRows(
        `SELECT 
          dp.id,
          p.nome,
          m.nome as marca,
          mo.nome as modelo,
          f.nome as fabricante,
          dp.cor,
          dp.sabor,
          dp.preco_venda,
          dpe.quantidade
        FROM DetalheProdutoEstoque dpe
        JOIN DetalheProduto dp ON dpe.produto_id = dp.id
        JOIN Produto p ON dp.produto_id = p.id
        JOIN Marca m ON p.marca_id = m.id
        JOIN Modelo mo ON p.modelo_id = mo.id
        JOIN Fabricante f ON p.fabricante_id = f.id
        WHERE dpe.subsetor_id = ? AND dpe.quantidade > 0`,
        [fixedSubsetorId]
      );
      
      const produtosArray = produtosRaw.map(produto => ({
        ...produto,
        nome: `${produto.nome} - ${produto.marca} (Qtd: ${produto.quantidade})`
      }));
      setProdutos(produtosArray);

      // Carregar subsetores (exceto o atual)
      const subsetoresRaw = getAllRows(
        `SELECT ss.id, ss.nome, s.nome as setor_nome, sp.nome as super_setor_nome
         FROM SetorSub ss
         JOIN Setor s ON ss.setor_id = s.id
         JOIN SetorSuper sp ON s.super_setor_id = sp.id
         WHERE ss.id != ?
         ORDER BY sp.nome, s.nome, ss.nome`,
        [fixedSubsetorId]
      );
      
      const subsetoresArray = subsetoresRaw.map(subsetor => ({
        ...subsetor,
        nome: `${subsetor.super_setor_nome} > ${subsetor.setor_nome} > ${subsetor.nome}`
      }));
      setSubsetores(subsetoresArray);

      // Carregar tipos de transação
      const transacoesArray = getAllRows('SELECT * FROM Transacao ORDER BY transacao');
      setTransacoes(transacoesArray);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    }
  };

  const handleProdutoSelecionado = (produto) => {
    setProdutoSelecionado(produto);
    setFormData({
      ...formData,
      produto_id: produto.id,
      preco_saida: produto.preco_venda.toString()
    });
  };

  const validarFormulario = () => {
    if (!formData.produto_id) {
      Alert.alert('Erro', 'Selecione um produto');
      return false;
    }
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      Alert.alert('Erro', 'Quantidade deve ser maior que zero');
      return false;
    }
    if (!formData.subsetor_destino_id) {
      Alert.alert('Erro', 'Selecione o subsetor de destino');
      return false;
    }
    if (!formData.transacao_id) {
      Alert.alert('Erro', 'Selecione o tipo de transação');
      return false;
    }
    if (!formData.preco_saida || parseFloat(formData.preco_saida) <= 0) {
      Alert.alert('Erro', 'Preço de saída deve ser maior que zero');
      return false;
    }
    return true;
  };

  const handleMovimentar = async () => {
    if (!validarFormulario()) return;

    const quantidade = parseInt(formData.quantidade);
    
    try {
      // Verificar se há estoque suficiente
      const temEstoque = verificarEstoque(formData.produto_id, fixedSubsetorId, quantidade);
      
      if (!temEstoque) {
        Alert.alert('Erro', 'Estoque insuficiente para esta movimentação');
        return;
      }

      // Criar a movimentação
      try {
        // Inserir movimentação
        const movimentacaoResult = executeQuery(
          `INSERT INTO MovimentacaoProduto 
           (data_hora_movimentacao, subsetor_origem_id, subsetor_destino_id, transacao_id) 
           VALUES (?, ?, ?, ?)`,
          [
            new Date().toISOString(),
            fixedSubsetorId,
            formData.subsetor_destino_id,
            formData.transacao_id
          ]
        );
        
        const movimentacaoId = movimentacaoResult.lastInsertRowId;
        
        // Inserir item da movimentação
        executeQuery(
          `INSERT INTO ProdutoMovimentoItem 
           (movimentacao_produto_id, produto_saida_id, produto_id, qtde, 
            preco_saida, valor_desconto, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            movimentacaoId,
            formData.produto_id,
            formData.produto_id,
            quantidade,
            parseFloat(formData.preco_saida),
            parseFloat(formData.valor_desconto) || 0,
            'Pendente'
          ]
        );
        
        // Atualizar estoque de origem (remover)
        atualizarEstoque(formData.produto_id, fixedSubsetorId, quantidade, 'remover');
        
        // Atualizar estoque de destino (adicionar)
        atualizarEstoque(formData.produto_id, formData.subsetor_destino_id, quantidade, 'adicionar');
        
        Alert.alert('Sucesso', 'Movimentação realizada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (error) {
        console.error('Erro ao realizar movimentação:', error);
        Alert.alert('Erro', 'Não foi possível realizar a movimentação');
      }
    } catch (error) {
      console.error('Erro na movimentação:', error);
      Alert.alert('Erro', 'Não foi possível realizar a movimentação');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Movimentação de Produto</Text>
      
      <DropDown
        label="Produto"
        data={produtos}
        value={formData.produto_id}
        onSelect={handleProdutoSelecionado}
        placeholder="Selecione um produto"
      />

      {produtoSelecionado && (
        <View style={styles.produtoInfo}>
          <Text style={styles.produtoInfoTitle}>Produto Selecionado:</Text>
          <Text style={styles.produtoInfoText}>
            {produtoSelecionado.nome.split(' - ')[0]} - {produtoSelecionado.marca}
          </Text>
          <Text style={styles.produtoInfoText}>
            Estoque disponível: {produtoSelecionado.quantidade}
          </Text>
          {produtoSelecionado.cor && (
            <Text style={styles.produtoInfoText}>Cor: {produtoSelecionado.cor}</Text>
          )}
          {produtoSelecionado.sabor && (
            <Text style={styles.produtoInfoText}>Sabor: {produtoSelecionado.sabor}</Text>
          )}
        </View>
      )}

      <Input
        label="Quantidade"
        value={formData.quantidade}
        onChangeText={(text) => setFormData({ ...formData, quantidade: text })}
        placeholder="Digite a quantidade"
        keyboardType="numeric"
      />

      <DropDown
        label="Subsetor de Destino"
        data={subsetores}
        value={formData.subsetor_destino_id}
        onSelect={(item) => setFormData({ ...formData, subsetor_destino_id: item.id })}
        placeholder="Selecione o subsetor de destino"
      />

      <DropDown
        label="Tipo de Transação"
        data={transacoes}
        value={formData.transacao_id}
        onSelect={(item) => setFormData({ ...formData, transacao_id: item.id })}
        placeholder="Selecione o tipo de transação"
      />

      <Input
        label="Preço de Saída"
        value={formData.preco_saida}
        onChangeText={(text) => setFormData({ ...formData, preco_saida: text })}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Input
        label="Valor do Desconto"
        value={formData.valor_desconto}
        onChangeText={(text) => setFormData({ ...formData, valor_desconto: text })}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.moveButton} onPress={handleMovimentar}>
        <Text style={styles.moveButtonText}>Realizar Movimentação</Text>
      </TouchableOpacity>
    </ScrollView>
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
  produtoInfo: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  produtoInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  produtoInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moveButton: {
    backgroundColor: '#ffc107',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  moveButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MovimentacaoProduto;

