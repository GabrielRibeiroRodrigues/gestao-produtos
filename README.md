# 📱 Gestão de Produtos - App React Native

Sistema completo de gestão de produtos com dashboard, relatórios e controle de estoque desenvolvido com React Native e Expo.

## 📱 Funcionalidades

### ✅ Implementadas

- **Simulação de Login**: Sistema com subsetor fixo (ID: 1 - Horta) simulando usuário logado
- **Cadastro de Produto**: Formulário completo com campos obrigatórios e opcionais
- **Listagem de Produtos**: Visualização de produtos com estoque no subsetor atual
- **Movimentação de Produtos**: Transferência entre setores com validação de estoque
- **Histórico de Movimentações**: Lista completa de movimentações realizadas
- **Confirmação de Recebimento**: Aceitar ou recusar produtos recebidos
- **Scanner QR Code/Código de Barras**: Leitura automática de códigos para cadastro

### 🎯 Principais Características

- **Banco de Dados Local**: SQLite com estrutura completa baseada nos modelos Django
- **Navegação Intuitiva**: Interface amigável com navegação por stack
- **Validações**: Controle de estoque e validações de formulário
- **Filtros**: Sistema de busca e filtros para produtos
- **Status de Movimentação**: Controle de status (Pendente, Confirmado, Recusado)

## 🛠️ Tecnologias Utilizadas

- **React Native** + **Expo SDK 53**
- **SQLite** (expo-sqlite)
- **React Navigation** (Stack Navigator)
- **Expo Camera** + **Expo Barcode Scanner**
- **JavaScript** (ES6+)

## 📂 Estrutura do Projeto

```
gestao-produtos/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Input.js
│   │   ├── DropDown.js
│   │   └── CameraScanner.js
│   ├── context/             # Context API
│   │   └── AuthContext.js
│   ├── database/            # Configuração do banco
│   │   ├── database.js
│   │   ├── seed.js
│   │   └── schema.sql
│   ├── screens/             # Telas do aplicativo
│   │   ├── HomeScreen.js
│   │   ├── CadastroProduto.js
│   │   ├── ListaProdutos.js
│   │   ├── MovimentacaoProduto.js
│   │   ├── ListaMovimentacoes.js
│   │   ├── ConfirmarRecebimento.js
│   │   └── ScannerScreen.js
│   └── services/            # Serviços e utilitários
│       └── estoque.js
├── App.js                   # Componente principal
├── package.json
└── README.md
```

## 🗄️ Estrutura do Banco de Dados

O banco SQLite implementa as seguintes tabelas principais:

### Tabelas de Organização
- `SetorSuper` - Super setores (Produção, Pedagógico, etc.)
- `Setor` - Setores dentro dos super setores
- `SetorSub` - Subsetores (onde o usuário está associado)

### Tabelas de Produtos
- `Produto` - Informações básicas do produto
- `DetalheProduto` - Detalhes específicos (cor, sabor, preços, etc.)
- `DetalheProdutoEstoque` - Controle de estoque por subsetor
- `Marca`, `Modelo`, `Fabricante` - Dados auxiliares

### Tabelas de Movimentação
- `MovimentacaoProduto` - Cabeçalho da movimentação
- `ProdutoMovimentoItem` - Itens da movimentação com status
- `Transacao` - Tipos de transação (Doação, Transferência, etc.)

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Expo CLI
- Dispositivo móvel com Expo Go ou emulador

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd gestao-produtos

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

### Executar no Dispositivo
1. Instale o **Expo Go** no seu dispositivo móvel
2. Execute `npx expo start`
3. Escaneie o QR Code com o Expo Go (Android) ou Camera (iOS)

### Executar no Navegador (Limitado)
```bash
npx expo start --web
```
*Nota: Algumas funcionalidades como câmera não funcionam no navegador*

## 📱 Fluxo de Uso

1. **Tela Inicial**: Menu principal com todas as opções
2. **Cadastrar Produto**: 
   - Preencher informações obrigatórias
   - Usar scanner para GTIN/código de barras
   - Definir estoque inicial
3. **Listar Produtos**: Visualizar produtos com estoque
4. **Movimentar Produtos**:
   - Selecionar produto e quantidade
   - Escolher subsetor de destino
   - Definir tipo de transação
5. **Confirmar Recebimento**: Aceitar ou recusar produtos recebidos
6. **Histórico**: Acompanhar todas as movimentações

## 🔧 Configurações

### Subsetor Fixo
O aplicativo está configurado para simular um usuário logado no subsetor "Horta" (ID: 1). Para alterar:

```javascript
// src/context/AuthContext.js
const [fixedSubsetorId, setFixedSubsetorId] = useState(1); // Altere aqui
```

### Dados Iniciais
Os dados iniciais são populados automaticamente no primeiro uso através do arquivo `src/database/seed.js`.

## 📋 Requisitos Atendidos

✅ Simulação de login com subsetor fixo  
✅ Cadastro completo de produtos  
✅ Listagem com filtros  
✅ Movimentação entre setores  
✅ Controle de estoque  
✅ Confirmação de recebimento  
✅ Scanner de códigos  
✅ Banco SQLite local  
✅ Interface responsiva  

## 🔮 Funcionalidades Futuras

- Sincronização com backend Django
- Relatórios e gráficos
- Importação de XML de notas fiscais
- Balanço físico de produtos
- Integração com dispositivos IoT
- Sistema de usuários completo

## 🤝 Contribuição

Este projeto foi desenvolvido como um MVP (Minimum Viable Product) baseado nos requisitos fornecidos. Para contribuições ou melhorias, siga as boas práticas de desenvolvimento React Native.

## 📄 Licença

Este projeto é de uso interno e educacional.

---

**Desenvolvido com React Native + Expo**  
*Sistema de Gestão e Movimentação de Produtos v1.0*

