import React, { useContext, useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { ExpenseTrackerContext } from "../../src/context/ExpenseTrackerContext";
import uuid from "react-native-uuid";
import { Ionicons } from "@expo/vector-icons";

export default function BudgetsScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setSelectedCategory(
      state.categories.filter((c) => c.type === "expense").length > 0
        ? state.categories.filter((c) => c.type === "expense")[0].id
        : ""
    );
  }, [state.categories]);

  function addBudget() {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid positive number (e.g., 100)."
      );
      return;
    }
    if (
      !selectedCategory ||
      !state.categories.find((c) => c.id === selectedCategory)
    ) {
      Alert.alert(
        "Invalid Category",
        "Please select a valid expense category."
      );
      return;
    }

    const newBudget = {
      id: uuid.v4(),
      categoryId: selectedCategory,
      amount: parseFloat(amount),
      period,
    };

    dispatch({ type: "ADD_BUDGET", payload: newBudget });
    setAmount("");
    setPeriod("monthly");
    setSelectedCategory(
      state.categories.filter((c) => c.type === "expense").length > 0
        ? state.categories.filter((c) => c.type === "expense")[0].id
        : ""
    );
    setShowForm(false);
    Alert.alert("Success", "Budget added successfully!", [{ text: "OK" }]);
  }

  function getBudgetSpending(budget: {
    id: string;
    categoryId: string;
    amount: number;
    period: "weekly" | "monthly";
  }) {
    const now = new Date();
    const periodStart =
      budget.period === "weekly"
        ? new Date(now.setDate(now.getDate() - now.getDay()))
        : new Date(now.getFullYear(), now.getMonth(), 1);

    return state.records
      .filter(
        (r) =>
          r.categoryId === budget.categoryId &&
          r.type === "expense" &&
          new Date(r.date) >= periodStart
      )
      .reduce((sum, r) => sum + r.amount, 0);
  }

  if (state.categories.filter((c) => c.type === "expense").length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Please add an expense category in the Categories tab to create
          budgets.
        </Text>
      </View>
    );
  }

  const recentBudgets = state.budgets.slice(0, 5);

  return (
    <View style={styles.container}>
      <FlatList
        data={recentBudgets}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Budgets</Text>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Budgets</Text>
                {state.budgets.length > 5 && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Info",
                        "Full budget list can be viewed in a detailed view (coming soon)."
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
        renderItem={({ item }) => {
          const category = state.categories.find(
            (c) => c.id === item.categoryId
          );
          const spent = getBudgetSpending(item);
          const isOverBudget = spent > item.amount;
          return (
            <View
              style={[
                styles.budgetItem,
                isOverBudget ? styles.overBudget : styles.withinBudget,
              ]}
            >
              <Text style={styles.budgetText}>
                Category: {category?.name || "Unknown"}
              </Text>
              <Text style={styles.budgetText}>
                Budget: ${item.amount.toFixed(2)} ({item.period})
              </Text>
              <Text style={styles.budgetText}>Spent: ${spent.toFixed(2)}</Text>
              <Text style={styles.budgetText}>
                Remaining: ${(item.amount - spent).toFixed(2)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No budgets set yet.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
      {showForm && (
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Add Budget</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Amount (e.g., 100)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={period}
              onValueChange={(itemValue) => setPeriod(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Weekly" value="weekly" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
              enabled={
                state.categories.filter((c) => c.type === "expense").length > 0
              }
            >
              {state.categories.filter((c) => c.type === "expense").length ===
              0 ? (
                <Picker.Item label="No expense categories available" value="" />
              ) : (
                state.categories
                  .filter((c) => c.type === "expense")
                  .map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={category.name}
                      value={category.id}
                    />
                  ))
              )}
            </Picker>
          </View>
          <TouchableOpacity
            style={[
              styles.addButton,
              (!amount ||
                !selectedCategory ||
                isNaN(parseFloat(amount)) ||
                parseFloat(amount) <= 0) &&
                styles.addButtonDisabled,
            ]}
            onPress={addBudget}
            disabled={
              !amount ||
              !selectedCategory ||
              isNaN(parseFloat(amount)) ||
              parseFloat(amount) <= 0
            }
          >
            <Text style={styles.addButtonText}>Add Budget</Text>
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
  budgetItem: {
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
  },
  overBudget: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
    backgroundColor: "#ffe6e6",
  },
  withinBudget: {
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
  },
  budgetText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
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
  pickerContainer: {
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    fontSize: 14,
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
