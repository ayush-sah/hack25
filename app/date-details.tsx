import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ExpenseTrackerContext } from "./src/context/ExpenseTrackerContext";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import uuid from "react-native-uuid";
import type { Category, Record as RecordType } from "./src/context/ExpenseTrackerContext";

const CATEGORY_ICONS = {
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

const CATEGORY_GROUPS = [
  {
    label: "Essentials",
    categories: ["Groceries", "Rent", "Utilities", "Transportation"],
  },
  {
    label: "Lifestyle & Leisure",
    categories: ["Entertainment", "Dining Out"],
  },
  {
    label: "Income",
    categories: ["Salary", "Freelance", "Investments"],
  },
];

const getAllCategories = (categories: Category[], type: "expense" | "income") => {
  // Only show categories of the selected type
  return categories.filter((c) => c.type === type);
};

export default function DateDetailsScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const params = useLocalSearchParams();
  const selectedDate = params.date ? new Date(params.date as string) : new Date();

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    setAccountId(state.accounts.length > 0 ? state.accounts[0].id : "");
    setCategoryId(
      state.categories.filter((c) => c.type === type).length > 0
        ? state.categories.filter((c) => c.type === type)[0].id
        : ""
    );
  }, [state.accounts, state.categories, type]);

  const getTransactionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return state.records.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      return recordDate === dateStr;
    });
  };

  const getTotalForDate = (date: Date) => {
    const transactions = getTransactionsForDate(date);
    return transactions.reduce((total, transaction) => {
      return transaction.type === "expense"
        ? total - transaction.amount
        : total + transaction.amount;
    }, 0);
  };

  const addTransaction = () => {
    if ((!categoryId && !customCategory) || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return;
    }
    const newRecord: RecordType = {
      id: uuid.v4() as string,
      type,
      date: selectedDate.toISOString(),
      amount: parseFloat(amount),
      currency: "USD",
      accountId,
      categoryId: showCustom ? customCategory : categoryId,
      notes: notes.trim() || undefined,
    };
    dispatch({ type: "ADD_RECORD", payload: newRecord });
    // Update account balance
    const account = state.accounts.find((a) => a.id === accountId);
    if (account) {
      const updatedBalance =
        type === "expense"
          ? account.balance - parseFloat(amount)
          : account.balance + parseFloat(amount);
      dispatch({
        type: "UPDATE_ACCOUNT",
        payload: { ...account, balance: updatedBalance },
      });
    }
    setAmount("");
    setNotes("");
    setCustomCategory("");
    setShowCustom(false);
  };

  const transactions = getTransactionsForDate(selectedDate);
  const total = getTotalForDate(selectedDate);
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (state.accounts.length === 0 || state.categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Please add at least one account and one category to add transactions.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginRight: 8, zIndex: 2 }}>
          <Ionicons name="arrow-back" size={26} color="#008080" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
      <Text style={styles.dateSubtitle}>{formattedDate}</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Entry Card */}
        <View style={styles.entryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={showCustom ? "custom" : categoryId}
                style={styles.picker}
                onValueChange={(v) => {
                  if (v === "custom") {
                    setShowCustom(true);
                    setCategoryId("");
                  } else {
                    setShowCustom(false);
                    setCategoryId(v);
                  }
                }}
              >
                {getAllCategories(state.categories, type).map((cat: Category) => (
                  <Picker.Item
                    key={cat.id}
                    label={`${CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS] || ""} ${cat.name}`}
                    value={cat.id}
                  />
                ))}
                <Picker.Item label="➕ Add Custom Category" value="custom" />
              </Picker>
            </View>
          </View>
          {showCustom && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom category"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 25.99"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dinner with friends"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <TouchableOpacity style={styles.centeredAddButton} onPress={addTransaction}>
              <AntDesign name="pluscircle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.addExpenseBtnText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Table Card */}
        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>📊 Today's Transactions</Text>
          <View style={styles.tableWrap}>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Category</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Amount</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Notes</Text>
            </View>
            {transactions.length === 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { color: "#888", fontStyle: "italic" }]}>No transactions yet.</Text>
              </View>
            )}
            {transactions.map((item: RecordType, idx: number) => {
              const category = state.categories.find((c: Category) => c.id === item.categoryId);
              return (
                <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowAlt : null]}>
                  <Text style={styles.tableCell}>{CATEGORY_ICONS[category?.name as keyof typeof CATEGORY_ICONS] || ""} {category?.name || item.categoryId || "Unknown"}</Text>
                  <Text style={styles.tableCell}>${item.amount}</Text>
                  <Text style={[styles.tableCell, styles.expenseNote]}>{item.notes}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 24 },
  dateSubtitle: { color: "#008080", fontWeight: "bold", fontSize: 18, marginBottom: 12, textAlign: "center" },
  headerBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#BDC3C7", position: "relative", width: "100%" },
  headerTitle: { position: "absolute", left: 0, right: 0, textAlign: "center", fontSize: 22, fontWeight: "bold", color: "#008080", marginTop: 0, marginBottom: 0, zIndex: 1 },
  entryCard: { width: "100%", backgroundColor: "#F8F9FB", borderRadius: 18, padding: 20, marginBottom: 18, elevation: 3, shadowColor: "#008080", shadowOpacity: 0.08, shadowRadius: 4, alignSelf: "stretch" },
  tableCard: { width: "100%", backgroundColor: "#F8F9FB", borderRadius: 18, padding: 20, marginBottom: 18, elevation: 3, shadowColor: "#008080", shadowOpacity: 0.08, shadowRadius: 4, alignSelf: "stretch" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#DE3163", marginBottom: 10, textAlign: "center", width: "100%" },
  label: { fontSize: 15, color: "#008080", marginBottom: 4, fontWeight: "bold" },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#bdbdbd", flex: 1, minWidth: 80, marginLeft: 8 },
  pickerWrap: { borderWidth: 1, borderColor: "#bdbdbd", borderRadius: 8, backgroundColor: "#fff", elevation: 1, flex: 1, marginLeft: 8 },
  picker: { height: 40, width: "100%" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10, width: "100%" },
  centeredAddButton: { flexDirection: "row", backgroundColor: "#008080", padding: 14, borderRadius: 10, alignItems: "center", justifyContent: "center", minWidth: 160 },
  addExpenseBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  tableWrap: { width: "100%", marginTop: 8, backgroundColor: "#fff", borderRadius: 8, elevation: 1, overflow: "hidden", alignSelf: "stretch" },
  tableRowHeader: { flexDirection: "row", backgroundColor: "#008080", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tableHeader: { color: "#fff", fontWeight: "bold", fontSize: 15, textAlign: "center", paddingVertical: 6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e0e0e0", backgroundColor: "#f8f8ff", alignItems: "center" },
  tableRowAlt: { backgroundColor: "#F3F6F9" },
  tableCell: { flex: 1, padding: 6, fontSize: 14, textAlign: "center" },
  expenseNote: { color: "#263238", fontSize: 13, fontStyle: "italic" },
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