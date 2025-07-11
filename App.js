import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initDatabase } from './src/database/database';
import { AuthProvider } from './src/context/AuthContext';

// Importar as telas
import HomeScreen from './src/screens/HomeScreen';
import CadastroProduto from './src/screens/CadastroProduto';
import ListaProdutos from './src/screens/ListaProdutos';
import MovimentacaoProduto from './src/screens/MovimentacaoProduto';
import ListaMovimentacoes from './src/screens/ListaMovimentacoes';
import ConfirmarRecebimento from './src/screens/ConfirmarRecebimento';
import ScannerScreen from './src/screens/ScannerScreen';
import GerenciarSetores from './src/screens/GerenciarSetores';
import TrocarUsuario from './src/screens/TrocarUsuario';
import DashboardScreen from './src/screens/DashboardScreen';
import RelatoriosCompletos from './src/screens/RelatoriosCompletos';
import RelatorioEstoque from './src/screens/RelatorioEstoque';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Banco de dados inicializado com sucesso!');
      })
      .catch(err => {
        console.error('Erro ao inicializar o banco de dados:', err);
      });
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007bff',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Gestão de Produtos' }}
          />
          <Stack.Screen
            name="CadastroProduto"
            component={CadastroProduto}
            options={{ title: 'Cadastrar Produto' }}
          />
          <Stack.Screen
            name="ListaProdutos"
            component={ListaProdutos}
            options={{ title: 'Lista de Produtos' }}
          />
          <Stack.Screen
            name="MovimentacaoProduto"
            component={MovimentacaoProduto}
            options={{ title: 'Movimentar Produto' }}
          />
          <Stack.Screen
            name="ListaMovimentacoes"
            component={ListaMovimentacoes}
            options={{ title: 'Lista de Movimentações' }}
          />
          <Stack.Screen
            name="ConfirmarRecebimento"
            component={ConfirmarRecebimento}
            options={{ title: 'Confirmar Recebimento' }}
          />
          <Stack.Screen
            name="ScannerScreen"
            component={ScannerScreen}
            options={{ title: 'Scanner' }}
          />
          <Stack.Screen
            name="GerenciarSetores"
            component={GerenciarSetores}
            options={{ title: 'Gerenciar Setores' }}
          />
          <Stack.Screen
            name="TrocarUsuario"
            component={TrocarUsuario}
            options={{ title: 'Trocar Usuário' }}
          />
          <Stack.Screen
            name="DashboardScreen"
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen
            name="RelatoriosCompletos"
            component={RelatoriosCompletos}
            options={{ title: 'Relatórios Completos' }}
          />
          <Stack.Screen
            name="RelatorioEstoque"
            component={RelatorioEstoque}
            options={{ title: 'Relatório de Estoque' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

