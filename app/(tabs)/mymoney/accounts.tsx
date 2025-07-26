import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ExpenseTrackerContext } from "../../src/context/ExpenseTrackerContext";
import uuid from "react-native-uuid";
import { Ionicons, AntDesign } from "@expo/vector-icons";

export default function AccountsScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setCurrency("USD");
  }, []);

  function addAccount() {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Please enter a valid account name.");
      return;
    }
    if (!balance || isNaN(parseFloat(balance))) {
      Alert.alert(
        "Invalid Balance",
        "Please enter a valid number for the initial balance."
      );
      return;
    }

    const newAccount = {
      id: uuid.v4(),
      name: name.trim(),
      balance: parseFloat(balance),
      currency,
    };

    dispatch({ type: "ADD_ACCOUNT", payload: newAccount });
    setName("");
    setBalance("");
    setCurrency("USD");
    setShowForm(false);
    Alert.alert("Success", "Account added successfully!", [{ text: "OK" }]);
  }

  const totalBalance = state.accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>🏦 Your Accounts</Text>
          <Text style={styles.totalBalance}>
            Total Balance: ${totalBalance.toFixed(2)}
          </Text>
          <Text style={styles.accountCount}>
            {state.accounts.length} account{state.accounts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Accounts List */}
        <View style={styles.accountsCard}>
          <Text style={styles.sectionTitle}>💳 Account Overview</Text>
          {state.accounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No accounts yet.</Text>
              <Text style={styles.emptySubtext}>Add your first account to get started!</Text>
            </View>
          ) : (
            state.accounts.map((account) => (
              <TouchableOpacity 
                key={account.id} 
                style={styles.accountItem}
                activeOpacity={0.7}
              >
                <View style={styles.accountInfo}>
                  <View style={styles.accountHeader}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountCurrency}>{account.currency}</Text>
                  </View>
                  <Text style={[
                    styles.accountBalance,
                    account.balance >= 0 ? styles.positiveBalance : styles.negativeBalance
                  ]}>
                    {account.balance >= 0 ? "+" : ""}${account.balance.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add Account Form */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>➕ Add New Account</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#008080" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Account Name</Text>
              <TextInput
                placeholder="e.g., Chase Bank"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Initial Balance</Text>
              <TextInput
                placeholder="e.g., 1000.00"
                value={balance}
                onChangeText={setBalance}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Currency</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={currency}
                  onValueChange={(itemValue) => setCurrency(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="💵 USD" value="USD" />
                  <Picker.Item label="💶 EUR" value="EUR" />
                  <Picker.Item label="💷 GBP" value="GBP" />
                  <Picker.Item label="💴 JPY" value="JPY" />
                  <Picker.Item label="💸 INR" value="INR" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!name.trim() || !balance || isNaN(parseFloat(balance))) &&
                    styles.addButtonDisabled,
                ]}
                onPress={addAccount}
                disabled={!name.trim() || !balance || isNaN(parseFloat(balance))}
                activeOpacity={0.7}
              >
                <AntDesign name="pluscircle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Add Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.8}
      >
        <Ionicons name={showForm ? "close" : "add"} size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 8,
  },
  totalBalance: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
  },
  accountCount: {
    fontSize: 14,
    color: "#666",
  },
  accountsCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DE3163",
    marginBottom: 16,
    textAlign: "center",
  },
  accountItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 60,
  },
  accountInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountHeader: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  accountCurrency: {
    fontSize: 14,
    color: "#666",
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: "bold",
  },
  positiveBalance: {
    color: "#4CAF50",
  },
  negativeBalance: {
    color: "#F44336",
  },
  formCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  formRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: "#008080",
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bdbdbd",
    fontSize: 14,
    minHeight: 48,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 1,
    minHeight: 48,
  },
  picker: {
    height: 48,
    width: "100%",
  },
  addButtonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#008080",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    minHeight: 48,
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#008080",
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
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
