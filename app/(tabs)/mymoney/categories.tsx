import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ExpenseTrackerContext } from "../../src/context/ExpenseTrackerContext";
import uuid from "react-native-uuid";

export default function CategoriesScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");

  function addCategory() {
    if (!name) return;

    const newCategory = {
      id: uuid.v4(),
      name,
      type,
    };

    dispatch({ type: "ADD_CATEGORY", payload: newCategory });

    setName("");
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={state.categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>
              {item.name} ({item.type})
            </Text>
          </View>
        )}
      />
      <TextInput
        placeholder="Category Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => setType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Expense" value="expense" />
        <Picker.Item label="Income" value="income" />
      </Picker>
      <Button title="Add Category" onPress={addCategory} disabled={!name} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  picker: { marginBottom: 12 },
});
