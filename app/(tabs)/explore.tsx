import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");

interface Entry {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string; // ISO string
  recurring?: boolean;
}

const ExploreScreen = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [recurring, setRecurring] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load from storage
  useEffect(() => {
    AsyncStorage.getItem("cashflowEntries").then((data) => {
      if (data) setEntries(JSON.parse(data));
    });
  }, []);
  // Save to storage
  useEffect(() => {
    AsyncStorage.setItem("cashflowEntries", JSON.stringify(entries));
  }, [entries]);

  // Add or edit entry
  const handleSave = () => {
    if (!desc.trim() || !amount.trim() || isNaN(Number(amount))) return;
    const entry: Entry = {
      id: editingId || Date.now().toString(),
      type,
      amount: Number(amount),
      description: desc,
      date: entryDate.toISOString(),
      recurring,
    };
    let updated;
    if (editingId) {
      updated = entries.map((e) => (e.id === editingId ? entry : e));
    } else {
      updated = [entry, ...entries];
    }
    setEntries(updated);
    setDesc("");
    setAmount("");
    setType("income");
    setRecurring(false);
    setEditingId(null);
    setEntryDate(new Date());
  };

  const handleEdit = (entry: Entry) => {
    setDesc(entry.description);
    setAmount(entry.amount.toString());
    setType(entry.type);
    setRecurring(!!entry.recurring);
    setEditingId(entry.id);
    setEntryDate(new Date(entry.date));
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    if (editingId === id) {
      setDesc("");
      setAmount("");
      setType("income");
      setRecurring(false);
      setEditingId(null);
      setEntryDate(new Date());
    }
  };

  // Cash flow summary
  const balance = entries.reduce(
    (sum, e) => (e.type === "income" ? sum + e.amount : sum - e.amount),
    0
  );
  const today = new Date();
  // Forecast: add recurring entries for next 30 days
  const forecast = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    let bal = balance;
    entries.forEach((e) => {
      if (e.recurring) {
        // Assume recurring every 7 days
        const entryDate = new Date(e.date);
        const daysSince = Math.floor(
          (date.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSince >= 0 && daysSince % 7 === 0) {
          bal += e.type === "income" ? e.amount : -e.amount;
        }
      }
    });
    return { date, bal };
  });

  // Chart data
  const chartData = {
    labels: forecast.map((f, i) =>
      i % 5 === 0 ? f.date.toLocaleDateString() : ""
    ),
    datasets: [
      {
        data: forecast.map((f) => f.bal),
        color: () => "#008080",
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>Balance: ${balance.toFixed(2)}</Text>
        <View style={styles.formRow}>
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={desc}
            onChangeText={setDesc}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.formRow}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === "income" && styles.typeBtnActiveIncome,
            ]}
            onPress={() => setType("income")}
          >
            <Feather
              name="arrow-down-circle"
              size={18}
              color={type === "income" ? "#fff" : "#008080"}
            />
            <Text
              style={[
                styles.typeBtnText,
                type === "income" && { color: "#fff" },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              type === "expense" && styles.typeBtnActiveExpense,
            ]}
            onPress={() => setType("expense")}
          >
            <Feather
              name="arrow-up-circle"
              size={18}
              color={type === "expense" ? "#fff" : "#DE3163"}
            />
            <Text
              style={[
                styles.typeBtnText,
                type === "expense" && { color: "#fff" },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.recurringBtn,
              recurring && styles.recurringBtnActive,
            ]}
            onPress={() => setRecurring((r) => !r)}
          >
            <AntDesign
              name={recurring ? "checksquare" : "checksquareo"}
              size={18}
              color={recurring ? "#008080" : "#888"}
            />
            <Text style={styles.recurringBtnText}>Recurring</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <AntDesign name="calendar" size={18} color="#008080" />
            <Text style={styles.dateBtnText}>
              {entryDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <Modal
            transparent
            animationType="fade"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View style={styles.pickerOverlay}>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={entryDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setEntryDate(selectedDate);
                    }}
                    style={{ width: 320, backgroundColor: "#fff" }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{editingId ? "Update" : "Add"}</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Entries</Text>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.entryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryDesc}>{item.description}</Text>
                <Text style={styles.entryMeta}>
                  {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}{" "}
                  | {new Date(item.date).toLocaleDateString()}{" "}
                  {item.recurring ? "(Recurring)" : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Feather
                  name="edit"
                  size={20}
                  color="#008080"
                  style={{ marginRight: 12 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <AntDesign name="delete" size={20} color="#DE3163" />
              </TouchableOpacity>
            </View>
          )}
          style={{ marginBottom: 24 }}
        />
        <Text style={styles.sectionTitle}>30-Day Forecast</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={width - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "3",
                strokeWidth: "2",
                stroke: "#008080",
              },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 12,
    marginTop: 8,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    fontSize: 16,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  typeBtnActiveIncome: {
    backgroundColor: "#008080",
    borderColor: "#008080",
  },
  typeBtnActiveExpense: {
    backgroundColor: "#DE3163",
    borderColor: "#DE3163",
  },
  typeBtnText: {
    marginLeft: 6,
    fontWeight: "bold",
    color: "#008080",
  },
  recurringBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  recurringBtnActive: {
    borderColor: "#008080",
    backgroundColor: "#e0f7fa",
  },
  recurringBtnText: {
    marginLeft: 6,
    color: "#008080",
    fontWeight: "bold",
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  dateBtnText: {
    marginLeft: 6,
    color: "#008080",
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#008080",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  entryDesc: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  entryMeta: {
    fontSize: 14,
    color: "#888",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 320,
    maxWidth: "90%",
    alignSelf: "center",
  },
});

export default ExploreScreen;
