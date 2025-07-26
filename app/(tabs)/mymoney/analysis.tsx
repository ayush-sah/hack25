import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { ExpenseTrackerContext } from "../../src/context/ExpenseTrackerContext";

const CATEGORY_ICONS: { [key: string]: string } = {
  Groceries: "🛒",
  "Rent": "🏠",
  Utilities: "💡",
  "Transportation": "🚌",
  "Entertainment": "🎬",
  "Dining Out": "🍔",
  Salary: "💰",
  Freelance: "🧑‍💻",
  Investments: "📈",
};

const { width: screenWidth } = Dimensions.get('window');

export default function AnalysisScreen() {
  const { state } = useContext(ExpenseTrackerContext);

  const chartConfig = {
    backgroundColor: "#F8F9FB",
    backgroundGradientFrom: "#F8F9FB",
    backgroundGradientTo: "#F8F9FB",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#008080",
    },
  };

  const pieChartConfig = {
    color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const analysisData = useMemo(() => {
    const expenses = state.records.filter((r) => r.type === "expense");
    const income = state.records.filter((r) => r.type === "income");

    const totalExpenses = expenses.reduce((sum, r) => sum + r.amount, 0);
    const totalIncome = income.reduce((sum, r) => sum + r.amount, 0);

    // Category breakdown for expenses
    const categoryData = expenses.reduce((acc, record) => {
      const category = state.categories.find((c) => c.id === record.categoryId);
      const categoryName = category?.name || "Unknown";
      acc[categoryName] = (acc[categoryName] || 0) + record.amount;
      return acc;
    }, {} as { [key: string]: number });

    const pieChartData = Object.entries(categoryData)
      .map(([name, amount]) => ({
        name,
        amount,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        legendFontColor: "#333",
        legendFontSize: 12,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly spending data
    const monthlyData = expenses.reduce((acc, record) => {
      const date = new Date(record.date);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      acc[month] = (acc[month] || 0) + record.amount;
      return acc;
    }, {} as { [key: string]: number });

    const barChartData = {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          data: Object.values(monthlyData),
        },
      ],
    };

    return {
      totalExpenses,
      totalIncome,
      netIncome: totalIncome - totalExpenses,
      pieChartData,
      barChartData,
      categoryBreakdown: Object.entries(categoryData)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: ((amount / totalExpenses) * 100).toFixed(1),
        }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [state.records, state.categories]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📊 Spending Analysis</Text>
          <Text style={styles.headerSubtitle}>
            Total Spent: ${analysisData.totalExpenses.toFixed(2)}
          </Text>
          <Text style={styles.netIncome}>
            Net Income: ${analysisData.netIncome.toFixed(2)}
          </Text>
        </View>

        {/* Bar Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📈 Monthly Spending Trend</Text>
          {analysisData.barChartData.labels.length > 0 ? (
            <BarChart
              data={analysisData.barChartData}
              width={Math.min(screenWidth - 64, 350)}
              height={220}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No spending data available</Text>
            </View>
          )}
        </View>

        {/* Pie Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🥧 Spending by Category</Text>
          {analysisData.pieChartData.length > 0 ? (
            <PieChart
              data={analysisData.pieChartData}
              width={Math.min(screenWidth - 64, 350)}
              height={220}
              chartConfig={pieChartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No category data available</Text>
            </View>
          )}
        </View>

        {/* Category Breakdown Card */}
        <View style={styles.breakdownCard}>
          <Text style={styles.chartTitle}>📋 Category Breakdown</Text>
          {analysisData.categoryBreakdown.length > 0 ? (
            analysisData.categoryBreakdown.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryItem}
                activeOpacity={0.7}
              >
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryIcon}>
                    {CATEGORY_ICONS[item.name] || "📁"}
                  </Text>
                  <Text style={styles.categoryName}>{item.name}</Text>
                </View>
                <View style={styles.categoryAmount}>
                  <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
                  <Text style={styles.percentageText}>{item.percentage}%</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No spending data available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F44336",
    marginBottom: 4,
  },
  netIncome: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4CAF50",
  },
  chartCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DE3163",
    marginBottom: 16,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChart: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  breakdownCard: {
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#008080",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 60,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F44336",
    marginBottom: 2,
  },
  percentageText: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});