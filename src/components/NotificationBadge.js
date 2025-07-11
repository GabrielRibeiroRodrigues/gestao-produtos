import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obterContadorNotificacoes } from '../services/notificacao';

const NotificationBadge = ({ navigation, style }) => {
  const [contador, setContador] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      carregarContador();
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(carregarContador, 30000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const carregarContador = () => {
    try {
      const count = obterContadorNotificacoes();
      setContador(count);
    } catch (error) {
      console.error('Erro ao carregar contador de notificações:', error);
      setContador(0);
    }
  };

  const navegarParaNotificacoes = () => {
    navigation.navigate('NotificacoesScreen');
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={navegarParaNotificacoes}
    >
      <Text style={styles.icon}>🔔</Text>
      {contador > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {contador > 99 ? '99+' : contador.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  icon: {
    fontSize: 24,
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
