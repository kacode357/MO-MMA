import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface NotificationModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onClose?: () => void; // Optional callback for closing the modal
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  message,
  onConfirm,
  onClose,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const buttonBackground = useThemeColor(
    {
      light: '#007AFF',
      dark: '#0A84FF',
      red: '#FF0000',
    },
    'tint'
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor }]}>
          <ThemedText style={[styles.modalText, { color: textColor }]}>
            {message}
          </ThemedText>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: buttonBackground }]}
            onPress={onConfirm}
          >
            <ThemedText style={styles.modalButtonText}>Xác nhận</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationModal;