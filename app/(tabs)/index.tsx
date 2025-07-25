import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  Modal,
  Dimensions,
  ScrollView,
  StatusBar,
  Linking,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/context";
import axios from "axios";

const { width } = Dimensions.get("window");
const tileSize = (width - 32) / 2;

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{
    id: string;
    image: any;
    title: string;
    description: string;
  } | null>(null);
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [financeTip, setFinanceTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);

  const { isAuthenticated, logout, cancelRegister } = useAuth();
  const logo = require("../../assets/images/FinWorld.png");

  // Gemini API config (reuse from chatbot)
  // const bearerToken = ""; // Add your Gemini API key here
  // const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  //abc
  const bearerToken = "AIzaSyD6cJhxDKJSV90zYjPqq46FgFTQrSViLhU"; // Replace with your bearer Token
  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  // Fetch a single finance tip when user logs in
  const fetchFinanceTip = React.useCallback(() => {
    setFinanceTip("");
    setTipLoading(true);
    const randomizer = Math.floor(Math.random() * 1000000);
    const prompt = `Give only one very short (1-2 line), practical tip that increases the financial knowledge of a layman. The tip should be creative, actionable, and easy to understand. Do not return a list or multiple tips, just one. (Session: ${randomizer}) Answer in English.`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": `${bearerToken}`,
      },
    };
    const payload = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: {
            text: prompt,
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
    axios
      .post(apiUrl, payload, config)
      .then((response) => {
        const responseData = response.data;
        const textContent =
          responseData.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No tip available.";
        setFinanceTip(textContent);
      })
      .catch(() => {
        setFinanceTip("Sorry, could not fetch tip. Try again later.");
      })
      .finally(() => setTipLoading(false));
  }, [bearerToken, apiUrl]);

  React.useEffect(() => {
    if (isAuthenticated) {
      setTipModalVisible(true);
      fetchFinanceTip();
    }
  }, [isAuthenticated, fetchFinanceTip]);

  const renderTile = ({
    item,
  }: {
    item: { id: string; image: any; title: string; description: string };
  }) => (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => {
        setSelectedTile(item);
        setModalVisible(true);
      }}
    >
      <Image source={item.image} style={styles.tileImage} />
      <View style={styles.titleOverlay}>
        <Text style={styles.tileTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleLogout = () => {
    logout();
    cancelRegister();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text
              style={[styles.headerTitle, {
                color: "#00B6F0",
                fontFamily: "System",
                fontWeight: "bold",
                fontSize: 32,
                letterSpacing: 0.5,
              }]}
            >
              FinWorld
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Feather name="log-out" size={24} color="#00B6F0" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome to FinWorld grow easy with FinWorld</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={[]} // Empty data as tileData is removed
          renderItem={renderTile}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.tileContainer}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedTile && (
                <>
                  <Image
                    source={selectedTile.image}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalTitle}>{selectedTile.title}</Text>
                  <Text style={styles.modalDescription}>
                    {selectedTile.description}
                  </Text>
                </>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      {/* Finance Tip Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={tipModalVisible}
        onRequestClose={() => setTipModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 28,
              width: 340,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              style={{
                backgroundColor: "#e0f7fa",
                borderRadius: 50,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../../assets/images/news-icon.png")}
                style={{ width: 40, height: 40 }}
              />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#008080",
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              Finance Tip
            </Text>
            {tipLoading ? (
              <ActivityIndicator
                size="large"
                color="#008080"
                style={{ marginVertical: 24 }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  color: "#222",
                  marginBottom: 24,
                  textAlign: "center",
                  fontWeight: "500",
                  lineHeight: 26,
                }}
              >
                {financeTip.split(/(\*[^*]+\*)/g).map((part, idx) => {
                  if (/^\*[^*]+\*$/.test(part)) {
                    return (
                      <Text
                        key={idx}
                        style={{ fontWeight: "bold", color: "#008080" }}
                      >
                        {part.slice(1, -1)}
                      </Text>
                    );
                  }
                  return part;
                })}
              </Text>
            )}
            <TouchableOpacity
              style={{
                backgroundColor: "#008080",
                paddingHorizontal: 36,
                paddingVertical: 12,
                borderRadius: 24,
                shadowColor: "#008080",
                shadowOpacity: 0.18,
                shadowRadius: 6,
                elevation: 2,
              }}
              onPress={() => setTipModalVisible(false)}
              activeOpacity={0.85}
              disabled={tipLoading}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                  letterSpacing: 0.2,
                }}
              >
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
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
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerButton: {
    padding: 8,
  },
  tileContainer: {
    padding: 8,
  },
  tile: {
    width: tileSize - 2,
    height: tileSize - 2,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
  },
  tileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
  },
  tileTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
    padding: 16,
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "justify",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#DE3163",
    borderRadius: 20,
    padding: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008080',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default HomeScreen;