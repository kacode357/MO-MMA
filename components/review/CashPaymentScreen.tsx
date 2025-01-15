import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { createCashPayment } from "../../services/api";

type CashPaymentScreenProps = {
  route: { params: { cartId: string; totalPrice: number } };
  navigation: any;
};

const CashPaymentScreen: React.FC<CashPaymentScreenProps> = ({ route, navigation }) => {
  const { cartId, totalPrice } = route.params;
  const [cashGiven, setCashGiven] = useState<string>("");
  const [change, setChange] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const handleCashInput = (input: string) => {
    setCashGiven(input);
    const cash = parseFloat(input);
    if (!isNaN(cash) && cash >= totalPrice) {
      setChange(cash - totalPrice);
    } else {
      setChange(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (change === null) {
      Alert.alert("Error", "Số tiền đưa không hợp lệ hoặc không đủ để thanh toán.");
      return;
    }

    try {
        console.log(">>>>>>",  cartId, totalPrice);
      await createCashPayment(cartId, totalPrice);
      setPaymentSuccess(true);
      Alert.alert(
        "Thanh toán thành công",
        `Tiền thối lại: ${change.toFixed(0)}đ`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process cash payment.");
    }
  };

  const handlePrintReceipt = () => {
    Alert.alert("In hóa đơn", "Chức năng in hóa đơn chưa được triển khai.");
  };

  const handleExportPDF = () => {
    Alert.alert("Xuất PDF", "Chức năng xuất PDF chưa được triển khai.");
  };

  return (
    <View style={styles.container}>
      {!paymentSuccess ? (
        <>
          <View style={styles.topSection}>
            <Text style={styles.detail}>Tổng Cộng: {totalPrice.toFixed(0)}đ</Text>
          </View>
          <View style={styles.middleSection}>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tiền khách đưa"
              keyboardType="numeric"
              value={cashGiven}
              onChangeText={handleCashInput}
            />
            {change !== null && (
              <Text style={styles.change}>Tiền thối lại: {change.toFixed(0)}đ</Text>
            )}
          </View>
          <View style={styles.bottomSection}>
            <Text style={styles.note}>
              Lưu ý: Khách hàng đưa tiền trước khi nhấn "Xác nhận thanh toán".
            </Text>
            <TouchableOpacity
              style={[styles.button, { opacity: change === null ? 0.5 : 1 }]}
              onPress={handleConfirmPayment}
              disabled={change === null}
            >
              <Text style={styles.buttonText}>Xác nhận thanh toán</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.successSection}>
          <Text style={styles.successMessage}>Thanh toán thành công!</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate("HomePos")}
            >
              <Text style={styles.buttonText}>Quay về Trang chủ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handlePrintReceipt}>
              <Text style={styles.buttonText}>In hóa đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleExportPDF}>
              <Text style={styles.buttonText}>Xuất file PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
  },
  successSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detail: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  change: {
    fontSize: 18,
    color: "#28a745",
    textAlign: "center",
    marginVertical: 10,
  },
  note: {
    fontSize: 14,
    color: "#d84315",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff9800",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#4caf50",
  },
  successMessage: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4caf50",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonGroup: {
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default CashPaymentScreen;
