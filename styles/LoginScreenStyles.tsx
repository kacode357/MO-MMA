import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(220, 240, 255, 0.8)",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 240, 255, 0.8)",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 40,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#0000ff",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#1a73e8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    marginVertical: 20,
    color: "#666",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    borderRadius: 25,
    backgroundColor: "#fff",
    elevation: 3,
  },
  signupText: {
    textAlign: "center",
    color: "#666",
  },
  signupLink: {
    color: "#0000ff",
    fontWeight: "bold",
  },
  versionText: {
    position: "absolute",
    bottom: 10,
    right: 10,
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  }
});

export default styles;
