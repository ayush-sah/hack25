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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/context";

const tileData = [
  {
    id: "1",
    title: "Understanding Dementia",
    image: require("../../assets/images/understanding-dementia.png"),
    description:
      "Dementia is an umbrella term for a range of progressive conditions that affect the brain.\n\nEach type of dementia stops a person’s brain cells (neurones) working properly in specific areas, affecting their ability to remember, think and speak.\n\nDoctors typically use the word ‘‘dementia’’ to describe common symptoms – such as memory loss, confusion, and problems with speech and understanding – that get worse over time.\n\nDementia can affect a person at any age but it’s more common in people over the age of 65.",
  },
  {
    id: "2",
    title: "Coping Strategies",
    image: require("../../assets/images/coping-strategy.png"),
    description:
      "Caring for someone with dementia is demanding for caregivers, family, and the patient. Caregivers should educate themselves, seek support, and prioritize their health. They should set realistic goals, accept help, and practice self-care.\n\nFamily members can assist by communicating openly, offering practical and emotional support, and respecting the caregiver’s boundaries. Patients benefit from a routine, physical and social activity, cognitive exercises, and a safe environment. Staying hydrated and eating well are essential.\n\nSeeking professional help and planning for the future can improve overall care and quality of life for everyone involved.",
  },
  {
    id: "3",
    title: "Family Support",
    image: require("../../assets/images/family-support.png"),
    description:
      "Family support is crucial in dementia care. Open communication among family members helps share responsibilities and manage expectations. Offering practical help, like running errands or attending appointments, can ease the caregiver's burden.\n\nEmotional support is also vital; listening and providing encouragement strengthens the caregiver's resilience. Respecting the primary caregiver’s boundaries and avoiding interference ensures a balanced approach.\n\nEducating oneself about dementia fosters empathy and understanding. Family members should also promote the patient's well-being by encouraging social interactions and maintaining routines.",
  },
  {
    id: "4",
    title: "Kids & Teens Corner",
    image: require("../../assets/images/child-teens.png"),
    description:
      "Supporting children and young people with family members affected by dementia involves several key strategies. First, offer open and age-appropriate communication to help them understand the condition and its impact.\n\nEncourage them to express their feelings and provide emotional support through counseling or support groups. Educate them about dementia in a way they can grasp, and involve them in caregiving tasks if appropriate, to foster a sense of involvement and empowerment.\n\nCreating a stable routine and ensuring they have access to activities and hobbies can also help them manage stress.",
  },
];

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

  const { logout, cancelRegister } = useAuth();
  const logo = require("../../assets/images/logo.png");

  const handleLogout = () => {
    logout();
    cancelRegister();
  };

  const handleEmergencyCall = () => {
    Linking.openURL("tel:102");
  };

  const handleHospitalContact = () => {
    Linking.openURL(
      "https://www.google.com/maps/search/?api=1&query=hospitals"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image source={logo} style={styles.logo} />
            <Text style={[styles.headerTitle, { color: "#DE3163" }]}>
              Dementia Buddy
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Feather name="log-out" size={24} color="#DE3163" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <FlatList
          data={tileData}
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#008080" }]}
          onPress={handleHospitalContact}
        >
          <Feather name="map-pin" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Hospital</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#DE3163" }]}
          onPress={handleEmergencyCall}
        >
          <Feather name="phone-call" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Emergency</Text>
        </TouchableOpacity>
      </View>
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
});

export default HomeScreen;
