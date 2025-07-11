import database, { getAllRows, executeQuery, getFirstRow } from '../database/database';

// Função para verificar se há estoque suficiente
export const verificarEstoque = (produtoId, subsetorId, quantidade) => {
  try {
    const result = getFirstRow(
      'SELECT quantidade FROM DetalheProdutoEstoque WHERE produto_id = ? AND subsetor_id = ?',
      [produtoId, subsetorId]
    );
    
    if (result) {
      const estoqueAtual = result.quantidade;
      return estoqueAtual >= quantidade;
    } else {
      return false; // Produto não encontrado no estoque
    }
  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
    throw error;
  }
};

// Função para atualizar estoque
export const atualizarEstoque = (produtoId, subsetorId, quantidade, operacao = 'adicionar') => {
  try {
    // Primeiro, verificar se o produto já existe no estoque do subsetor
    const estoqueExistente = getFirstRow(
      'SELECT * FROM DetalheProdutoEstoque WHERE produto_id = ? AND subsetor_id = ?',
      [produtoId, subsetorId]
    );
    
    if (estoqueExistente) {
      // Produto já existe, atualizar quantidade
      const estoqueAtual = estoqueExistente.quantidade;
      const novaQuantidade = operacao === 'adicionar' 
        ? estoqueAtual + quantidade 
        : estoqueAtual - quantidade;
      
      executeQuery(
        'UPDATE DetalheProdutoEstoque SET quantidade = ? WHERE produto_id = ? AND subsetor_id = ?',
        [novaQuantidade, produtoId, subsetorId]
      );
      
      console.log(`Estoque atualizado: ${novaQuantidade}`);
      return novaQuantidade;
    } else {
      // Produto não existe no estoque deste subsetor, criar novo registro
      if (operacao === 'adicionar') {
        executeQuery(
          'INSERT INTO DetalheProdutoEstoque (produto_id, subsetor_id, quantidade) VALUES (?, ?, ?)',
          [produtoId, subsetorId, quantidade]
        );
        
        console.log(`Novo registro de estoque criado com quantidade: ${quantidade}`);
        return quantidade;
      } else {
        throw new Error('Não é possível remover de um estoque que não existe');
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    throw error;
  }
};

// Função para obter produtos com estoque em um subsetor
export const obterProdutosComEstoque = (subsetorId) => {
  try {
    const produtos = getAllRows(
      `SELECT 
        dp.id,
        p.nome,
        m.nome as marca,
        mo.nome as modelo,
        f.nome as fabricante,
        dp.cor,
        dp.sabor,
        dp.preco_custo,
        dp.preco_venda,
        dpe.quantidade
      FROM DetalheProdutoEstoque dpe
      JOIN DetalheProduto dp ON dpe.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN Modelo mo ON p.modelo_id = mo.id
      JOIN Fabricante f ON p.fabricante_id = f.id
      WHERE dpe.subsetor_id = ? AND dpe.quantidade > 0`,
      [subsetorId]
    );
    
    return produtos;
  } catch (error) {
    console.error('Erro ao obter produtos com estoque:', error);
    throw error;
  }
};

// Função para obter todos os produtos (com ou sem estoque)
export const obterTodosProdutos = (subsetorId = null) => {
  try {
    const query = subsetorId ? 
      `SELECT 
        dp.id,
        p.nome,
        m.nome as marca,
        mo.nome as modelo,
        f.nome as fabricante,
        dp.cor,
        dp.sabor,
        dp.preco_custo,
        dp.preco_venda,
        COALESCE(dpe.quantidade, 0) as quantidade
      FROM DetalheProduto dp
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN Modelo mo ON p.modelo_id = mo.id
      JOIN Fabricante f ON p.fabricante_id = f.id
      LEFT JOIN DetalheProdutoEstoque dpe ON dp.id = dpe.produto_id AND dpe.subsetor_id = ?
      ORDER BY p.nome` :
      `SELECT 
        dp.id,
        p.nome,
        m.nome as marca,
        mo.nome as modelo,
        f.nome as fabricante,
        dp.cor,
        dp.sabor,
        dp.preco_custo,
        dp.preco_venda,
        0 as quantidade
      FROM DetalheProduto dp
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN Modelo mo ON p.modelo_id = mo.id
      JOIN Fabricante f ON p.fabricante_id = f.id
      ORDER BY p.nome`;
    
    const params = subsetorId ? [subsetorId] : [];
    const produtos = getAllRows(query, params);
    
    return produtos;
  } catch (error) {
    console.error('Erro ao obter todos os produtos:', error);
    throw error;
  }
};

// Funções para gerenciamento de setores
export const obterSetoresSuper = () => {
  try {
    return getAllRows('SELECT * FROM SetorSuper ORDER BY nome');
  } catch (error) {
    console.error('Erro ao obter setores super:', error);
    throw error;
  }
};

export const obterSetores = (superSetorId = null) => {
  try {
    const query = superSetorId 
      ? `SELECT s.*, ss.nome as super_setor_nome 
         FROM Setor s 
         JOIN SetorSuper ss ON s.super_setor_id = ss.id 
         WHERE s.super_setor_id = ?
         ORDER BY s.nome`
      : `SELECT s.*, ss.nome as super_setor_nome 
         FROM Setor s 
         JOIN SetorSuper ss ON s.super_setor_id = ss.id 
         ORDER BY ss.nome, s.nome`;
    
    const params = superSetorId ? [superSetorId] : [];
    return getAllRows(query, params);
  } catch (error) {
    console.error('Erro ao obter setores:', error);
    throw error;
  }
};

export const obterSubsetores = (setorId = null) => {
  try {
    const query = setorId 
      ? `SELECT sub.*, s.nome as setor_nome, ss.nome as super_setor_nome
         FROM SetorSub sub
         JOIN Setor s ON sub.setor_id = s.id
         JOIN SetorSuper ss ON s.super_setor_id = ss.id
         WHERE sub.setor_id = ?
         ORDER BY sub.nome`
      : `SELECT sub.*, s.nome as setor_nome, ss.nome as super_setor_nome
         FROM SetorSub sub
         JOIN Setor s ON sub.setor_id = s.id
         JOIN SetorSuper ss ON s.super_setor_id = ss.id
         ORDER BY ss.nome, s.nome, sub.nome`;
    
    const params = setorId ? [setorId] : [];
    return getAllRows(query, params);
  } catch (error) {
    console.error('Erro ao obter subsetores:', error);
    throw error;
  }
};

export const adicionarSetorSuper = (nome) => {
  try {
    // Verificar se já existe
    const existe = getFirstRow('SELECT * FROM SetorSuper WHERE nome = ?', [nome]);
    if (existe) {
      throw new Error('Setor Super já existe');
    }
    
    const result = executeQuery('INSERT INTO SetorSuper (nome) VALUES (?)', [nome]);
    return { id: result.lastInsertRowId, nome };
  } catch (error) {
    console.error('Erro ao adicionar setor super:', error);
    throw error;
  }
};

export const adicionarSetor = (nome, superSetorId) => {
  try {
    // Verificar se já existe no mesmo setor super
    const existe = getFirstRow(
      'SELECT * FROM Setor WHERE nome = ? AND super_setor_id = ?', 
      [nome, superSetorId]
    );
    if (existe) {
      throw new Error('Setor já existe neste Setor Super');
    }
    
    const result = executeQuery(
      'INSERT INTO Setor (nome, super_setor_id) VALUES (?, ?)', 
      [nome, superSetorId]
    );
    return { id: result.lastInsertRowId, nome, super_setor_id: superSetorId };
  } catch (error) {
    console.error('Erro ao adicionar setor:', error);
    throw error;
  }
};

export const adicionarSubsetor = (nome, setorId) => {
  try {
    // Verificar se já existe no mesmo setor
    const existe = getFirstRow(
      'SELECT * FROM SetorSub WHERE nome = ? AND setor_id = ?', 
      [nome, setorId]
    );
    if (existe) {
      throw new Error('Subsetor já existe neste Setor');
    }
    
    const result = executeQuery(
      'INSERT INTO SetorSub (nome, setor_id) VALUES (?, ?)', 
      [nome, setorId]
    );
    return { id: result.lastInsertRowId, nome, setor_id: setorId };
  } catch (error) {
    console.error('Erro ao adicionar subsetor:', error);
    throw error;
  }
};

// Função para obter dados de um subsetor específico
export const obterSubsetorPorId = (subsetorId) => {
  try {
    const subsetor = getFirstRow(`
      SELECT sub.*, s.nome as setor_nome, ss.nome as super_setor_nome
      FROM SetorSub sub
      JOIN Setor s ON sub.setor_id = s.id
      JOIN SetorSuper ss ON s.super_setor_id = ss.id
      WHERE sub.id = ?
    `, [subsetorId]);
    
    if (subsetor) {
      return {
        ...subsetor,
        nome_completo: `${subsetor.super_setor_nome} > ${subsetor.setor_nome} > ${subsetor.nome}`
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter subsetor por ID:', error);
    throw error;
  }
};

// ==================== FUNÇÕES DE RELATÓRIOS E MÉTRICAS ====================

// Métricas do Dashboard Principal
export const obterMetricasDashboard = (subsetorId = null) => {
  try {
    const metricas = {};
    
    // Total de produtos cadastrados
    const totalProdutos = getFirstRow('SELECT COUNT(*) as total FROM DetalheProduto');
    metricas.totalProdutos = totalProdutos.total;
    
    // Total de produtos com estoque
    const produtosComEstoque = subsetorId ? 
      getFirstRow('SELECT COUNT(*) as total FROM DetalheProdutoEstoque WHERE subsetor_id = ? AND quantidade > 0', [subsetorId]) :
      getFirstRow('SELECT COUNT(*) as total FROM DetalheProdutoEstoque WHERE quantidade > 0');
    metricas.produtosComEstoque = produtosComEstoque.total;
    
    // Produtos com estoque baixo (menos de 5 unidades)
    const estoqueBaixo = subsetorId ?
      getFirstRow('SELECT COUNT(*) as total FROM DetalheProdutoEstoque WHERE subsetor_id = ? AND quantidade > 0 AND quantidade < 5', [subsetorId]) :
      getFirstRow('SELECT COUNT(*) as total FROM DetalheProdutoEstoque WHERE quantidade > 0 AND quantidade < 5');
    metricas.estoqueBaixo = estoqueBaixo.total;
    
    // Movimentações do dia atual
    const hoje = new Date().toISOString().split('T')[0];
    const movimentacoesHoje = subsetorId ?
      getFirstRow(`SELECT COUNT(*) as total FROM MovimentacaoProduto 
                   WHERE (subsetor_origem_id = ? OR subsetor_destino_id = ?) 
                   AND DATE(data_hora_movimentacao) = ?`, [subsetorId, subsetorId, hoje]) :
      getFirstRow(`SELECT COUNT(*) as total FROM MovimentacaoProduto 
                   WHERE DATE(data_hora_movimentacao) = ?`, [hoje]);
    metricas.movimentacoesHoje = movimentacoesHoje.total;
    
    // Recebimentos pendentes
    const recebimentosPendentes = subsetorId ?
      getFirstRow(`SELECT COUNT(*) as total FROM ProdutoMovimentoItem pmi
                   JOIN MovimentacaoProduto mp ON pmi.movimentacao_produto_id = mp.id
                   WHERE mp.subsetor_destino_id = ? AND pmi.status = 'Pendente'`, [subsetorId]) :
      getFirstRow(`SELECT COUNT(*) as total FROM ProdutoMovimentoItem WHERE status = 'Pendente'`);
    metricas.recebimentosPendentes = recebimentosPendentes.total;
    
    // Valor total do estoque
    const valorEstoque = subsetorId ?
      getFirstRow(`SELECT SUM(dpe.quantidade * dp.preco_custo) as valor_total
                   FROM DetalheProdutoEstoque dpe
                   JOIN DetalheProduto dp ON dpe.produto_id = dp.id
                   WHERE dpe.subsetor_id = ? AND dpe.quantidade > 0`, [subsetorId]) :
      getFirstRow(`SELECT SUM(dpe.quantidade * dp.preco_custo) as valor_total
                   FROM DetalheProdutoEstoque dpe
                   JOIN DetalheProduto dp ON dpe.produto_id = dp.id
                   WHERE dpe.quantidade > 0`);
    metricas.valorTotalEstoque = valorEstoque.valor_total || 0;
    
    return metricas;
  } catch (error) {
    console.error('Erro ao obter métricas do dashboard:', error);
    throw error;
  }
};

// Relatório de Movimentações por Período
export const obterRelatorioMovimentacoes = (dataInicio, dataFim, subsetorId = null) => {
  try {
    const query = subsetorId ?
      `SELECT 
        mp.data_hora_movimentacao,
        ss_origem.nome as subsetor_origem,
        ss_destino.nome as subsetor_destino,
        t.transacao,
        p.nome as produto_nome,
        m.nome as marca,
        pmi.qtde,
        pmi.preco_saida,
        pmi.status,
        dp.preco_custo,
        (pmi.qtde * dp.preco_custo) as valor_custo_total,
        (pmi.qtde * pmi.preco_saida) as valor_saida_total
      FROM MovimentacaoProduto mp
      JOIN SetorSub ss_origem ON mp.subsetor_origem_id = ss_origem.id
      JOIN SetorSub ss_destino ON mp.subsetor_destino_id = ss_destino.id
      JOIN Transacao t ON mp.transacao_id = t.id
      JOIN ProdutoMovimentoItem pmi ON mp.id = pmi.movimentacao_produto_id
      JOIN DetalheProduto dp ON pmi.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      WHERE (mp.subsetor_origem_id = ? OR mp.subsetor_destino_id = ?)
      AND DATE(mp.data_hora_movimentacao) BETWEEN ? AND ?
      ORDER BY mp.data_hora_movimentacao DESC` :
      `SELECT 
        mp.data_hora_movimentacao,
        ss_origem.nome as subsetor_origem,
        ss_destino.nome as subsetor_destino,
        t.transacao,
        p.nome as produto_nome,
        m.nome as marca,
        pmi.qtde,
        pmi.preco_saida,
        pmi.status,
        dp.preco_custo,
        (pmi.qtde * dp.preco_custo) as valor_custo_total,
        (pmi.qtde * pmi.preco_saida) as valor_saida_total
      FROM MovimentacaoProduto mp
      JOIN SetorSub ss_origem ON mp.subsetor_origem_id = ss_origem.id
      JOIN SetorSub ss_destino ON mp.subsetor_destino_id = ss_destino.id
      JOIN Transacao t ON mp.transacao_id = t.id
      JOIN ProdutoMovimentoItem pmi ON mp.id = pmi.movimentacao_produto_id
      JOIN DetalheProduto dp ON pmi.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      WHERE DATE(mp.data_hora_movimentacao) BETWEEN ? AND ?
      ORDER BY mp.data_hora_movimentacao DESC`;
    
    const params = subsetorId ? [subsetorId, subsetorId, dataInicio, dataFim] : [dataInicio, dataFim];
    return getAllRows(query, params);
  } catch (error) {
    console.error('Erro ao obter relatório de movimentações:', error);
    throw error;
  }
};

// Relatório de Estoque Atual
export const obterRelatorioEstoque = (subsetorId = null) => {
  try {
    const query = subsetorId ?
      `SELECT 
        p.nome as produto_nome,
        m.nome as marca,
        mo.nome as modelo,
        f.nome as fabricante,
        dp.cor,
        dp.sabor,
        dp.preco_custo,
        dp.preco_venda,
        dpe.quantidade,
        (dpe.quantidade * dp.preco_custo) as valor_custo_total,
        (dpe.quantidade * dp.preco_venda) as valor_venda_total,
        ss.nome as subsetor_nome,
        s.nome as setor_nome,
        sp.nome as super_setor_nome
      FROM DetalheProdutoEstoque dpe
      JOIN DetalheProduto dp ON dpe.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN Modelo mo ON p.modelo_id = mo.id
      JOIN Fabricante f ON p.fabricante_id = f.id
      JOIN SetorSub ss ON dpe.subsetor_id = ss.id
      JOIN Setor s ON ss.setor_id = s.id
      JOIN SetorSuper sp ON s.super_setor_id = sp.id
      WHERE dpe.subsetor_id = ? AND dpe.quantidade > 0
      ORDER BY dpe.quantidade ASC, p.nome` :
      `SELECT 
        p.nome as produto_nome,
        m.nome as marca,
        mo.nome as modelo,
        f.nome as fabricante,
        dp.cor,
        dp.sabor,
        dp.preco_custo,
        dp.preco_venda,
        dpe.quantidade,
        (dpe.quantidade * dp.preco_custo) as valor_custo_total,
        (dpe.quantidade * dp.preco_venda) as valor_venda_total,
        ss.nome as subsetor_nome,
        s.nome as setor_nome,
        sp.nome as super_setor_nome
      FROM DetalheProdutoEstoque dpe
      JOIN DetalheProduto dp ON dpe.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN Modelo mo ON p.modelo_id = mo.id
      JOIN Fabricante f ON p.fabricante_id = f.id
      JOIN SetorSub ss ON dpe.subsetor_id = ss.id
      JOIN Setor s ON ss.setor_id = s.id
      JOIN SetorSuper sp ON s.super_setor_id = sp.id
      WHERE dpe.quantidade > 0
      ORDER BY dpe.quantidade ASC, p.nome`;
    
    const params = subsetorId ? [subsetorId] : [];
    return getAllRows(query, params);
  } catch (error) {
    console.error('Erro ao obter relatório de estoque:', error);
    throw error;
  }
};

// Produtos Mais Movimentados
export const obterProdutosMaisMovimentados = (limite = 10, subsetorId = null) => {
  try {
    const query = subsetorId ?
      `SELECT 
        p.nome as produto_nome,
        m.nome as marca,
        COUNT(pmi.id) as total_movimentacoes,
        SUM(pmi.qtde) as quantidade_total_movimentada,
        SUM(pmi.qtde * pmi.preco_saida) as valor_total_movimentado
      FROM ProdutoMovimentoItem pmi
      JOIN DetalheProduto dp ON pmi.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      JOIN MovimentacaoProduto mp ON pmi.movimentacao_produto_id = mp.id
      WHERE (mp.subsetor_origem_id = ? OR mp.subsetor_destino_id = ?)
      GROUP BY p.id, p.nome, m.nome
      ORDER BY total_movimentacoes DESC, quantidade_total_movimentada DESC
      LIMIT ?` :
      `SELECT 
        p.nome as produto_nome,
        m.nome as marca,
        COUNT(pmi.id) as total_movimentacoes,
        SUM(pmi.qtde) as quantidade_total_movimentada,
        SUM(pmi.qtde * pmi.preco_saida) as valor_total_movimentado
      FROM ProdutoMovimentoItem pmi
      JOIN DetalheProduto dp ON pmi.produto_id = dp.id
      JOIN Produto p ON dp.produto_id = p.id
      JOIN Marca m ON p.marca_id = m.id
      GROUP BY p.id, p.nome, m.nome
      ORDER BY total_movimentacoes DESC, quantidade_total_movimentada DESC
      LIMIT ?`;
    
    const params = subsetorId ? [subsetorId, subsetorId, limite] : [limite];
    return getAllRows(query, params);
  } catch (error) {
    console.error('Erro ao obter produtos mais movimentados:', error);
    throw error;
  }
};

// Relatório de Status de Recebimentos
export const obterRelatorioRecebimentos = (dataInicio, dataFim, subsetorId = null) => {
  try {
    const query = subsetorId ?
      `SELECT 
        pmi.status,
        COUNT(*) as quantidade,
        SUM(pmi.qtde) as total_itens,
        SUM(pmi.qtde * pmi.preco_saida) as valor_total,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ProdutoMovimentoItem pmi2 
                                   JOIN MovimentacaoProduto mp2 ON pmi2.movimentacao_produto_id = mp2.id 
                                   WHERE mp2.subsetor_destino_id = ? 
                                   AND DATE(mp2.data_hora_movimentacao) BETWEEN ? AND ?), 2) as percentual
      FROM ProdutoMovimentoItem pmi
      JOIN MovimentacaoProduto mp ON pmi.movimentacao_produto_id = mp.id
      WHERE mp.subsetor_destino_id = ?
      AND DATE(mp.data_hora_movimentacao) BETWEEN ? AND ?
      GROUP BY pmi.status
      ORDER BY quantidade DESC` :
      `SELECT 
        pmi.status,
        COUNT(*) as quantidade,
        SUM(pmi.qtde) as total_itens,
        SUM(pmi.qtde * pmi.preco_saida) as valor_total,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ProdutoMovimentoItem pmi2 
                                   JOIN MovimentacaoProduto mp2 ON pmi2.movimentacao_produto_id = mp2.id 
                                   WHERE DATE(mp2.data_hora_movimentacao) BETWEEN ? AND ?), 2) as percentual
      FROM ProdutoMovimentoItem pmi
      JOIN MovimentacaoProduto mp ON pmi.movimentacao_produto_id = mp.id
      WHERE DATE(mp.data_hora_movimentacao) BETWEEN ? AND ?
      GROUP BY pmi.status
      ORDER BY quantidade DESC`;
    
    const params = subsetorId ? [subsetorId, dataInicio, dataFim, subsetorId, dataInicio, dataFim] : [dataInicio, dataFim, dataInicio, dataFim];
    return getAllRows(query, params);
  } catch (error) {
    console.error('Erro ao obter relatório de recebimentos:', error);
    throw error;
  }
};

// Relatório de Atividade por Setores
export const obterRelatorioAtividadeSetores = (dataInicio, dataFim) => {
  try {
    const query = `SELECT 
      sp.nome as super_setor_nome,
      s.nome as setor_nome,
      ss.nome as subsetor_nome,
      COUNT(DISTINCT mp.id) as total_movimentacoes,
      SUM(CASE WHEN mp.subsetor_origem_id = ss.id THEN pmi.qtde ELSE 0 END) as total_saidas,
      SUM(CASE WHEN mp.subsetor_destino_id = ss.id THEN pmi.qtde ELSE 0 END) as total_entradas,
      SUM(CASE WHEN mp.subsetor_origem_id = ss.id THEN pmi.qtde * pmi.preco_saida ELSE 0 END) as valor_saidas,
      SUM(CASE WHEN mp.subsetor_destino_id = ss.id THEN pmi.qtde * pmi.preco_saida ELSE 0 END) as valor_entradas
    FROM SetorSub ss
    JOIN Setor s ON ss.setor_id = s.id
    JOIN SetorSuper sp ON s.super_setor_id = sp.id
    LEFT JOIN MovimentacaoProduto mp ON (mp.subsetor_origem_id = ss.id OR mp.subsetor_destino_id = ss.id)
      AND DATE(mp.data_hora_movimentacao) BETWEEN ? AND ?
    LEFT JOIN ProdutoMovimentoItem pmi ON mp.id = pmi.movimentacao_produto_id
    GROUP BY ss.id, ss.nome, s.nome, sp.nome
    ORDER BY total_movimentacoes DESC, sp.nome, s.nome, ss.nome`;
    
    return getAllRows(query, [dataInicio, dataFim]);
  } catch (error) {
    console.error('Erro ao obter relatório de atividade de setores:', error);
    throw error;
  }
};

// Gráfico de Movimentações por Dia (últimos 30 dias)
export const obterGraficoMovimentacoesDiarias = (subsetorId = null) => {
  try {
    const query = subsetorId ?
      `SELECT 
        DATE(mp.data_hora_movimentacao) as data,
        COUNT(*) as quantidade_movimentacoes,
        SUM(pmi.qtde) as total_itens
      FROM MovimentacaoProduto mp
      JOIN ProdutoMovimentoItem pmi ON mp.id = pmi.movimentacao_produto_id
      WHERE (mp.subsetor_origem_id = ? OR mp.subsetor_destino_id = ?)
      AND mp.data_hora_movimentacao >= DATE('now', '-30 days')
      GROUP BY DATE(mp.data_hora_movimentacao)
      ORDER BY data DESC` :
      `SELECT 
        DATE(mp.data_hora_movimentacao) as data,
        COUNT(*) as quantidade_movimentacoes,
        SUM(pmi.qtde) as total_itens
      FROM MovimentacaoProduto mp
      JOIN ProdutoMovimentoItem pmi ON mp.id = pmi.movimentacao_produto_id
      WHERE mp.data_hora_movimentacao >= DATE('now', '-30 days')
      GROUP BY DATE(mp.data_hora_movimentacao)
      ORDER BY data DESC`;
    
    const params = subsetorId ? [subsetorId, subsetorId] : [];
    return getAllRows(query, params);
  } catch (error) {
    console.error('Erro ao obter gráfico de movimentações diárias:', error);
    throw error;
  }
};

// ==================== FIM DAS FUNÇÕES DE RELATÓRIOS ====================
