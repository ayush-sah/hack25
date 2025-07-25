import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const REMINDERS_KEY = "billReminders";

const reminderTypes = ["Bill", "Subscription", "EMI"];

type Reminder = {
  id: string;
  name: string;
  amount: number;
  type: string;
  dueDate: string;
};

function formatDate(date: Date) {
  return date.toLocaleDateString();
}

const BillRemindersScreen = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(reminderTypes[0]);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load reminders from storage
  useEffect(() => {
    AsyncStorage.getItem(REMINDERS_KEY).then((data) => {
      if (data) setReminders(JSON.parse(data));
    });
  }, []);
  // Save reminders to storage
  useEffect(() => {
    AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }, [reminders]);

  const resetForm = () => {
    setName("");
    setAmount("");
    setType(reminderTypes[0]);
    setDueDate(new Date());
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (reminder: Reminder) => {
    setName(reminder.name);
    setAmount(reminder.amount.toString());
    setType(reminder.type);
    setDueDate(new Date(reminder.dueDate));
    setEditingId(reminder.id);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim() || !amount.trim() || isNaN(Number(amount))) {
      Alert.alert("Invalid input", "Please enter valid name and amount.");
      return;
    }
    const newReminder: Reminder = {
      id: editingId || Date.now().toString(),
      name,
      amount: Number(amount),
      type,
      dueDate: dueDate.toISOString(),
    };
    let updated;
    if (editingId) {
      updated = reminders.map((r) => (r.id === editingId ? newReminder : r));
    } else {
      updated = [newReminder, ...reminders];
    }
    setReminders(updated);
    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Reminder", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setReminders(reminders.filter((r) => r.id !== id)),
      },
    ]);
  };

  const renderReminder = ({ item }: { item: Reminder }) => {
    const due = new Date(item.dueDate);
    const now = new Date();
    const isOverdue = due < now && !isSameDay(due, now);
    const isToday = isSameDay(due, now);
    return (
      <View
        style={[
          styles.reminderItem,
          isOverdue && styles.overdue,
          isToday && styles.today,
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.reminderName}>{item.name}</Text>
          <Text style={styles.reminderDetails}>
            {item.type} | Due: {formatDate(due)} | ₹{item.amount}
          </Text>
        </View>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: "#d00" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Bill Reminders</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        {reminders.length === 0 ? (
          <Text style={styles.placeholderText}>
            No reminders yet. Tap "+ Add" to create one!
          </Text>
        ) : (
          <FlatList
            data={[...reminders].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())}
            keyExtractor={(item) => item.id}
            renderItem={renderReminder}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
      {/* Modal for Add/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Edit" : "Add"} Reminder</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (e.g. Electricity Bill)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <View style={styles.typeRow}>
              {reminderTypes.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={type === t ? styles.typeBtnTextActive : styles.typeBtnText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateBtn}
            >
              <Text style={styles.dateBtnText}>Due Date: {formatDate(dueDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  setShowDatePicker(false);
                  if (selected) setDueDate(selected);
                }}
                minimumDate={new Date()}
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={[styles.modalBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.modalBtn, styles.saveBtn]}>
                <Text style={styles.saveBtnText}>{editingId ? "Save" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 12,
    flexDirection: "row",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    letterSpacing: 1,
    flex: 1,
    textAlign: "center",
  },
  addBtn: {
    backgroundColor: "#008080",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overdue: {
    borderColor: "#d00",
    borderWidth: 1,
    backgroundColor: "#ffeaea",
  },
  today: {
    borderColor: "#008080",
    borderWidth: 1,
    backgroundColor: "#e0f7fa",
  },
  reminderName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  reminderDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  actionBtn: {
    marginLeft: 10,
    padding: 6,
  },
  actionText: {
    color: "#008080",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#008080",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
  },
  typeBtnActive: {
    backgroundColor: "#008080",
    borderColor: "#008080",
  },
  typeBtnText: {
    color: "#008080",
    fontWeight: "bold",
  },
  typeBtnTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  dateBtn: {
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  dateBtnText: {
    color: "#008080",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: "#eee",
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#008080",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BillRemindersScreen; 