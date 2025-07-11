import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { fixedSubsetorId, currentSubsetor } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Visão geral e métricas do sistema',
      screen: 'DashboardScreen',
      color: '#17a2b8',
      icon: '📊',
    },
    {
      title: 'Cadastrar Produto',
      description: 'Adicionar novos produtos ao sistema',
      screen: 'CadastroProduto',
      color: '#28a745',
      icon: '📦',
    },
    {
      title: 'Lista de Produtos',
      description: 'Visualizar produtos em estoque',
      screen: 'ListaProdutos',
      color: '#007bff',
      icon: '📋',
    },
    {
      title: 'Movimentar Produtos',
      description: 'Transferir produtos entre setores',
      screen: 'MovimentacaoProduto',
      color: '#ffc107',
      icon: '🔄',
    },
    {
      title: 'Lista de Movimentações',
      description: 'Histórico de movimentações',
      screen: 'ListaMovimentacoes',
      color: '#6f42c1',
      icon: '📊',
    },
    {
      title: 'Confirmar Recebimento',
      description: 'Confirmar produtos recebidos',
      screen: 'ConfirmarRecebimento',
      color: '#fd7e14',
      icon: '✅',
    },
    {
      title: 'Gerenciar Setores',
      description: 'Adicionar e gerenciar setores/subsetores',
      screen: 'GerenciarSetores',
      color: '#dc3545',
      icon: '🏢',
    },
    {
      title: 'Trocar Usuário',
      description: 'Alterar subsetor de trabalho',
      screen: 'TrocarUsuario',
      color: '#6c757d',
      icon: '👤',
    },
  ];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, { borderLeftColor: item.color }]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Produtos</Text>
        {currentSubsetor ? (
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>Subsetor Atual:</Text>
            <Text style={styles.userName}>{currentSubsetor.nome}</Text>
            <Text style={styles.userHierarchy}>
              {currentSubsetor.nome_completo || `${currentSubsetor.super_setor_nome} > ${currentSubsetor.setor_nome} > ${currentSubsetor.nome}`}
            </Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>Subsetor: Horta (ID: {fixedSubsetorId})</Text>
        )}
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sistema de Gestão e Movimentação de Produtos
        </Text>
        <Text style={styles.footerSubtext}>
          Versão 1.0 - React Native + Expo
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  userInfo: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    minWidth: '100%',
    alignItems: 'center',
  },
  userLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  userHierarchy: {
    fontSize: 12,
    color: '#0056b3',
    textAlign: 'center',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
  },
});

export default HomeScreen;

