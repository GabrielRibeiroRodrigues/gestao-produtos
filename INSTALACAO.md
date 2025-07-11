# 📱 Guia de Instalação - Sistema de Gestão de Produtos

## 🎯 Opções de Execução

### 1. 📱 **Dispositivo Móvel (Recomendado)**
A melhor experiência é no dispositivo móvel real, onde todas as funcionalidades estão disponíveis.

#### Pré-requisitos:
- Smartphone Android ou iOS
- App **Expo Go** instalado
- Conexão com a mesma rede Wi-Fi do computador

#### Passos:
1. **Instale o Expo Go**:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **No computador**:
   ```bash
   cd gestao-produtos
   npx expo start
   ```

3. **No dispositivo**:
   - Abra o Expo Go
   - Escaneie o QR Code que aparece no terminal
   - Aguarde o carregamento do app

### 2. 🖥️ **Emulador Android**
Para desenvolvimento e testes mais avançados.

#### Pré-requisitos:
- Android Studio instalado
- Emulador Android configurado

#### Passos:
1. **Inicie o emulador Android**
2. **No terminal**:
   ```bash
   cd gestao-produtos
   npx expo start
   ```
3. **Pressione 'a'** para abrir no Android

### 3. 📱 **Simulador iOS** (Apenas macOS)
Para usuários Mac com Xcode.

#### Pré-requisitos:
- macOS
- Xcode instalado
- iOS Simulator

#### Passos:
1. **No terminal**:
   ```bash
   cd gestao-produtos
   npx expo start
   ```
2. **Pressione 'i'** para abrir no iOS Simulator

### 4. 🌐 **Navegador Web** (Limitado)
Funcionalidade limitada - sem câmera/scanner.

#### Passos:
```bash
cd gestao-produtos
npx expo start --web
```

## 🔧 Instalação Completa

### 1. **Clone o Projeto**
```bash
git clone <url-do-repositorio>
cd gestao-produtos
```

### 2. **Instale Dependências**
```bash
npm install
```

### 3. **Verifique a Instalação**
```bash
npx expo doctor
```

### 4. **Inicie o Projeto**
```bash
npx expo start
```

## 🚨 Solução de Problemas

### Erro: "Metro bundler failed"
```bash
# Limpe o cache
npx expo start --clear

# Ou reinstale dependências
rm -rf node_modules
npm install
```

### Erro: "Unable to resolve module"
```bash
# Instale dependências específicas
npx expo install expo-sqlite
npx expo install @react-navigation/native
```

### QR Code não funciona
1. Verifique se ambos dispositivos estão na mesma rede
2. Tente usar o modo tunnel:
   ```bash
   npx expo start --tunnel
   ```

### Câmera não funciona no Expo Go
- Certifique-se de dar permissão para câmera
- Teste em dispositivo físico (não funciona em emulador)

## 📋 Checklist de Funcionalidades

Após a instalação, teste as seguintes funcionalidades:

- [ ] **Tela inicial** carrega corretamente
- [ ] **Cadastro de produto** - formulário funciona
- [ ] **Scanner** - câmera abre (apenas dispositivo físico)
- [ ] **Lista de produtos** - mostra produtos cadastrados
- [ ] **Movimentação** - transfere produtos entre setores
- [ ] **Confirmação** - aceita/rejeita recebimentos
- [ ] **Histórico** - lista movimentações

## 🔍 Logs e Debug

### Ver logs detalhados:
```bash
npx expo start --dev-client
```

### Debug no dispositivo:
1. Abra o app no Expo Go
2. Agite o dispositivo
3. Selecione "Debug Remote JS"

## 📞 Suporte

### Comandos Úteis:
```bash
# Verificar versão do Expo
npx expo --version

# Verificar dependências
npx expo doctor

# Limpar cache
npx expo start --clear

# Modo tunnel (para redes restritivas)
npx expo start --tunnel
```

### Logs de Erro:
- Verifique o terminal onde rodou `npx expo start`
- No dispositivo, agite e veja "Show Dev Menu"
- Use `console.log()` para debug no código

---

**💡 Dica**: Para melhor experiência, use sempre um dispositivo físico com o Expo Go!

