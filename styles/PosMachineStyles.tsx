 import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    error: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    quantity: {
        fontSize: 14,
        color: "#777",
        marginVertical: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    buttons: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4, // Added margin to increase spacing between buttons
    },
    disabledButton: {
        backgroundColor: "#ccc", // Màu xám khi nút bị vô hiệu hóa
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    quantityText: {
        marginHorizontal: 8,
        fontSize: 16,
        fontWeight: "bold",
    },
    summary: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "#f9f9f9",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    placeOrderButton: {
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#007AFF",
        alignItems: "center",
    },
    placeOrderButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
export default styles;