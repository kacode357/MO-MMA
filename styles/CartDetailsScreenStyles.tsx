// styles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    position: "relative",
    alignItems: "center",
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  category: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  priceQuantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF5733",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: "#FF5733",
    padding: 3,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#FF5733",
    padding: 5,
    borderRadius: 5,
    textAlign: "center",
    width: 50,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  clearCartButton: {
    marginTop: 10,
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  clearCartText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;
