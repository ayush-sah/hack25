


import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";

const { width } = Dimensions.get("window");

interface RoutineItem {
  id: string;
  name: string;
  time: Date;
  category: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
}

const DailyRoutineTab: React.FC = () => {
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemTime, setNewItemTime] = useState(new Date());
  const [newItemCategory, setNewItemCategory] = useState<
    "HIGH" | "MEDIUM" | "LOW"
  >("MEDIUM"); // Default category
  const [showForm, setShowForm] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadRoutineItems();
  }, []);

  const loadRoutineItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("routineItems");
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        const itemsWithDates = parsedItems.map(
          (item: { time: string | number | Date }) => ({
            ...item,
            time: new Date(item.time),
          })
        );
        setRoutineItems(itemsWithDates);
      }
    } catch (error) {
      console.error("Error loading routine items:", error);
    }
  };

  const saveRoutineItems = async (updatedItems: RoutineItem[]) => {
    try {
      await AsyncStorage.setItem("routineItems", JSON.stringify(updatedItems));
      setRoutineItems(updatedItems);
    } catch (error) {
      console.error("Error saving routine items:", error);
    }
  };

  const addRoutineItem = () => {
    if (newItemName.trim() === "" || newItemCategory.trim() === "") {
      Alert.alert(
        "Invalid Input",
        "Please enter a name and category for the routine item."
      );
      return;
    }

    const newItem: RoutineItem = {
      id: Date.now().toString(),
      name: newItemName,
      time: newItemTime,
      category: newItemCategory,
      completed: false, // Initialize new tasks as incomplete
    };

    const updatedItems = [...routineItems, newItem].sort(
      (a, b) =>
        (a.time instanceof Date ? a.time : new Date(a.time)).getTime() -
        (b.time instanceof Date ? b.time : new Date(b.time)).getTime()
    );

    saveRoutineItems(updatedItems);
    setNewItemName("");
    setNewItemTime(new Date());
    setShowForm(false);
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedItems = routineItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveRoutineItems(updatedItems);
  };

  const removeRoutineItem = (id: string) => {
    const updatedItems = routineItems.filter((item) => item.id !== id);
    saveRoutineItems(updatedItems);
  };

  const filteredItems = routineItems.filter(
    (item) => item.category === newItemCategory
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Add tasks</ThemedText>
        <View style={styles.dropdownContainer}>
          <RNPickerSelect
            value={newItemCategory}
            onValueChange={(value) =>
              setNewItemCategory(value as "HIGH" | "MEDIUM" | "LOW")
            }
            items={[
              { label: "HIGH", value: "HIGH" },
              { label: "MEDIUM", value: "MEDIUM" },
              { label: "LOW", value: "LOW" },
            ]}
            style={{
              inputIOS: styles.dropdown,
              inputAndroid: styles.dropdown,
            }}
          />
        </View>
      </View>
      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <View style={styles.routineItem}>
            <TouchableOpacity
              onPress={() => toggleTaskCompletion(item.id)}
              style={styles.checkbox}
            >
              <AntDesign
                name={item.completed ? "checksquare" : "checksquareo"}
                size={24}
                color={item.completed ? "#008080" : "#A9A9A9"}
              />
            </TouchableOpacity>
            <View style={styles.itemDetails}>
              <ThemedText
                style={[
                  styles.itemName,
                  {
                    textDecorationLine: item.completed
                      ? "line-through"
                      : "none",
                  },
                ]}
              >
                {item.name}
              </ThemedText>
              <ThemedText
                style={[
                  styles.itemTime,
                  {
                    textDecorationLine: item.completed
                      ? "line-through"
                      : "none",
                  },
                ]}
              >
                {item.time instanceof Date
                  ? item.time.toLocaleTimeString()
                  : new Date(item.time).toLocaleTimeString()}
              </ThemedText>
              <ThemedText
                style={[
                  styles.itemCategory,
                  {
                    textDecorationLine: item.completed
                      ? "line-through"
                      : "none",
                  },
                ]}
              >
                Category: {item.category}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => removeRoutineItem(item.id)}>
              <AntDesign name="delete" size={24} color="#ff6347" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      {showForm ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Activity Name"
            value={newItemName}
            onChangeText={setNewItemName}
          />
          {showTimePicker && (
            <DateTimePicker
              value={newItemTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedTime) => {
                if (selectedTime) {
                  setNewItemTime(selectedTime);
                  setShowTimePicker(false); // Hide the time picker after selecting a time
                } else {
                  setShowTimePicker(false); // Hide the time picker if the selection is canceled
                }
              }}
            />
          )}

          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <AntDesign name="clockcircleo" size={24} color="#008080" />
            <ThemedText style={styles.timePickerText}>
              {newItemTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={addRoutineItem}>
            <ThemedText style={styles.addButtonText}>
              Add Routine Item
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <AntDesign name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECF0F1",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 10,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#BDC3C7",
    marginBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Align items horizontally
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#DE3163",
  },
  dropdownContainer: {
    flex: 1,
    marginLeft: 10, // Adjust spacing between title and dropdown
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#BDC3C7",
    paddingHorizontal: 10,
  },
  dropdown: {
    height: 40,
    marginBottom: 16,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  routineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  itemTime: {
    fontSize: 14,
    color: "#666666",
  },
  itemCategory: {
    fontSize: 14,
    color: "#008080",
    fontWeight: "bold",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#BDC3C7",
    borderRadius: 5,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#008080",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: width * 0.1,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 5,
    marginBottom: 16,
  },
  timePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333333",
  },
  checkbox: {
    marginRight: 10,
  },
});

export default DailyRoutineTab;
