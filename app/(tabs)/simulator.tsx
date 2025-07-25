import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemeProvider } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart, BarChart } from "react-native-chart-kit";

// Instrument definitions
const instruments = [
  {
    key: "fd",
    name: "Fixed Deposit",
    icon: "bank",
    color: "#4CAF50",
    chartType: "line",
    description: "Guaranteed returns over a fixed period.",
    explanation:
      "FDs lock your money at a fixed rate, ideal for capital preservation. Early withdrawals incur penalties.",
    inputs: [
      {
        label: "Amount (₹)",
        key: "amount",
        type: "numeric",
        placeholder: "50000",
      },
      {
        label: "Tenure (years)",
        key: "tenure",
        type: "numeric",
        placeholder: "5",
      },
    ],
  },
  {
    key: "cc",
    name: "Credit Card Debt",
    icon: "credit-card",
    color: "#D32F2F",
    chartType: "bar",
    description: "Cost buildup on unpaid balances.",
    explanation:
      "Credit cards charge high interest on unpaid dues. Simulate balance vs interest accumulation.",
    inputs: [
      {
        label: "Balance (₹)",
        key: "balance",
        type: "numeric",
        placeholder: "10000",
      },
      {
        label: "Payment %",
        key: "paymentPct",
        type: "numeric",
        placeholder: "5",
      },
      {
        label: "Duration (months)",
        key: "tenure",
        type: "numeric",
        placeholder: "12",
      },
    ],
  },
  {
    key: "mf",
    name: "Mutual Fund SIP",
    icon: "chart-line",
    color: "#2196F3",
    chartType: "line",
    description: "Grow wealth with systematic investments.",
    explanation:
      "SIPs average out market volatility over time. Visualize potential corpus growth.",
    inputs: [
      {
        label: "Monthly SIP (₹)",
        key: "sip",
        type: "numeric",
        placeholder: "5000",
      },
      {
        label: "Tenure (years)",
        key: "tenure",
        type: "numeric",
        placeholder: "10",
      },
      {
        label: "Step-up (%)",
        key: "stepUp",
        type: "dropdown",
        options: ["0", "5", "10", "15", "20"],
      },
    ],
  },
  {
    key: "sa",
    name: "Savings Account",
    icon: "piggy-bank",
    color: "#9C27B0",
    chartType: "line",
    description: "Liquid savings with modest interest.",
    explanation:
      "Quarterly compounding; perfect for emergency funds. Track principal vs interest.",
    inputs: [
      {
        label: "Deposit (₹)",
        key: "deposit",
        type: "numeric",
        placeholder: "20000",
      },
      {
        label: "Tenure (years)",
        key: "tenure",
        type: "numeric",
        placeholder: "3",
      },
    ],
  },
  {
    key: "stocks",
    name: "Stocks",
    icon: "trending-up",
    color: "#FF9800",
    chartType: "line",
    description: "High-risk, high-reward.",
    explanation:
      "Stocks offer growth with volatility. Simulate projected value over 5 years.",
    inputs: [
      {
        label: "Invest (₹)",
        key: "amount",
        type: "numeric",
        placeholder: "100000",
      },
      {
        label: "Risk Profile",
        key: "risk",
        type: "dropdown",
        options: ["Low", "Medium", "High"],
      },
    ],
  },
];

export default function SimulationScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const screenWidth = Dimensions.get("window").width;

  const onChange = (key: string, val: any) =>
    setValues((v) => ({ ...v, [key]: val }));

  const simulate = () => {
    if (!selected) return;
    const instr = instruments.find((i) => i.key === selected)!;
    for (let inp of instr.inputs) {
      if (
        !values[inp.key] ||
        (inp.type === "numeric" && isNaN(+values[inp.key]))
      ) {
        return alert(`Enter valid ${inp.label}`);
      }
    }
    let chartData: any = { labels: [], datasets: [] };
    let simText = "";
    let advice = "";

    switch (instr.key) {
      case "fd": {
        const P = +values.amount,
          t = +values.tenure,
          r = 0.06;
        const arr = Array.from(
          { length: t + 1 },
          (_, y) => +(P * Math.pow(1 + r, y)).toFixed(2)
        );
        chartData.labels = arr.map((_, i) => `Y${i}`);
        chartData.datasets = [{ data: arr, color: () => instr.color }];
        simText = `Matures to ₹${arr[t]}`;
        advice = "Consider laddering for flexibility.";
        break;
      }
      case "cc": {
        const bal = +values.balance,
          payPct = +values.paymentPct / 100,
          months = +values.tenure;
        const balArr = [bal],
          intArr = [0];
        let total = 0;
        for (let m = 1; m <= months; m++) {
          const intr = balArr[m - 1] * 0.036;
          total += intr;
          balArr.push(
            +(balArr[m - 1] + intr - balArr[m - 1] * payPct).toFixed(2)
          );
          intArr.push(+total.toFixed(2));
        }
        chartData.labels = balArr.map((_, i) => `M${i}`);
        chartData.datasets = [
          { data: balArr, color: () => instr.color },
          { data: intArr, color: () => "#B71C1C" },
        ];
        simText = `Remaining ₹${balArr[balArr.length - 1]}`;
        advice = "Increase payments to reduce interest.";
        break;
      }
      case "mf": {
        const sip = +values.sip,
          t = +values.tenure,
          step = +values.stepUp / 100,
          avg = 0.08;
        let bal = 0,
          arr = [0];
        for (let y = 1; y <= t; y++) {
          const c = sip * Math.pow(1 + step, y - 1);
          for (let m = 0; m < 12; m++) bal = (bal + c) * (1 + avg / 12);
          arr.push(+bal.toFixed(2));
        }
        chartData.labels = arr.map((_, i) => `Y${i}`);
        chartData.datasets = [{ data: arr, color: () => instr.color }];
        simText = `Corpus ₹${arr[arr.length - 1]}`;
        advice = "Maintain SIPs for long-term growth.";
        break;
      }
      case "sa": {
        const D = +values.deposit,
          t = +values.tenure,
          r = 0.04,
          n = 4;
        let arr = [D];
        for (let y = 1; y <= t; y++) {
          const f = arr[y - 1] * Math.pow(1 + r / n, n);
          arr.push(+f.toFixed(2));
        }
        chartData.labels = arr.map((_, i) => `Y${i}`);
        chartData.datasets = [{ data: arr, color: () => instr.color }];
        simText = `Total ₹${arr[arr.length - 1]}`;
        advice = "Great for emergency fund; keep 6 months reserve.";
        break;
      }
      case "stocks": {
        const A = +values.amount,
          lvl = values.risk as "Low" | "Medium" | "High",
          avg = 0.1;
        const volMap = { Low: 0.02, Medium: 0.05, High: 0.1 };
        let bal = A,
          arr = [A];
        for (let y = 1; y <= 5; y++) {
          bal *= 1 + avg + (Math.random() * 2 - 1) * volMap[lvl];
          arr.push(+bal.toFixed(2));
        }
        chartData.labels = arr.map((_, i) => `Y${i}`);
        chartData.datasets = [{ data: arr, color: () => instr.color }];
        const cagr = (((arr[5] / A) ** (1 / 5) - 1) * 100).toFixed(1);
        simText = `5yr ₹${arr[5]} (${cagr}% CAGR)`;
        advice = "Diversify portfolio to manage risk.";
        break;
      }
    }

    setResult({ instr, chartData, simText, advice });
  };

  const renderChart = () => {
    if (!result) return null;
    const { instr, chartData } = result;
    const cfg = {
      backgroundGradientFrom: "#fafafa",
      backgroundGradientTo: "#fafafa",
      color: () => instr.color,
      labelColor: () => "#333",
    };
    const width = screenWidth - 60;
    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width}
          height={200}
          chartConfig={cfg}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <ThemeProvider
      value={{
        dark: false,
        colors: {
          primary: "#DE3163",
          background: "#ECF0F1",
          card: "#FFF",
          text: "#333",
          border: "#CCC",
          notification: "#DE3163",
        },
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animatable.Text animation="fadeInDown" style={styles.header}>
          Investment Simulator
        </Animatable.Text>
        <ScrollView contentContainerStyle={styles.container}>
          {!selected ? (
            <>
              <Text style={styles.subtitle}>Choose Instrument</Text>
              {instruments.map((i) => (
                <Animatable.View
                  key={i.key}
                  animation="fadeInUp"
                  style={[styles.card, { backgroundColor: i.color }]}
                >
                  <TouchableOpacity
                    style={styles.cardButton}
                    onPress={() => {
                      setSelected(i.key);
                      setValues({});
                      setResult(null);
                    }}
                  >
                    <Icon name={i.icon} size={28} color="#fff" />
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>{i.name}</Text>
                      <Text style={styles.cardDesc}>{i.description}</Text>
                    </View>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </>
          ) : (
            <View style={styles.simulationContainer}>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={styles.backButton}
              >
                <Icon name="arrow-left" size={22} color="#333" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              {instruments
                .filter((i) => i.key === selected)
                .map((instr) => (
                  <Animatable.View key={instr.key} animation="fadeIn">
                    <Text style={[styles.simTitle, { color: instr.color }]}>
                      {instr.name}
                    </Text>
                    <Text style={styles.simExp}>{instr.explanation}</Text>
                    {instr.inputs.map((inp) => (
                      <View key={inp.key} style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{inp.label}</Text>
                        {inp.type === "dropdown" ? (
                          <Picker
                            selectedValue={
                              values[inp.key] !== undefined
                                ? values[inp.key]
                                : ""
                            }
                            onValueChange={(v: any) => onChange(inp.key, v)}
                            style={styles.input}
                          >
                            <Picker.Item label="Select" value="" />
                            {inp.options!.map((o) => (
                              <Picker.Item key={o} label={o} value={o} />
                            ))}
                          </Picker>
                        ) : (
                          <TextInput
                            style={styles.input}
                            placeholder={inp.placeholder}
                            keyboardType="numeric"
                            value={
                              values[inp.key] !== undefined
                                ? values[inp.key].toString()
                                : ""
                            }
                            onChangeText={(t) => onChange(inp.key, t)}
                          />
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[
                        styles.simButton,
                        { backgroundColor: instr.color },
                      ]}
                      onPress={simulate}
                    >
                      <Text style={styles.simButtonText}>Simulate</Text>
                    </TouchableOpacity>
                    {result && result.instr.key === instr.key && (
                      <Animatable.View
                        animation="zoomIn"
                        style={styles.resultCard}
                      >
                        <Text style={styles.resultText}>{result.simText}</Text>
                        {renderChart()}
                        <Text style={styles.adviceText}>
                          💡 {result.advice}
                        </Text>
                      </Animatable.View>
                    )}
                  </Animatable.View>
                ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ECF0F1" },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
    marginTop: 48, // Added extra top margin to prevent going beyond top
  },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    marginVertical: 8,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
  },
  cardButton: { flexDirection: "row", alignItems: "center", padding: 18 },
  cardTextContainer: { marginLeft: 12, flex: 1 },
  cardTitle: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  cardDesc: { color: "rgba(255,255,255,0.9)", marginTop: 4 },
  simulationContainer: { marginTop: 10 },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { fontSize: 16, marginLeft: 6, color: "#333" },
  simTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 6,
    textAlign: "center",
  },
  simExp: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, marginBottom: 6, color: "#333" },
  input: {
    height: 44,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
  },
  simButton: {
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginVertical: 12,
  },
  simButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  resultCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  adviceText: {
    fontSize: 14,
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 12,
    marginVertical: 10,
  },
  chart: { borderRadius: 12 },
});
