import database from './database';

export async function seedDatabase() {
  try {
    // Inserir dados iniciais para SetorSuper
    database.runSync(
      'INSERT OR IGNORE INTO SetorSuper (id, nome) VALUES (?, ?);',
      [1, 'Produção']
    );
    console.log('SetorSuper Produção inserido ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO SetorSuper (id, nome) VALUES (?, ?);',
      [2, 'Pedagógico']
    );
    console.log('SetorSuper Pedagógico inserido ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO SetorSuper (id, nome) VALUES (?, ?);',
      [3, 'Administrativo e Infraestrutura']
    );
    console.log('SetorSuper Administrativo e Infraestrutura inserido ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO SetorSuper (id, nome) VALUES (?, ?);',
      [4, 'Esportivas']
    );
    console.log('SetorSuper Esportivas inserido ou já existe');

    // Inserir dados iniciais para Setor
    database.runSync(
      'INSERT OR IGNORE INTO Setor (id, super_setor_id, nome) VALUES (?, ?, ?);',
      [1, 1, 'Agricultura']
    );
    console.log('Setor Agricultura inserido ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO Setor (id, super_setor_id, nome) VALUES (?, ?, ?);',
      [2, 1, 'Pecuária']
    );
    console.log('Setor Pecuária inserido ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO Setor (id, super_setor_id, nome) VALUES (?, ?, ?);',
      [3, 1, 'Serviços']
    );
    console.log('Setor Serviços inserido ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO Setor (id, super_setor_id, nome) VALUES (?, ?, ?);',
      [4, 2, 'Den']
    );
    console.log('Setor Den inserido ou já existe');

    // Inserir dados iniciais para SetorSub (exemplo: um subsetor fixo para simulação de login)
    database.runSync(
      'INSERT OR IGNORE INTO SetorSub (id, setor_id, nome) VALUES (?, ?, ?);',
      [1, 1, 'Horta']
    );
    console.log('SetorSub Horta inserido ou já existe');

    // Inserir dados iniciais para Transacao
    database.runSync(
      'INSERT OR IGNORE INTO Transacao (id, transacao) VALUES (?, ?);',
      [1, 'Doação']
    );
    console.log('Transacao Doação inserida ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO Transacao (id, transacao) VALUES (?, ?);',
      [2, 'Perda']
    );
    console.log('Transacao Perda inserida ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO Transacao (id, transacao) VALUES (?, ?);',
      [3, 'Transferência']
    );
    console.log('Transacao Transferência inserida ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO Transacao (id, transacao) VALUES (?, ?);',
      [4, 'Entrada']
    );
    console.log('Transacao Entrada inserida ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO Transacao (id, transacao) VALUES (?, ?);',
      [5, 'Saída']
    );
    console.log('Transacao Saída inserida ou já existe');

    // Inserir dados iniciais para UnidadeMedida
    database.runSync(
      'INSERT OR IGNORE INTO UnidadeMedida (id, nome, sigla) VALUES (?, ?, ?);',
      [1, 'Quilograma', 'kg']
    );
    console.log('UnidadeMedida Quilograma inserida ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO UnidadeMedida (id, nome, sigla) VALUES (?, ?, ?);',
      [2, 'Unidade', 'un']
    );
    console.log('UnidadeMedida Unidade inserida ou já existe');

    // Inserir dados iniciais para TipoEmbalagem
    database.runSync(
      'INSERT OR IGNORE INTO TipoEmbalagem (id, nome) VALUES (?, ?);',
      [1, 'Caixa']
    );
    console.log('TipoEmbalagem Caixa inserida ou já existe');

    database.runSync(
      'INSERT OR IGNORE INTO TipoEmbalagem (id, nome) VALUES (?, ?);',
      [2, 'Saco']
    );
    console.log('TipoEmbalagem Saco inserida ou já existe');

    console.log('Seed do banco de dados concluído com sucesso!');
    
  } catch (error) {
    console.error('Erro no seed do banco de dados:', error);
    throw error;
  }
}

