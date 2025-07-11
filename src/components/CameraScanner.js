import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
// Temporariamente comentado para resolver problemas de módulos
// import { BarCodeScanner } from 'expo-barcode-scanner';

const CameraScanner = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  // Função temporária enquanto o barcode scanner é desabilitado
  useEffect(() => {
    setHasPermission(true);
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    onScan(data);
  };

  // Temporariamente retornar uma mensagem enquanto o scanner está desabilitado
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Scanner temporariamente desabilitado para correção de bugs
      </Text>
      <Button title="Fechar" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});

export default CameraScanner;

