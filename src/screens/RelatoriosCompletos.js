import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { 
  obterRelatorioMovimentacoes,
  obterRelatorioEstoque,
  obterRelatorioRecebimentos,
  obterRelatorioAtividadeSetores
} from '../services/estoque';

const RelatoriosCompletos = ({ navigation }) => {
  const { currentSubsetorId, currentSubsetor } = useAuth();
  const [dataInicio, setDataInicio] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const gerarRelatorioMovimentacoes = async () => {
    try {
      setLoading(true);
      const dados = obterRelatorioMovimentacoes(dataInicio, dataFim, currentSubsetorId);
      
      if (dados.length === 0) {
        Alert.alert('Relatório', 'Nenhuma movimentação encontrada no período selecionado.');
        return;
      }

      // Calcular totais
      const totalMovimentacoes = dados.length;
      const valorTotalCusto = dados.reduce((sum, item) => sum + item.valor_custo_total, 0);
      const valorTotalSaida = dados.reduce((sum, item) => sum + item.valor_saida_total, 0);
      const quantidadeTotal = dados.reduce((sum, item) => sum + item.qtde, 0);

      let relatorio = `📊 RELATÓRIO DE MOVIMENTAÇÕES\n`;
      relatorio += `📅 Período: ${formatarData(dataInicio)} a ${formatarData(dataFim)}\n`;
      relatorio += `🏢 Subsetor: ${currentSubsetor?.nome || 'Todos'}\n\n`;
      
      relatorio += `📈 RESUMO:\n`;
      relatorio += `• Total de movimentações: ${totalMovimentacoes}\n`;
      relatorio += `• Quantidade total: ${quantidadeTotal} itens\n`;
      relatorio += `• Valor custo total: ${formatarValor(valorTotalCusto)}\n`;
      relatorio += `• Valor saída total: ${formatarValor(valorTotalSaida)}\n\n`;

      relatorio += `📋 DETALHES:\n`;
      dados.forEach((item, index) => {
        relatorio += `${index + 1}. ${item.produto_nome} (${item.marca})\n`;
        relatorio += `   📅 ${formatarData(item.data_hora_movimentacao)}\n`;
        relatorio += `   🔄 ${item.subsetor_origem} → ${item.subsetor_destino}\n`;
        relatorio += `   📦 Quantidade: ${item.qtde} | Status: ${item.status}\n`;
        relatorio += `   💰 Valor: ${formatarValor(item.valor_saida_total)}\n\n`;
      });

      Alert.alert(
        'Relatório de Movimentações',
        relatorio,
        [
          { text: 'Fechar', style: 'cancel' },
          { text: 'Compartilhar', onPress: () => compartilharRelatorio('Movimentações', relatorio) }
        ]
      );
    } catch (error) {
      console.error('Erro ao gerar relatório de movimentações:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioEstoque = async () => {
    try {
      setLoading(true);
      const dados = obterRelatorioEstoque(currentSubsetorId);
      
      if (dados.length === 0) {
        Alert.alert('Relatório', 'Nenhum produto em estoque encontrado.');
        return;
      }

      // Calcular totais
      const valorTotalCusto = dados.reduce((sum, item) => sum + item.valor_custo_total, 0);
      const valorTotalVenda = dados.reduce((sum, item) => sum + item.valor_venda_total, 0);
      const quantidadeTotal = dados.reduce((sum, item) => sum + item.quantidade, 0);
      const estoqueBaixo = dados.filter(item => item.quantidade < 5).length;

      let relatorio = `📦 RELATÓRIO DE ESTOQUE\n`;
      relatorio += `📅 Data: ${formatarData(new Date().toISOString())}\n`;
      relatorio += `🏢 Subsetor: ${currentSubsetor?.nome || 'Todos'}\n\n`;
      
      relatorio += `📈 RESUMO:\n`;
      relatorio += `• Total de produtos: ${dados.length}\n`;
      relatorio += `• Quantidade total: ${quantidadeTotal} itens\n`;
      relatorio += `• Produtos com estoque baixo: ${estoqueBaixo}\n`;
      relatorio += `• Valor custo total: ${formatarValor(valorTotalCusto)}\n`;
      relatorio += `• Valor venda total: ${formatarValor(valorTotalVenda)}\n\n`;

      relatorio += `⚠️ ESTOQUE BAIXO (< 5 unidades):\n`;
      dados.filter(item => item.quantidade < 5).forEach((item, index) => {
        relatorio += `${index + 1}. ${item.produto_nome} (${item.marca})\n`;
        relatorio += `   Quantidade: ${item.quantidade} | Local: ${item.subsetor_nome}\n\n`;
      });

      Alert.alert(
        'Relatório de Estoque',
        relatorio,
        [
          { text: 'Fechar', style: 'cancel' },
          { text: 'Compartilhar', onPress: () => compartilharRelatorio('Estoque', relatorio) }
        ]
      );
    } catch (error) {
      console.error('Erro ao gerar relatório de estoque:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioRecebimentos = async () => {
    try {
      setLoading(true);
      const dados = obterRelatorioRecebimentos(dataInicio, dataFim, currentSubsetorId);
      
      if (dados.length === 0) {
        Alert.alert('Relatório', 'Nenhum recebimento encontrado no período selecionado.');
        return;
      }

      let relatorio = `✅ RELATÓRIO DE RECEBIMENTOS\n`;
      relatorio += `📅 Período: ${formatarData(dataInicio)} a ${formatarData(dataFim)}\n`;
      relatorio += `🏢 Subsetor: ${currentSubsetor?.nome || 'Todos'}\n\n`;
      
      relatorio += `📊 STATUS DOS RECEBIMENTOS:\n`;
      dados.forEach(item => {
        const emoji = item.status === 'Confirmado' ? '✅' : item.status === 'Recusado' ? '❌' : '⏳';
        relatorio += `${emoji} ${item.status}: ${item.quantidade} movimentações (${item.percentual}%)\n`;
        relatorio += `   Itens: ${item.total_itens} | Valor: ${formatarValor(item.valor_total)}\n\n`;
      });

      Alert.alert(
        'Relatório de Recebimentos',
        relatorio,
        [
          { text: 'Fechar', style: 'cancel' },
          { text: 'Compartilhar', onPress: () => compartilharRelatorio('Recebimentos', relatorio) }
        ]
      );
    } catch (error) {
      console.error('Erro ao gerar relatório de recebimentos:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioSetores = async () => {
    try {
      setLoading(true);
      const dados = obterRelatorioAtividadeSetores(dataInicio, dataFim);
      
      if (dados.length === 0) {
        Alert.alert('Relatório', 'Nenhuma atividade encontrada no período selecionado.');
        return;
      }

      let relatorio = `🏢 RELATÓRIO DE ATIVIDADE POR SETORES\n`;
      relatorio += `📅 Período: ${formatarData(dataInicio)} a ${formatarData(dataFim)}\n\n`;
      
      relatorio += `📊 ATIVIDADE POR SUBSETOR:\n`;
      dados.forEach(item => {
        if (item.total_movimentacoes > 0) {
          relatorio += `🏢 ${item.super_setor_nome} > ${item.setor_nome} > ${item.subsetor_nome}\n`;
          relatorio += `   Movimentações: ${item.total_movimentacoes}\n`;
          relatorio += `   Entradas: ${item.total_entradas} (${formatarValor(item.valor_entradas)})\n`;
          relatorio += `   Saídas: ${item.total_saidas} (${formatarValor(item.valor_saidas)})\n\n`;
        }
      });

      Alert.alert(
        'Relatório de Setores',
        relatorio,
        [
          { text: 'Fechar', style: 'cancel' },
          { text: 'Compartilhar', onPress: () => compartilharRelatorio('Setores', relatorio) }
        ]
      );
    } catch (error) {
      console.error('Erro ao gerar relatório de setores:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    } finally {
      setLoading(false);
    }
  };

  const compartilharRelatorio = (tipo, conteudo) => {
    // Em um app real, aqui você poderia usar uma biblioteca como react-native-share
    // ou salvar em arquivo. Por enquanto, vamos mostrar um alert informativo.
    Alert.alert(
      'Compartilhar Relatório',
      `Funcionalidade de compartilhamento seria implementada aqui.\n\nTipo: ${tipo}\nTamanho: ${conteudo.length} caracteres`,
      [{ text: 'OK' }]
    );
  };

  const renderRelatorioButton = (title, description, color, icon, onPress) => (
    <TouchableOpacity 
      style={[styles.relatorioButton, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.buttonContent}>
        <View style={styles.buttonHeader}>
          <Text style={styles.buttonIcon}>{icon}</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>{title}</Text>
            <Text style={styles.buttonDescription}>{description}</Text>
          </View>
        </View>
        <Text style={[styles.buttonArrow, { color }]}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios Completos</Text>
        {currentSubsetor && (
          <Text style={styles.subtitle}>
            {currentSubsetor.nome_completo || currentSubsetor.nome}
          </Text>
        )}
      </View>

      {/* Filtros de Data */}
      <View style={styles.filtrosContainer}>
        <Text style={styles.filtrosTitle}>Período para Análise</Text>
        <View style={styles.dataInputsContainer}>
          <View style={styles.dataInputContainer}>
            <Text style={styles.dataLabel}>Data Início:</Text>
            <TextInput
              style={styles.dataInput}
              value={dataInicio}
              onChangeText={setDataInicio}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.dataInputContainer}>
            <Text style={styles.dataLabel}>Data Fim:</Text>
            <TextInput
              style={styles.dataInput}
              value={dataFim}
              onChangeText={setDataFim}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
      </View>

      {/* Botões de Relatórios */}
      <View style={styles.relatoriosContainer}>
        {renderRelatorioButton(
          'Relatório de Movimentações',
          'Análise completa de transferências entre setores no período',
          '#007bff',
          '🔄',
          gerarRelatorioMovimentacoes
        )}

        {renderRelatorioButton(
          'Relatório de Estoque',
          'Situação atual do estoque com alertas e valores',
          '#28a745',
          '📦',
          gerarRelatorioEstoque
        )}

        {renderRelatorioButton(
          'Relatório de Recebimentos',
          'Análise de eficiência nos recebimentos (confirmados vs recusados)',
          '#ffc107',
          '✅',
          gerarRelatorioRecebimentos
        )}

        {renderRelatorioButton(
          'Relatório de Setores',
          'Atividade e fluxo de produtos entre setores',
          '#6f42c1',
          '🏢',
          gerarRelatorioSetores
        )}
      </View>

      {/* Ações Adicionais */}
      <View style={styles.acoesContainer}>
        <Text style={styles.acoesTitle}>Ações Adicionais</Text>
        
        <TouchableOpacity 
          style={styles.acaoButton}
          onPress={() => navigation.navigate('DashboardScreen')}
        >
          <Text style={styles.acaoButtonText}>📊 Voltar ao Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.acaoButton}
          onPress={() => navigation.navigate('ListaMovimentacoes')}
        >
          <Text style={styles.acaoButtonText}>📋 Ver Histórico Detalhado</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Gerando relatório...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  filtrosContainer: {
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
  filtrosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dataInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dataInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  relatoriosContainer: {
    paddingHorizontal: 15,
  },
  relatorioButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
    color: '#666',
  },
  buttonArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  acoesContainer: {
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
  acoesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  acaoButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  acaoButtonText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RelatoriosCompletos;
