import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Button,
  Alert,
  TextInput,
  Platform,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Sentiment from "sentiment";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

interface MoodLog {
  id: string;
  dateTime: Date;
  mood: string;
  notes: string;
  sentiment: string;
}

const TabMoodTrackerScreen: React.FC = () => {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [mood, setMood] = useState("Happy");
  const [notes, setNotes] = useState("");
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadMoodLogs();
  }, []);

  const loadMoodLogs = async () => {
    try {
      const storedMoodLogs = await AsyncStorage.getItem("moodLogs");
      if (storedMoodLogs) {
        setMoodLogs(JSON.parse(storedMoodLogs));
      }
    } catch (error) {
      console.error("Error loading mood logs:", error);
    }
  };

  const saveMoodLogs = async (updatedMoodLogs: MoodLog[]) => {
    try {
      await AsyncStorage.setItem("moodLogs", JSON.stringify(updatedMoodLogs));
      setMoodLogs(updatedMoodLogs);
    } catch (error) {
      console.error("Error saving mood logs:", error);
    }
  };

  const analyzeSentiment = (text: string) => {
    const sentiment = new Sentiment();
    const result = sentiment.analyze(text);
    if (result.score > 0) {
      return "Positive";
    } else if (result.score < 0) {
      return "Negative";
    } else {
      return "Neutral";
    }
  };

  const addMoodLog = () => {
    const sentiment = analyzeSentiment(notes);
    const newMoodLog: MoodLog = {
      id: Date.now().toString(),
      dateTime: new Date(),
      mood,
      notes,
      sentiment,
    };
    const updatedMoodLogs = [...moodLogs, newMoodLog];
    saveMoodLogs(updatedMoodLogs);
    setModalVisible(false);
    setNotes("");
  };

  const removeMoodLog = (id: string) => {
    const updatedMoodLogs = moodLogs.filter((log) => log.id !== id);
    saveMoodLogs(updatedMoodLogs);
  };

  const toggleMoodForm = () => {
    setShowMoodForm(!showMoodForm);
    setMood("Happy");
    setNotes("");
  };

  const renderMoodLogItem = ({ item }: { item: MoodLog }) => (
    <View style={styles.moodLogCard}>
      <ThemedText style={styles.moodLogDateTime}>
        {item.dateTime.toLocaleString()}
      </ThemedText>
      <View style={styles.moodLogDetails}>
        <ThemedText style={styles.moodLogLabel}>Mood:</ThemedText>
        <ThemedText style={styles.moodLogText}>{item.mood}</ThemedText>
      </View>
      <View style={styles.moodLogDetails}>
        <ThemedText style={styles.moodLogLabel}>Notes:</ThemedText>
        <ThemedText style={styles.moodLogText}>{item.notes}</ThemedText>
      </View>
      <View style={styles.moodLogDetails}>
        <ThemedText style={styles.moodLogLabel}>Sentiment:</ThemedText>
        <ThemedText style={styles.moodLogText}>{item.sentiment}</ThemedText>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeMoodLog(item.id)}
      >
        <Feather name="trash-2" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
  const logo = require("../../assets/images/logo.png");

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <ThemedText style={[styles.headerTitle, { color: "#DE3163" }]}>
                Behavior Tracker
              </ThemedText>
            </View>
          </View>
        </View>
        <FlatList
          data={moodLogs}
          renderItem={renderMoodLogItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <ThemedText style={styles.emptyListText}>
              No mood logs available
            </ThemedText>
          }
          contentContainerStyle={styles.flatListContent}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Add Mood Log</ThemedText>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={mood}
                style={styles.picker}
                onValueChange={(itemValue) => setMood(itemValue)}
              >
                <Picker.Item label="Happy" value="Happy" />
                <Picker.Item label="Sad" value="Sad" />
                <Picker.Item label="Agitated" value="Agitated" />
                <Picker.Item label="Calm" value="Calm" />
              </Picker>
              <TextInput
                style={styles.input}
                placeholder="Observed behavior"
                value={notes}
                onChangeText={(text) => setNotes(text)}
                multiline
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#008080" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#DE3163" }]}
                  onPress={addMoodLog}
                >
                  <ThemedText style={styles.modalButtonText}>Add</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECF0F1",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#BDC3C7",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
    marginTop: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerButton: {
    padding: 8,
  },
  moodLogCard: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodLogDateTime: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2C3E50",
  },
  moodLogDetails: {
    flexDirection: "row",
    marginBottom: 4,
  },
  moodLogLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginRight: 8,
  },
  moodLogText: {
    fontSize: 16,
    color: "#34495E",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#DE3163",
    borderRadius: 20,
    padding: 8,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 18,
    color: "#7F8C8D",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#DE3163",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
  },
  picker: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#BDC3C7",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  flatListContent: {
    paddingBottom: 80,
  },
});

export default TabMoodTrackerScreen;
