import React from "react";
import { AuthProvider } from "./context/context";
import RootLayout from "./app/_layout";
import LoginScreen from "./components/login";
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  "Warning: Unknown event handler property `onResponderTerminate`",
]);

const App: React.FC = () => {
  return <RootLayout />;
};

export default App;
