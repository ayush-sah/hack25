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

const CATEGORY_ICONS: { [key: string]: string } = {
  Groceries: "🛒",
  "Rent": "🏠",
  Utilities: "💡",
  "Transportation": "🚌",
  "Entertainment": "🎬",
  "Dining Out": "🍔",
  Salary: "💰",
  Freelance: "🧑‍💻",
  Investments: "📈",
};

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
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Please add an expense category in the Categories tab to create budgets.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalBudget = state.budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = state.budgets.reduce((sum, budget) => sum + getBudgetSpending(budget), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📊 Your Budgets</Text>
          <Text style={styles.totalBudget}>
            Total Budget: ${totalBudget.toFixed(2)}
          </Text>
          <Text style={styles.totalSpent}>
            Total Spent: ${totalSpent.toFixed(2)}
          </Text>
          <Text style={[
            styles.remainingBudget,
            totalSpent > totalBudget ? styles.overBudget : styles.withinBudget
          ]}>
            Remaining: ${(totalBudget - totalSpent).toFixed(2)}
          </Text>
        </View>

        {/* Budgets List */}
        <View style={styles.budgetsCard}>
          <Text style={styles.sectionTitle}>🎯 Budget Overview</Text>
          {state.budgets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No budgets set yet.</Text>
              <Text style={styles.emptySubtext}>Create your first budget to start tracking!</Text>
            </View>
          ) : (
            state.budgets.map((item) => {
              const category = state.categories.find((c) => c.id === item.categoryId);
              const spent = getBudgetSpending(item);
              const isOverBudget = spent > item.amount;
              const progress = Math.min((spent / item.amount) * 100, 100);
              
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.budgetItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.budgetHeader}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryIcon}>
                        {CATEGORY_ICONS[category?.name || ""] || "📁"}
                      </Text>
                      <Text style={styles.categoryName}>
                        {category?.name || "Unknown"}
                      </Text>
                    </View>
                    <Text style={styles.periodText}>
                      {item.period.charAt(0).toUpperCase() + item.period.slice(1)}
                    </Text>
                  </View>
                  
                  <View style={styles.budgetDetails}>
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Budget:</Text>
                      <Text style={styles.budgetAmount}>${item.amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Spent:</Text>
                      <Text style={[
                        styles.budgetAmount,
                        isOverBudget ? styles.overBudgetText : styles.withinBudgetText
                      ]}>
                        ${spent.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Remaining:</Text>
                      <Text style={[
                        styles.budgetAmount,
                        isOverBudget ? styles.overBudgetText : styles.withinBudgetText
                      ]}>
                        ${(item.amount - spent).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${progress}%` },
                          isOverBudget ? styles.progressOverBudget : styles.progressWithinBudget
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Add Budget Form */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>➕ Add New Budget</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#008080" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                placeholder="e.g., 500.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Period</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={period}
                  onValueChange={(itemValue) => setPeriod(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="📅 Monthly" value="monthly" />
                  <Picker.Item label="📆 Weekly" value="weekly" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                  style={styles.picker}
                  enabled={state.categories.filter((c) => c.type === "expense").length > 0}
                >
                  {state.categories.filter((c) => c.type === "expense").length === 0 ? (
                    <Picker.Item label="No expense categories available" value="" />
                  ) : (
                    state.categories
                      .filter((c) => c.type === "expense")
                      .map((category) => (
                        <Picker.Item
                          key={category.id}
                          label={`${CATEGORY_ICONS[category.name] || "📁"} ${category.name}`}
                          value={category.id}
                        />
                      ))
                  )}
                </Picker>
              </View>
            </View>
            
            <View style={styles.addButtonContainer}>
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
                activeOpacity={0.7}
              >
                <AntDesign name="pluscircle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Add Budget</Text>
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
    marginBottom: 12,
  },
  totalBudget: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
  },
  totalSpent: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF9800",
    marginBottom: 4,
  },
  remainingBudget: {
    fontSize: 16,
    fontWeight: "600",
  },
  withinBudget: {
    color: "#4CAF50",
  },
  overBudget: {
    color: "#F44336",
  },
  budgetsCard: {
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
  budgetItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  periodText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  budgetDetails: {
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 14,
    color: "#666",
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  withinBudgetText: {
    color: "#4CAF50",
  },
  overBudgetText: {
    color: "#F44336",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressWithinBudget: {
    backgroundColor: "#4CAF50",
  },
  progressOverBudget: {
    backgroundColor: "#F44336",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    minWidth: 40,
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
