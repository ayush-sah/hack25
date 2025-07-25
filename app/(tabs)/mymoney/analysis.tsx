import React, { useContext, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { ExpenseTrackerContext } from '../../src/context/ExpenseTrackerContext';
import { BarChart, PieChart } from 'react-native-chart-kit';

export default function AnalysisScreen() {
  const { state } = useContext(ExpenseTrackerContext);

  // Calculate total expenses per category (only for expense records)
  const totalsByCategory = useMemo(() => {
    const sums: Record<string, number> = {};
    state.records
      .filter((r) => r.type === 'expense')
      .forEach((r) => {
        sums[r.categoryId] = (sums[r.categoryId] || 0) + r.amount;
      });
    return sums;
  }, [state.records]);

  // Prepare bar chart data
  const barChartData = {
    labels: Object.keys(totalsByCategory).map(
      (categoryId) => state.categories.find((c) => c.id === categoryId)?.name || 'Unknown'
    ),
    datasets: [
      {
        data: Object.values(totalsByCategory),
      },
    ],
  };

  // Prepare pie chart data with dynamic colors
  const pieChartData = Object.entries(totalsByCategory).map(([categoryId, amount], index) => {
    const category = state.categories.find((c) => c.id === categoryId);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
    return {
      name: category?.name || 'Unknown',
      amount,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    };
  });

  // Calculate total spending for percentage display
  const totalSpending = Object.values(totalsByCategory).reduce((sum, val) => sum + val, 0);

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Spending Analysis</Text>
      {state.records.length === 0 || Object.keys(totalsByCategory).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {state.categories.length === 0
              ? 'Add categories and expense records to see analysis.'
              : 'No expense records found. Add some in the Records tab.'}
          </Text>
        </View>
      ) : (
        <>
          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending by Category (Bar)</Text>
            <BarChart
              data={barChartData}
              width={Dimensions.get('window').width - 32}
              height={220}
              yAxisLabel="$"
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>

          {/* Pie Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending Distribution (Pie)</Text>
            <PieChart
              data={pieChartData}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          </View>

          {/* Category Breakdown */}
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <FlatList
            data={Object.entries(totalsByCategory)}
            keyExtractor={([categoryId]) => categoryId}
            renderItem={({ item: [categoryId, total] }) => {
              const category = state.categories.find((c) => c.id === categoryId);
              const percentage = totalSpending > 0 ? ((total / totalSpending) * 100).toFixed(1) : 0;
              return (
                <View style={styles.item}>
                  <Text style={styles.itemText}>
                    {category?.name || 'Unknown'}: ${total.toFixed(2)} ({percentage}%)
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No spending data available.</Text>}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginVertical: 12,
  },
  chartContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 12,
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});