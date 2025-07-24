import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/context/context";
import { RadioButton } from "react-native-paper";
import { Feather } from "@expo/vector-icons";

const RegistrationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { redirectToLogin, cancelRegister } = useAuth();

  const handleRegistration = () => {
    if (
      firstName.length > 0 &&
      lastName.length > 0 &&
      age.length > 0 &&
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    ) {
      alert("Registration done, Please login with your credentials");
      redirectToLogin();
      cancelRegister();
      // navigation.replace('index'); // Navigate to Home after login
    } else if (
      firstName.length > 0 &&
      lastName.length > 0 &&
      age.length > 0 &&
      email.length > 0 &&
      gender.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password !== confirmPassword
    ) {
      alert("Password and Confirm Password do not match");
    } else if (
      firstName.length === 0 ||
      lastName.length === 0 ||
      age.length === 0 ||
      gender.length === 0 ||
      email.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      alert("All field are required to fill for Registration");
    }
  };

  const handleCancel = () => {
    redirectToLogin();
    cancelRegister();
  };
  const Genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Prefer Not To Say", value: "Prefer Not To Say" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration</Text>
      <View style={styles.inputContainer}>
        <Feather name="user" size={24} color="#008080" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor={"#919191"}
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="user" size={24} color="#008080" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          placeholderTextColor={"#919191"}
          onChangeText={setLastName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="user" size={24} color="#008080" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          placeholderTextColor={"#919191"}
          onChangeText={setAge}
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={24} color="#008080" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={"#919191"}
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="lock" size={24} color="#008080" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={"#919191"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="lock" size={24} color="#008080" style={styles.icon} />
        <TextInput
          secureTextEntry
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          placeholderTextColor={"#919191"}
          onChangeText={setConfirmPassword}
        />
      </View>
      <View style={genderstyles.radioGroup}>
        <View style={genderstyles.radioButton}>
          <RadioButton.Android
            value="Male"
            status={gender === "Male" ? "checked" : "unchecked"}
            onPress={() => setGender("Male")}
            color="#007BFF"
          />
          <Text style={genderstyles.radioLabel}>Male</Text>
        </View>

        <View style={genderstyles.radioButton}>
          <RadioButton.Android
            value="Female"
            status={gender === "Female" ? "checked" : "unchecked"}
            onPress={() => setGender("Female")}
            color="#DE3163"
          />
          <Text style={genderstyles.radioLabel}>Female</Text>
        </View>

        <View style={genderstyles.radioButton}>
          <RadioButton.Android
            value="Others"
            status={gender === "Others" ? "checked" : "unchecked"}
            onPress={() => setGender("Others")}
            color="#007BFF"
          />
          <Text style={genderstyles.radioLabel}>Others</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegistration}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={handleCancel}
      >
        <Text style={styles.buttonText}>Cancel</Text>
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
  cancelButton: {
    backgroundColor: "#008080",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#008080",
  },
});

const genderstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 5,
    marginBottom: 20,
    borderRadius: 8,
    padding: 16,
    elevation: 4,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
});

export default RegistrationScreen;
