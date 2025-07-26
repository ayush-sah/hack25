import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
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

export default function CategoriesScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function addCategory() {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Please enter a valid category name.");
      return;
    }

    const newCategory = {
      id: uuid.v4(),
      name: name.trim(),
      type,
    };

    dispatch({ type: "ADD_CATEGORY", payload: newCategory });
    setName("");
    setShowForm(false);
    Alert.alert("Success", "Category added successfully!", [{ text: "OK" }]);
  }

  function handleDeleteCategory(categoryId: string, categoryName: string) {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"? This will also remove all transactions and budgets associated with this category.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "DELETE_CATEGORY", payload: categoryId });
            setOpenMenuId(null);
          },
        },
      ]
    );
  }

  const expenseCategories = state.categories.filter(cat => cat.type === "expense");
  const incomeCategories = state.categories.filter(cat => cat.type === "income");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📂 Your Categories</Text>
          <Text style={styles.headerSubtitle}>
            {state.categories.length} categories • {expenseCategories.length} expenses • {incomeCategories.length} income
          </Text>
        </View>

        {/* Expense Categories */}
        <View style={styles.categoriesCard}>
          <Text style={styles.sectionTitle}>💸 Expense Categories</Text>
          {expenseCategories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expense categories yet.</Text>
            </View>
          ) : (
            expenseCategories.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.categoryItem}
                activeOpacity={0.7}
              >
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.name] || "📁"}</Text>
                  <Text style={styles.categoryText}>{item.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  style={styles.menuButton}
                  accessibilityLabel={`More options for ${item.name}`}
                  activeOpacity={0.7}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
                {openMenuId === item.id && (
                  <View style={styles.menu}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleDeleteCategory(item.id, item.name)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={16} color="#FF3B30" />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Income Categories */}
        <View style={styles.categoriesCard}>
          <Text style={styles.sectionTitle}>💰 Income Categories</Text>
          {incomeCategories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No income categories yet.</Text>
            </View>
          ) : (
            incomeCategories.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.categoryItem}
                activeOpacity={0.7}
              >
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item.name] || "📁"}</Text>
                  <Text style={styles.categoryText}>{item.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  style={styles.menuButton}
                  accessibilityLabel={`More options for ${item.name}`}
                  activeOpacity={0.7}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
                {openMenuId === item.id && (
                  <View style={styles.menu}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleDeleteCategory(item.id, item.name)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={16} color="#FF3B30" />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add Category Form */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>➕ Add New Category</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#008080" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                placeholder="e.g., Groceries"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={type}
                  onValueChange={(itemValue) => setType(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="💸 Expense" value="expense" />
                  <Picker.Item label="💰 Income" value="income" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
                onPress={addCategory}
                disabled={!name.trim()}
                activeOpacity={0.7}
              >
                <AntDesign name="pluscircle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Add Category</Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  categoriesCard: {
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
  categoryItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: "relative",
    minHeight: 60,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  menuButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    position: "absolute",
    right: 0,
    top: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    minHeight: 44,
  },
  deleteText: {
    marginLeft: 8,
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
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
  },
});
