import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obterSubsetorPorId } from '../services/estoque';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentSubsetorId, setCurrentSubsetorId] = useState(1);
  const [currentSubsetor, setCurrentSubsetor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar subsetor salvo ao inicializar
  useEffect(() => {
    loadSavedSubsetor();
  }, []);

  const loadSavedSubsetor = async () => {
    try {
      const savedSubsetorId = await AsyncStorage.getItem('currentSubsetorId');
      const savedSubsetor = await AsyncStorage.getItem('currentSubsetor');
      
      if (savedSubsetorId && savedSubsetor) {
        setCurrentSubsetorId(parseInt(savedSubsetorId));
        setCurrentSubsetor(JSON.parse(savedSubsetor));
      } else {
        // Se não há dados salvos, carregar dados do subsetor padrão (ID: 1)
        try {
          const subsetorPadrao = obterSubsetorPorId(1);
          if (subsetorPadrao) {
            setCurrentSubsetor(subsetorPadrao);
            // Salvar dados padrão
            await AsyncStorage.setItem('currentSubsetorId', '1');
            await AsyncStorage.setItem('currentSubsetor', JSON.stringify(subsetorPadrao));
          }
        } catch (error) {
          console.error('Erro ao carregar subsetor padrão:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar subsetor salvo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeSubsetor = async (subsetorId, subsetorData) => {
    try {
      setCurrentSubsetorId(subsetorId);
      setCurrentSubsetor(subsetorData);
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('currentSubsetorId', subsetorId.toString());
      await AsyncStorage.setItem('currentSubsetor', JSON.stringify(subsetorData));
      
      console.log(`Subsetor alterado para: ${subsetorData.nome} (ID: ${subsetorId})`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar novo subsetor:', error);
      return false;
    }
  };

  const login = () => {
    // Em um cenário real, aqui você faria a lógica de autenticação
    console.log(`Usuário logado no subsetor: ${currentSubsetorId}`);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentSubsetorId');
      await AsyncStorage.removeItem('currentSubsetor');
      setCurrentSubsetorId(1);
      setCurrentSubsetor(null);
      console.log("Usuário deslogado");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      fixedSubsetorId: currentSubsetorId, // Manter compatibilidade
      currentSubsetorId, 
      currentSubsetor,
      isLoading,
      changeSubsetor,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


