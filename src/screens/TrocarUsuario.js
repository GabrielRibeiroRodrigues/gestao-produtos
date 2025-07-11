import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { obterSubsetores } from '../services/estoque';

const TrocarUsuario = ({ navigation }) => {
  const { currentSubsetorId, currentSubsetor, changeSubsetor, isLoading: authLoading } = useAuth();
  const [subsetores, setSubsetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changingSubsetor, setChangingSubsetor] = useState(false);

  useEffect(() => {
    carregarSubsetores();
  }, []);

  const carregarSubsetores = () => {
    try {
      setLoading(true);
      const subsetoresArray = obterSubsetores();
      setSubsetores(subsetoresArray);
    } catch (error) {
      console.error('Erro ao carregar subsetores:', error);
      Alert.alert('Erro', 'Não foi possível carregar os subsetores');
    } finally {
      setLoading(false);
    }
  };

  const handleTrocarSubsetor = async (subsetor) => {
    if (subsetor.id === currentSubsetorId) {
      Alert.alert('Aviso', 'Você já está neste subsetor!');
      return;
    }

    Alert.alert(
      'Confirmar Troca',
      `Deseja trocar para o subsetor:\n\n${subsetor.super_setor_nome} > ${subsetor.setor_nome} > ${subsetor.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setChangingSubsetor(true);
            
            try {
              const success = await changeSubsetor(subsetor.id, {
                id: subsetor.id,
                nome: subsetor.nome,
                setor_nome: subsetor.setor_nome,
                super_setor_nome: subsetor.super_setor_nome,
                nome_completo: `${subsetor.super_setor_nome} > ${subsetor.setor_nome} > ${subsetor.nome}`
              });

              if (success) {
                Alert.alert(
                  'Sucesso', 
                  'Subsetor alterado com sucesso!',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert('Erro', 'Não foi possível alterar o subsetor');
              }
            } catch (error) {
              console.error('Erro ao trocar subsetor:', error);
              Alert.alert('Erro', 'Não foi possível alterar o subsetor');
            } finally {
              setChangingSubsetor(false);
            }
          }
        }
      ]
    );
  };

  const renderSubsetor = (subsetor) => {
    const isCurrentSubsetor = subsetor.id === currentSubsetorId;
    
    return (
      <TouchableOpacity
        key={subsetor.id}
        style={[
          styles.subsetorCard,
          isCurrentSubsetor && styles.currentSubsetorCard
        ]}
        onPress={() => handleTrocarSubsetor(subsetor)}
        disabled={isCurrentSubsetor || changingSubsetor}
      >
        <View style={styles.subsetorHeader}>
          <Text style={[
            styles.subsetorNome,
            isCurrentSubsetor && styles.currentSubsetorText
          ]}>
            {subsetor.nome}
          </Text>
          {isCurrentSubsetor && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>ATUAL</Text>
            </View>
          )}
        </View>
        
        <Text style={[
          styles.subsetorHierarquia,
          isCurrentSubsetor && styles.currentSubsetorHierarchy
        ]}>
          {subsetor.super_setor_nome} {'>'} {subsetor.setor_nome}
        </Text>
        
        {!isCurrentSubsetor && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>Toque para selecionar</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando subsetores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trocar Usuário/Subsetor</Text>
        
        {currentSubsetor && (
          <View style={styles.currentInfo}>
            <Text style={styles.currentLabel}>Subsetor Atual:</Text>
            <Text style={styles.currentValue}>
              {currentSubsetor.nome_completo || currentSubsetor.nome}
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Selecione um novo subsetor:</Text>
        
        {subsetores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum subsetor encontrado</Text>
          </View>
        ) : (
          <View style={styles.subsetoresList}>
            {subsetores.map(renderSubsetor)}
          </View>
        )}
      </ScrollView>

      {changingSubsetor && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Alterando subsetor...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  currentInfo: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  currentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
    marginBottom: 16,
  },
  subsetoresList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subsetorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentSubsetorCard: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007bff',
    borderWidth: 2,
  },
  subsetorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subsetorNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  currentSubsetorText: {
    color: '#007bff',
  },
  currentBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subsetorHierarquia: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentSubsetorHierarchy: {
    color: '#0056b3',
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#007bff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default TrocarUsuario;
