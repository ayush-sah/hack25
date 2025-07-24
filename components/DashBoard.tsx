// import React from 'react';
// import { View, StyleSheet, Platform } from 'react-native';
// import { ThemedView, ThemedText } from './ThemedComponents'; // Adjust as per your imports
// import HelloWave from './HelloWave'; // Your custom wave component
// import { Button } from 'react-native-paper'; // Using Paper for buttons

// const Dashboard = () => {
//   return (
//     <ThemedView style={styles.container}>
//       <ThemedView style={styles.header}>
//         <ThemedText type="title">Welcome, Caregiver!</ThemedText>
//         <HelloWave />
//       </ThemedView>

//       <ThemedView style={styles.metricsContainer}>
//         <ThemedView style={styles.metricBox}>
//           <ThemedText type="metric">Patients Under Care</ThemedText>
//           <ThemedText type="largeNumber">5</ThemedText>
//         </ThemedView>
//         <ThemedView style={styles.metricBox}>
//           <ThemedText type="metric">Medication Due</ThemedText>
//           <ThemedText type="largeNumber">2</ThemedText>
//         </ThemedView>
//         <ThemedView style={styles.metricBox}>
//           <ThemedText type="metric">Upcoming Appointments</ThemedText>
//           <ThemedText type="largeNumber">3</ThemedText>
//         </ThemedView>
//       </ThemedView>

//       <ThemedView style={styles.actionContainer}>
//         <Button mode="contained" style={styles.actionButton}>
//           Care Plans
//         </Button>
//         <Button mode="contained" style={styles.actionButton}>
//           Medication Reminders
//         </Button>
//         <Button mode="contained" style={styles.actionButton}>
//           Activity Log
//         </Button>
//       </ThemedView>

//       <ThemedView style={styles.recentActivities}>
//         <ThemedText type="subtitle">Recent Activities</ThemedText>
//         <ThemedText>
//           • Patient John took his medication at 10:00 AM
//         </ThemedText>
//         <ThemedText>
//           • Scheduled appointment for Mary on July 20th
//         </ThemedText>
//       </ThemedView>

//       <ThemedView style={styles.quickLinks}>
//         <ThemedText type="subtitle">Quick Links</ThemedText>
//         <Button mode="outlined" style={styles.quickLinkButton}>
//           Resources
//         </Button>
//         <Button mode="outlined" style={styles.quickLinkButton}>
//           Contact Support
//         </Button>
//       </ThemedView>
//     </ThemedView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f7f7f7',
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   metricsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   metricBox: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 5,
//     alignItems: 'center',
//   },
//   actionContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   actionButton: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   recentActivities: {
//     marginBottom: 20,
//     padding: 10,
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 5,
//   },
//   quickLinks: {
//     marginBottom: 20,
//     padding: 10,
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 5,
//   },
//   quickLinkButton: {
//     marginVertical: 5,
//   },
// });

// export default Dashboard;
