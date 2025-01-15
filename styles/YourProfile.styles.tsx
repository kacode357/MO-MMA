import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatar: {
    color: "#FF5733",
    marginTop: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  rowValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    fontSize: 16,
    marginRight: 10,
  },
  placeholder: {
    color: "#aaa",
    fontWeight: "normal",
  },
  filledValue: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default styles;
