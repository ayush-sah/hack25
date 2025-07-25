import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { ExpenseTrackerContext } from "../../src/context/ExpenseTrackerContext";
import uuid from "react-native-uuid";
import { Ionicons } from "@expo/vector-icons";

export default function AccountsScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showForm, setShowForm] = useState(false);

  function addAccount() {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Please enter a valid account name.");
      return;
    }
    if (!balance || isNaN(parseFloat(balance)) || parseFloat(balance) < 0) {
      Alert.alert(
        "Invalid Balance",
        "Please enter a valid non-negative number for the balance (e.g., 100.00)."
      );
      return;
    }
    if (!currency.trim() || !/^[A-Z]{3}$/.test(currency.trim())) {
      Alert.alert(
        "Invalid Currency",
        "Please enter a valid 3-letter currency code (e.g., USD)."
      );
      return;
    }

    const newAccount = {
      id: uuid.v4(),
      name: name.trim(),
      balance: parseFloat(balance),
      currency: currency.trim().toUpperCase(),
    };

    dispatch({ type: "ADD_ACCOUNT", payload: newAccount });
    setName("");
    setBalance("");
    setCurrency("USD");
    setShowForm(false);
    Alert.alert("Success", "Account added successfully!", [{ text: "OK" }]);
  }

  const recentAccounts = state.accounts.slice(0, 5);

  return (
    <View style={styles.container}>
      <FlatList
        data={recentAccounts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Accounts</Text>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Accounts</Text>
                {state.accounts.length > 5 && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Info",
                        "Full account list can be viewed in a detailed view (coming soon)."
                      )
                    }
                  >
                    <Text style={styles.viewMore}>View More</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.accountItem}>
            <Text style={styles.accountText}>{item.name}</Text>
            <Text style={styles.accountBalance}>
              {item.balance < 0 ? "-" : ""}${Math.abs(item.balance).toFixed(2)}{" "}
              {item.currency}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No accounts added yet.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
      {showForm && (
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Add Account</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Account Name (e.g., Savings)"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Initial Balance (e.g., 100.00)"
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Currency (e.g., USD)"
            value={currency}
            onChangeText={setCurrency}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              (!name.trim() ||
                !balance ||
                isNaN(parseFloat(balance)) ||
                parseFloat(balance) < 0 ||
                !currency.trim() ||
                !/^[A-Z]{3}$/.test(currency.trim())) &&
                styles.addButtonDisabled,
            ]}
            onPress={addAccount}
            disabled={
              !name.trim() ||
              !balance ||
              isNaN(parseFloat(balance)) ||
              parseFloat(balance) < 0 ||
              !currency.trim() ||
              !/^[A-Z]{3}$/.test(currency.trim())
            }
          >
            <Text style={styles.addButtonText}>Add Account</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(!showForm)}
      >
        <Ionicons name={showForm ? "close" : "add"} size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContent: {
    paddingBottom: 80, // Space for FAB
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginVertical: 16,
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  viewMore: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  accountItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountText: {
    fontSize: 14,
    color: "#333",
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  formContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: Dimensions.get("window").height * 0.5,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
