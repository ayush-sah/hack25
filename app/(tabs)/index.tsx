import React from "react";
import { StyleSheet, View, Text, SafeAreaView, StatusBar } from "react-native";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>FinWorld</Text>
      </View>
      {/* Add any additional content or components here */}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080", // Teal to match new theme
    letterSpacing: 1,
  },
});

export default HomeScreen;
