import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal } from 'react-native';
import CameraScanner from '../components/CameraScanner';

const ScannerScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const { onScanResult, title = 'Scanner de Código' } = route.params || {};

  const handleScan = (data) => {
    setModalVisible(false);
    
    if (onScanResult) {
      onScanResult(data);
    } else {
      Alert.alert('Código Escaneado', `Dados: ${data}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
    
    navigation.goBack();
  };

  const handleClose = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <CameraScanner onScan={handleScan} onClose={handleClose} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default ScannerScreen;

