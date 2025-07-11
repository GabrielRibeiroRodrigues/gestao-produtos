// Script de teste para o sistema de notificações
// Execute este script para testar as funcionalidades básicas

import { initDatabase } from './src/database/database';
import { 
  configurarNotificacaoProduto, 
  verificarTodosEstoques,
  obterHistoricoNotificacoes,
  obterContadorNotificacoes,
  obterEstatisticasNotificacoes
} from './src/services/notificacao';
import { atualizarEstoque } from './src/services/estoque';

async function testarSistemaNotificacoes() {
  console.log('=== TESTE DO SISTEMA DE NOTIFICAÇÕES ===');
  
  try {
    // 1. Inicializar banco de dados
    console.log('1. Inicializando banco de dados...');
    await initDatabase();
    console.log('✓ Banco de dados inicializado');
    
    // 2. Configurar notificação para um produto de teste
    console.log('2. Configurando notificação de teste...');
    await configurarNotificacaoProduto(1, 1, 5, 100); // produto_id=1, subsetor_id=1, min=5, max=100
    console.log('✓ Configuração de notificação criada');
    
    // 3. Simular estoque baixo
    console.log('3. Simulando estoque baixo...');
    await atualizarEstoque(1, 1, 3, 'adicionar'); // Definir estoque para 3 (abaixo do mínimo 5)
    console.log('✓ Estoque atualizado para 3 unidades');
    
    // 4. Verificar se notificação foi gerada
    console.log('4. Verificando notificações...');
    await verificarTodosEstoques();
    console.log('✓ Verificação de estoque concluída');
    
    // 5. Verificar histórico
    console.log('5. Verificando histórico de notificações...');
    const historico = obterHistoricoNotificacoes();
    console.log(`✓ Histórico: ${historico.length} notificações encontradas`);
    
    if (historico.length > 0) {
      console.log('   - Última notificação:', historico[0].mensagem);
    }
    
    // 6. Verificar contador
    console.log('6. Verificando contador de notificações...');
    const contador = obterContadorNotificacoes();
    console.log(`✓ Contador: ${contador} notificações não lidas`);
    
    // 7. Verificar estatísticas
    console.log('7. Verificando estatísticas...');
    const estatisticas = obterEstatisticasNotificacoes();
    console.log(`✓ Estatísticas:`, estatisticas);
    
    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste se este arquivo for chamado diretamente
if (require.main === module) {
  testarSistemaNotificacoes();
}

export default testarSistemaNotificacoes;
