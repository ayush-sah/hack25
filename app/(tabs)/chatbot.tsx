import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { ThemedView } from "@/components/ThemedView";
import { ThemeProvider } from "@react-navigation/native";

const ChatbotTab = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<any> | null>(null);

  //abc
  const bearerToken ="ya29.a0AXooCgsvVCUf9iyYyO0RRbRT8o6In7brakh2i8bBDNschcITVPd_B8965jcDzEw9PMLX9lrX0eFmT4M9T7tSx4gexuU7LuDz_UeLV_0f9q_QGXQrqJ1LUlz8iO1EOYNmmPM6sTZD2OnmLhJNG8RHEY4WvVV2UF-wUoSFyMcLgdixM3Rv2DVVG0JwcdRvoicV1aQw9JAPWkRn1w9-c78FcSzh3oJ1i8G-LoC9FN_97PlGLKW7lj6ha1UR2Lj0ViCYFlQcpfQVXpgxFRrOCddRL9BrczrTD-pqmRyrrOVC4KyTwRiwVwQZEJevePqvrOnMlNW_mgVrbqd7nTPVnqYBHjvV0mjZPLMUeDEQtXP7akkJSwIMUCQebKUxFvK1dLXsBhkSA8aaaQK0VkCCGYSdkZWXMKMaCgYKAR0SARESFQHGX2MiCsNKbtVdamR7aXeNfCVOJw0418";
  const apiUrl =
    "https://us-central1-aiplatform.googleapis.com/v1/projects/hack-team-ultra-minds/locations/us-central1/publishers/google/models/gemini-1.5-flash-001:generateContent"; // Replace with your actual API endpoint

  const handleMessageSend = async () => {
    if (!message.trim()) return;

    const newChatItem = { text: message, type: "user" };
    setChat((prevChat) => [...prevChat, newChatItem]);
    setMessage("");

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      };

      const payload = JSON.stringify({
        contents: [
          {
            role: "user",
            parts: {
              text: message,
            },
          },
        ],
        generationConfig: {
          temperature: 1.08,
          topP: 0.3,
          topK: 40,
          candidateCount: 1,
          maxOutputTokens: 200,
          presencePenalty: 1.0,
          frequencyPenalty: -1.0,
          responseMimeType: "text/plain",
        },
      });

      const response = await axios.post(apiUrl, payload, config);
      const responseData = response.data;

      const textContent = responseData.candidates[0].content.parts[0].text;
      const newBotChatItem = { text: textContent, type: "bot" };
      setChat((prevChat) => [...prevChat, newBotChatItem]);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "Sorry, there was an error. Please try again later.";
      const newErrorChatItem = { text: errorMessage, type: "bot" };
      setChat((prevChat) => [...prevChat, newErrorChatItem]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderChatItem = ({
    item,
  }: {
    item: { text: string; type: string };
  }) => {
    const isUser = item.type === "user";
    return (
      <View
        style={[
          styles.chatItem,
          { alignSelf: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        <Text style={isUser ? styles.userMessage : styles.botMessage}>
          {item.text}
        </Text>
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
      <ThemedView style={styles.container}>
        <FlatList
          ref={(ref) => (flatListRef.current = ref)}
          data={chat}
          renderItem={renderChatItem}
          keyExtractor={(item, index) => `${index}`}
          contentContainerStyle={styles.chatContainer}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : null
          }
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleMessageSend}
          />
          <Button
            title="Send"
            onPress={handleMessageSend}
            disabled={isLoading}
            color={theme.colors.primary}
          />
        </View>
      </ThemedView>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECF0F1",
  },
  chatContainer: {
    padding: 10,
  },
  chatItem: {
    marginBottom: 10,
    maxWidth: "80%",
    borderRadius: 8,
    overflow: "hidden",
  },
  userMessage: {
    backgroundColor: "#DE3163",
    color: "#fff",
    padding: 10,
    borderTopRightRadius: 0,
  },
  botMessage: {
    backgroundColor: "#008080",
    color: "#fff",
    padding: 10,
    borderTopLeftRadius: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#BDC3C7",
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default ChatbotTab;
