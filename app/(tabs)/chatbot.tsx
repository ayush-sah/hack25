import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import axios from "axios";
import { ThemedView } from "@/components/ThemedView";
import { ThemeProvider } from "@react-navigation/native";

const ChatbotTab = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isActionsModalVisible, setActionsModalVisible] = useState(false);
  const [isResultsModalVisible, setResultsModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const flatListRef = useRef<FlatList<any> | null>(null);

  // Scroll to bottom when chat updates
  React.useEffect(() => {
    if (flatListRef.current && chat.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chat]);
    
  const apiKey = "";
  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  // ✅ MOCK DATA (used for now, replace with real data later)
  const mockSmsData = [
    {
      date: new Date().setDate(new Date().getDate() - 1),
      body: "Debited INR 500 for groceries at BigBasket on 23-07-2025",
    },
    {
      date: new Date().setDate(new Date().getDate() - 2),
      body: "Rs. 250 debited for dining at Zomato on 22-07-2025",
    },
    {
      date: new Date().setDate(new Date().getDate() - 3),
      body: "Credited INR 1000 salary from Employer on 21-07-2025",
    },
    {
      date: new Date().setDate(new Date().getDate() - 4),
      body: "Debited INR 1200 for electricity bill on 20-07-2025",
    },
    {
      date: new Date().setDate(new Date().getDate() - 5),
      body: "Hello, how are you? (Non-financial message)",
    },
  ];

  const analyzeSpending = async () => {
    setLoading(true);
    setActionsModalVisible(false);

    try {
      const smsArray = mockSmsData;

      const smsContent = smsArray
        .map((sms) => `Date: ${new Date(sms.date).toISOString().split("T")[0]}, Body: ${sms.body}`)
        .join("\n");

      const prompt = `
        You are a financial assistant. Below is a list of SMS messages from the last 7 days. Identify and categorize financial transactions (e.g., debits, credits, payments) by type (e.g., food, shopping, bills, travel). Ignore non-financial messages. Calculate the total spending and number of transactions. Generate a concise financial report (100-150 words) summarizing the spending, including the total amount, number of transactions, and breakdown by category. Provide actionable insights and suggestions for improving financial habits based on the data. Ensure amounts are in INR. List of SMS messages:
        ${smsContent}
      `;

      const response = await axios.post(
        apiUrl,
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
          },
        }
      );

      const textContent = response.data.candidates[0].content.parts[0].text;
      setAnalysisResult(textContent);
      setResultsModalVisible(true);
    } catch (error) {
      setChat((prevChat) => [
        ...prevChat,
        {
          text:
            "Error generating financial report: " +
            (error.response?.data?.error?.message || error.message),
          type: "bot",
        },
      ]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  const handleUnderDevelopment = (feature: string) => {
    setActionsModalVisible(false);
    setChat((prevChat) => [
      ...prevChat,
      { text: `This feature (${feature}) is under development.`, type: "bot" },
    ]);
    scrollToBottom();
  };

  const handleMessageSend = async () => {
    if (!message.trim()) return;

    setChat((prevChat) => [...prevChat, { text: message, type: "user" }]);
    setMessage("");

    try {
      setLoading(true);
      const response = await axios.post(
        apiUrl,
        {
          contents: [{ role: "user", parts: [{ text: message }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
          },
        }
      );

      const textContent = response.data.candidates[0].content.parts[0].text;
      setChat((prevChat) => [...prevChat, { text: textContent, type: "bot" }]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || "Sorry, there was an error.";
      setChat((prevChat) => [...prevChat, { text: errorMessage, type: "bot" }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderChatItem = ({ item }: { item: { text: string; type: string } }) => {
    const isUser = item.type === "user";
    return (
      <View style={[styles.chatItem, isUser ? styles.userChatItem : styles.botChatItem]}>
        <Text style={isUser ? styles.userMessage : styles.botMessage}>{item.text}</Text>
      </View>
    );
  };

  const theme = {
    dark: false,
    colors: {
      primary: "#DE3163",
      secondary: "#008080",
      background: "#ECF0F1",
      card: "#FFFFFF",
      text: "#000000",
      border: "#BDC3C7",
      notification: "#DE3163",
    },
  };

  return (
    <ThemeProvider value={theme}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActionsModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Actions</Text>
            </TouchableOpacity>
          </View>

          {/* MODAL */}
          <Modal visible={isActionsModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select an Action</Text>
                <TouchableOpacity style={styles.modalButton} onPress={analyzeSpending}>
                  <Text style={styles.modalButtonText}>Analyze My Last 7 Days Financial Activity</Text>
                </TouchableOpacity>
                {["View Budget Summary", "Track Investments", "Set Savings Goal", "Analyze Credit Card Spending"].map(
                  (feature) => (
                    <TouchableOpacity
                      key={feature}
                      style={styles.modalButton}
                      onPress={() => handleUnderDevelopment(feature)}
                    >
                      <Text style={styles.modalButtonText}>{feature}</Text>
                    </TouchableOpacity>
                  )
                )}
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setActionsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ANALYSIS RESULTS */}
          <Modal visible={isResultsModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.resultsModalContent}>
                <Text style={styles.resultsModalTitle}>Spending Analysis</Text>
                <ScrollView style={styles.resultsContent}>
                  <Text style={styles.resultsText}>{analysisResult}</Text>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setResultsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* CHAT */}
          <FlatList
            ref={flatListRef}
            data={chat}
            renderItem={renderChatItem}
            keyExtractor={(_, i) => `${i}`}
            contentContainerStyle={styles.chatContainer}
            ListFooterComponent={isLoading ? <ActivityIndicator size="large" color={theme.colors.primary} /> : null}
          />

          {/* MESSAGE INPUT */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleMessageSend}
            />
            <Button title="Send" onPress={handleMessageSend} disabled={isLoading} color={theme.colors.primary} />
          </View>
        </ThemedView>
      </SafeAreaView>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ECF0F1",
  },
  container: {
    flex: 1,
    backgroundColor: "#ECF0F1",
    paddingTop: 40,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#BDC3C7",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  actionButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  modalButton: {
    backgroundColor: "#DE3163",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#BDC3C7",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  resultsModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  resultsModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    color: "#008080",
  },
  resultsContent: {
    flexGrow: 0,
    marginBottom: 20,
    width: "100%",
  },
  resultsText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: "#008080",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  chatContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexGrow: 1,
  },
  chatItem: {
    marginBottom: 15,
    maxWidth: "80%",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userChatItem: {
    alignSelf: "flex-end",
    backgroundColor: "#DE3163",
  },
  botChatItem: {
    alignSelf: "flex-start",
    backgroundColor: "#008080",
  },
  userMessage: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  botMessage: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#BDC3C7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 15,
    backgroundColor: "#F9F9F9",
    fontSize: 16,
  },
});

export default ChatbotTab;