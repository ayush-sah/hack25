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
  ScrollView,
  SafeAreaView,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ExpenseTrackerContext } from "../../src/context/ExpenseTrackerContext";
import uuid from "react-native-uuid";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";

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

const { width: screenWidth } = Dimensions.get('window');

export default function RecordsScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<"daily" | "monthly" | "3months" | "6months" | "year">("monthly");
  const [filterDate, setFilterDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setAccountId(state.accounts.length > 0 ? state.accounts[0].id : "");
    setCategoryId(
      state.categories.filter((c) => c.type === type).length > 0
        ? state.categories.filter((c) => c.type === type)[0].id
        : ""
    );
  }, [state.accounts, state.categories, type]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Start from the Sunday before (or on) the 1st
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // End at the Saturday after (or on) the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    // Always show 6 rows (42 days)
    const days = [];
    const current = new Date(startDate);
    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const getTransactionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return state.records.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === dateStr;
    });
  };

  const getTotalForDate = (date: Date) => {
    const transactions = getTransactionsForDate(date);
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'expense' 
        ? total - transaction.amount 
        : total + transaction.amount;
    }, 0);
  };

  const handleDatePress = (date: Date) => {
    router.push({
      pathname: "/date-details",
      params: { date: date.toISOString() }
    });
  };

  function addRecord() {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid positive number (e.g., 25.99)."
      );
      return;
    }
    if (!accountId || !state.accounts.find((a) => a.id === accountId)) {
      Alert.alert(
        "Invalid Account",
        "Please select a valid account or add one in the Accounts tab."
      );
      return;
    }
    if (!categoryId || !state.categories.find((c) => c.id === categoryId)) {
      Alert.alert(
        "Invalid Category",
        "Please select a valid category or add one in the Categories tab."
      );
      return;
    }

    const newRecord = {
      id: uuid.v4(),
      type,
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      currency: "USD",
      accountId,
      categoryId,
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
    setShowForm(false);
    Alert.alert("Success", "Record added successfully!", [{ text: "OK" }]);
  }

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Chunk days into weeks (arrays of 7 days)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <View style={styles.calendarOuterWrap}>
        <View style={styles.calendarContainer}> 
          <View style={styles.calendarHeader}> 
            <TouchableOpacity
              onPress={() => {
                if (filter === "year") {
                  setShowYearPicker(true);
                } else {
                  const prevMonth = new Date(currentDate);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setCurrentDate(prevMonth);
                }
              }}
              style={styles.calendarNavButton}
            >
              <Ionicons name="chevron-back" size={24} color="#008080" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (filter === "year") {
                  setShowYearPicker(true);
                }
              }}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              activeOpacity={filter === "year" ? 0.7 : 1}
            >
              <Text style={[styles.monthText, filter === 'year' && { color: '#DE3163', fontWeight: 'bold', fontSize: 20 }]}> 
                {filter === "year"
                  ? currentDate.getFullYear()
                  : currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
              </Text>
              {filter === 'year' && (
                <Ionicons name="chevron-down" size={18} color="#DE3163" style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (filter === "year") {
                  setShowYearPicker(true);
                } else {
                  const nextMonth = new Date(currentDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setCurrentDate(nextMonth);
                }
              }}
              style={styles.calendarNavButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#008080" />
            </TouchableOpacity>
          </View>
          <View style={styles.weekDays}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.daysContainer}> 
            {weeks.map((week, wIdx) => (
              <View key={wIdx} style={styles.weekRow}>
                {week.map((date, dIdx) => {
                  const isCurrentMonth = date.getMonth() === currentMonth;
                  const isToday = date.toDateString() === today.toDateString();
                  const transactions = getTransactionsForDate(date);
                  const total = getTotalForDate(date);
                  const hasTransactions = transactions.length > 0;
                  return (
                    <TouchableOpacity
                      key={dIdx}
                      style={[
                        styles.day,
                        !isCurrentMonth && styles.otherMonth,
                        isToday && styles.today,
                        hasTransactions && styles.hasTransactions,
                        {
                          borderRadius: 8,
                          borderWidth: isToday ? 2 : 1,
                          borderColor: isToday ? '#DE3163' : '#E0E0E0',
                          backgroundColor: isToday ? '#fff0f6' : (!isCurrentMonth ? '#f8f9fa' : '#fff'),
                          shadowColor: isToday ? '#DE3163' : undefined,
                          shadowOpacity: isToday ? 0.1 : 0,
                          shadowRadius: isToday ? 4 : 0,
                          elevation: isToday ? 1 : 0,
                        }
                      ]}
                      onPress={() => handleDatePress(date)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !isCurrentMonth && styles.otherMonthText,
                          isToday && styles.todayText,
                          {
                            fontWeight: isToday ? 'bold' : '600',
                            fontSize: 14,
                            color: !isCurrentMonth ? '#ccc' : (isToday ? '#DE3163' : '#333'),
                          }
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                      {hasTransactions && (
                        <View style={{ marginTop: 1, alignItems: 'center' }}>
                          <Text style={[
                            styles.transactionAmount,
                            total >= 0 ? styles.incomeAmount : styles.expenseAmount,
                            { fontSize: 10, fontWeight: 'bold' }
                          ]}>
                            ${Math.abs(total).toFixed(0)}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const getFilterStartDate = () => {
    const now = new Date();
    switch (filter) {
      case "daily":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case "monthly":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "3months":
        return new Date(now.getFullYear(), now.getMonth() - 2, 1);
      case "6months":
        return new Date(now.getFullYear(), now.getMonth() - 5, 1);
      case "year":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const filteredRecords = state.records.filter((record) => {
    const recordDate = new Date(record.date);
    const filterStart = getFilterStartDate();
    return recordDate >= filterStart;
  });

  if (state.accounts.length === 0 || state.categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Please add at least one account and one category to add records.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📝 Transaction Records</Text>
          <Text style={styles.headerSubtitle}>
            {filteredRecords.length} transactions • {filter} view
          </Text>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === "list" && styles.activeToggle]}
            onPress={() => setViewMode("list")}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, viewMode === "list" && styles.activeToggleText]}>
              📋 List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === "calendar" && styles.activeToggle]}
            onPress={() => setViewMode("calendar")}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, viewMode === "calendar" && styles.activeToggleText]}>
              📅 Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Bar - only show when in list view */}
        {viewMode === "list" && (
          <View style={styles.filterBar}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filter}
                onValueChange={(itemValue) => setFilter(itemValue)}
                style={styles.filterPicker}
              >
                <Picker.Item label="📅 Daily" value="daily" />
                <Picker.Item label="📊 Monthly" value="monthly" />
                <Picker.Item label="📈 3 Months" value="3months" />
                <Picker.Item label="📊 6 Months" value="6months" />
                <Picker.Item label="📅 Year" value="year" />
              </Picker>
            </View>
            {/* Year Selector Button - only show when Year is selected */}
            {filter === "year" && (
              <TouchableOpacity
                style={styles.yearSelectorButton}
                onPress={() => setShowYearPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.yearSelectorText}>
                  {selectedYear}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#008080" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        {viewMode === "list" ? (
          <View style={styles.recordsCard}>
            <Text style={styles.sectionTitle}>📋 Recent Transactions</Text>
            {filteredRecords.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No transactions found.</Text>
              </View>
            ) : (
              filteredRecords.map((record) => {
                const category = state.categories.find((c) => c.id === record.categoryId);
                const account = state.accounts.find((a) => a.id === record.accountId);
                return (
                  <TouchableOpacity 
                    key={record.id} 
                    style={styles.recordItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recordInfo}>
                      <Text style={styles.categoryIcon}>
                        {CATEGORY_ICONS[category?.name || ""] || "📁"}
                      </Text>
                      <View style={styles.recordDetails}>
                        <Text style={styles.categoryName}>
                          {category?.name || "Unknown"}
                        </Text>
                        <Text style={styles.accountName}>
                          {account?.name || "Unknown Account"}
                        </Text>
                        {record.notes && (
                          <Text style={styles.recordNotes}>{record.notes}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.recordAmount}>
                      <Text style={[
                        styles.amountText,
                        record.type === "expense" ? styles.expenseText : styles.incomeText
                      ]}>
                        {record.type === "expense" ? "-" : "+"}${record.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.recordDate}>
                        {new Date(record.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : (
          <View style={styles.calendarCard}>
            <Text style={styles.sectionTitle}>📅 Calendar View</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScrollContent}>
              {renderCalendar()}
            </ScrollView>
          </View>
        )}

        {/* Add Record Form */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>➕ Add New Transaction</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
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
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={categoryId}
                  onValueChange={(itemValue) => setCategoryId(itemValue)}
                  style={styles.picker}
                >
                  {state.categories
                    .filter((c) => c.type === type)
                    .map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={`${CATEGORY_ICONS[category.name] || "📁"} ${category.name}`}
                        value={category.id}
                      />
                    ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Account</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={accountId}
                  onValueChange={(itemValue) => setAccountId(itemValue)}
                  style={styles.picker}
                >
                  {state.accounts.map((account) => (
                    <Picker.Item
                      key={account.id}
                      label={account.name}
                      value={account.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                placeholder="e.g., 25.99"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                placeholder="e.g., Dinner with friends"
                value={notes}
                onChangeText={setNotes}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!amount ||
                    !accountId ||
                    !categoryId ||
                    isNaN(parseFloat(amount)) ||
                    parseFloat(amount) <= 0) &&
                    styles.addButtonDisabled,
                ]}
                onPress={addRecord}
                disabled={
                  !amount ||
                  !accountId ||
                  !categoryId ||
                  isNaN(parseFloat(amount)) ||
                  parseFloat(amount) <= 0
                }
                activeOpacity={0.7}
              >
                <AntDesign name="pluscircle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Year Picker Modal - moved outside to work in both views */}
        <Modal
          visible={showYearPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowYearPicker(false)}
        >
          <View style={styles.yearPickerOverlay}>
            <View style={styles.yearPickerContainer}>
              <View style={styles.yearPickerHeader}>
                <Text style={styles.yearPickerTitle}>Select Year</Text>
                <TouchableOpacity
                  onPress={() => setShowYearPicker(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.yearPickerContent}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={(year) => setSelectedYear(year)}
                  style={styles.yearPicker}
                  itemStyle={styles.yearPickerItem}
                >
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = new Date().getFullYear() - 25 + i;
                    return (
                      <Picker.Item 
                        key={year} 
                        label={year.toString()} 
                        value={year}
                        color={year === new Date().getFullYear() ? '#DE3163' : '#333'}
                      />
                    );
                  })}
                </Picker>
              </View>
              
              <View style={styles.yearPickerActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowYearPicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    setCurrentDate(new Date(selectedYear, 0, 1));
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#F8F9FB",
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 48,
  },
  activeToggle: {
    backgroundColor: "#008080",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeToggleText: {
    color: "#fff",
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
    width: '100%',
    paddingHorizontal: 8,
  },
  pickerContainer: {
    flex: 1,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: "#bdbdbd",
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 1,
    minHeight: 48,
    overflow: 'hidden',
    position: 'relative',
  },
  filterPicker: {
    height: 48,
    width: '100%',
    maxWidth: Math.min(screenWidth - 32, 300),
  },
  todayButton: {
    backgroundColor: "#008080",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  todayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  recordsCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    width: '100%',
    alignSelf: 'center',
  },
  calendarCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DE3163",
    marginBottom: 10,
    textAlign: "center",
  },
  recordItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    minHeight: 52,
    width: '100%',
    alignSelf: 'center',
  },
  recordInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  recordDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  accountName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  recordNotes: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  recordAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  expenseText: {
    color: "#F44336",
  },
  incomeText: {
    color: "#4CAF50",
  },
  recordDate: {
    fontSize: 12,
    color: "#666",
  },
  calendarContainer: {
    width: 360,
    maxWidth: '100%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarScrollContent: {
    paddingHorizontal: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    paddingVertical: 12,
  },
  calendarNavButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
    flex: 1,
    textAlign: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#008080',
    paddingVertical: 8,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    position: 'relative',
    margin: 1,
    padding: 0,
    minHeight: 44,
  },
  otherMonth: {
    backgroundColor: "#F5F5F5",
  },
  otherMonthText: {
    color: "#CCC",
  },
  today: {
    backgroundColor: "#008080",
  },
  hasTransactions: {
    backgroundColor: "#E8F5E8",
  },
  dayText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  transactionIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
  },
  transactionAmount: {
    fontSize: 10,
    fontWeight: "bold",
  },
  expenseAmount: {
    color: "#F44336",
  },
  incomeAmount: {
    color: "#4CAF50",
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
  calendarOuterWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  yearPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  yearPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  yearPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  yearPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  yearPickerContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  yearPicker: {
    height: 200,
    width: '100%',
  },
  yearPickerItem: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  yearPickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#008080',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#008080',
    fontWeight: 'bold',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#008080',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  yearSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  yearSelectorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
});
