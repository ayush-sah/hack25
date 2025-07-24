import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "@/context/context";
import { Feather } from "@expo/vector-icons";

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, logout, redirectToRegister } = useAuth();

  const handleLogin = () => {
    if (username.trim() === 'admin' && password === 'admin') {
      login();
      redirectToRegister();
      // navigation.replace('index'); // Navigate to Home after login
      // navigation('index')
    } else {
      alert("Please enter valid credentials");
    }
  };

  const redirectToRegistration = () => {
    redirectToRegister();
    logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputContainer}>
        <Feather name="user" size={24} color="#008080" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={"#919191"}
          value={username}
          onChangeText={setUsername}
        />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="lock" size={24} color="#008080" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          placeholderTextColor={"#919191"}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={redirectToRegistration}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#ECF0F1",
  },
  title: {
    fontSize: 32,
    marginBottom: 32,
    textAlign: "center",
    color: "#DE3163",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    elevation: 3,
  },
  icon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333333",
  },
  button: {
    backgroundColor: "#DE3163",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  registerButton: {
    backgroundColor: "#008080",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
