import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput, Easing, SafeAreaView, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useMonth } from './monthContext';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

const screenWidth = Dimensions.get('window').width;

const CalendarMonth = () => {
  const navigation = useNavigation();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [incomeInput, setIncomeInput] = useState('');
  const [salaryExpanded, setSalaryExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [editingIncome, setEditingIncome] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const { income, setIncome, expenses } = useMonth();

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: salaryExpanded ? 80 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [salaryExpanded]);

  // Calculate total spent for the selected month/year
  const expensesForMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });
  const totalSpent = expensesForMonth.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncome = income || 0;
  const total = totalIncome - totalSpent;

  // Move calendar grid calculation inside render to always use latest state
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfWeek(selectedMonth, selectedYear);
  const weeks = [];
  let week = [];
  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const isToday = (d) => {
    return (
      d &&
      selectedYear === today.getFullYear() &&
      selectedMonth === today.getMonth() &&
      d === today.getDate()
    );
  };

  const isSelected = (d) => {
    if (!selectedDate) return false;
    return (
      d &&
      selectedDate.getFullYear() === selectedYear &&
      selectedDate.getMonth() === selectedMonth &&
      selectedDate.getDate() === d
    );
  };

  const handleDayPress = (d) => {
    const dateObj = new Date(selectedYear, selectedMonth, d);
    setSelectedDate(dateObj);
    setTimeout(() => {
      navigation.navigate('DateDetail', { date: dateObj });
    }, 120);
  };

  // Add a simple progress bar component inside this file
  const SimpleProgressBar = ({ totalSpent, income }) => {
    const percent = income > 0 ? Math.min(totalSpent / income, 1) : 0;
    return (
      <View style={{ width: '100%', height: 16, backgroundColor: '#fff', borderRadius: 8, marginTop: 8, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' }}>
        <View style={{ width: `${percent * 100}%`, height: '100%', backgroundColor: '#008080', borderRadius: 8 }} />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ECF0F1' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      {/* White top bar with month/year row inside */}
      <View style={[styles.topWhiteBarWithMonth, { width: '100%', maxWidth: 500 }]}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}>
            <AntDesign name="left" size={22} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{MONTHS[selectedMonth]}, {selectedYear}</Text>
          <TouchableOpacity onPress={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}>
            <AntDesign name="right" size={22} color="#2C3E50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterIcon} onPress={() => setShowYearModal(true)}>
            <MaterialIcons name="menu" size={28} color="#2C3E50" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Year Modal */}
      {showYearModal && (
        <View style={styles.yearModalOverlay}>
          <View style={[styles.yearModal, { maxHeight: 350 }]}> 
            <Text style={styles.yearModalTitle}>Select Year</Text>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center' }}>
              {Array.from({ length: 101 }, (_, i) => 1950 + i).map((year) => (
                <TouchableOpacity
                  key={year}
                  style={styles.yearModalItem}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearModal(false);
                  }}
                >
                  <Text style={[styles.yearModalText, selectedYear === year && styles.yearModalTextSelected]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.yearModalClose} onPress={() => setShowYearModal(false)}>
              <Text style={styles.yearModalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Summary Row */}
      <View style={[styles.summaryRow, { width: '95%', maxWidth: 500, alignSelf: 'center', borderRadius: 16, marginTop: 10, marginBottom: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }]}>
        <View style={styles.summaryCol}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={styles.summaryLabel}>EXPENSE</Text>
          </View>
          <Text style={styles.summaryExpense}>₹{totalSpent.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCol}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={styles.summaryLabel}>INCOME</Text>
          </View>
          {editingIncome ? (
            <TextInput
              style={styles.incomeEditInput}
              keyboardType="numeric"
              value={incomeInput}
              autoFocus
              onChangeText={setIncomeInput}
              onBlur={() => {
                if (incomeInput) setIncome(Number(incomeInput));
                setEditingIncome(false);
              }}
              onSubmitEditing={() => {
                if (incomeInput) setIncome(Number(incomeInput));
                setEditingIncome(false);
              }}
            />
          ) : (
            <TouchableOpacity onPress={() => { setIncomeInput(income ? String(income) : ''); setEditingIncome(true); }}>
              <Text style={styles.summaryIncomeValue}>₹{totalIncome.toFixed(2)} <Text style={styles.tapToEdit}>(tap to edit)</Text></Text>
            </TouchableOpacity>
          )}
          <SimpleProgressBar totalSpent={totalSpent} income={income} />
          <Text style={{ textAlign: 'center', color: '#008080', fontWeight: 'bold', fontSize: 13, marginTop: 2 }}>
            {income > 0 ? `${Math.round(Math.min((totalSpent / income) * 100, 100))}% spent of 100%` : '0% spent of 100%'}
          </Text>
        </View>
        <View style={styles.summaryCol}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={styles.summaryLabel}>TOTAL</Text>
          </View>
          <Text style={styles.summaryTotal}>₹{total.toFixed(2)}</Text>
        </View>
      </View>
      {/* Main Content: Calendar always visible */}
      <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <View style={[styles.calendarCardLarge, { width: '95%', maxWidth: 500, marginBottom: 0, padding: 12 }]}>
          <View style={styles.weekRowLarge}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.dayHeaderLarge}>{d}</Text>
            ))}
          </View>
          {weeks.map((week, wIdx) => (
            <View key={wIdx} style={styles.weekRowLarge}>
              {week.map((d, dIdx) => (
                d ? (
                  <TouchableOpacity
                    key={dIdx}
                    style={[styles.dayCellLarge,
                      isToday(d) && styles.todayCellLarge,
                      isSelected(d) && styles.selectedCellLarge
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleDayPress(d)}
                  >
                    <Text style={[styles.dayTextLarge,
                      isToday(d) && styles.todayTextLarge,
                      isSelected(d) && styles.selectedTextLarge
                    ]}>{d}</Text>
                  </TouchableOpacity>
                ) : (
                  <View key={dIdx} style={styles.dayCellLarge} />
                )
              ))}
            </View>
          ))}
        </View>
      </View>
      {/* Floating Action Button */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#ECF0F1', alignItems: 'center', padding: 8 },
  incomeCard: { width: '100%', maxWidth: 340, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, marginBottom: 10, elevation: 2, alignItems: 'center' },
  incomeLabel: { fontSize: 13, color: '#008080', fontWeight: 'bold' },
  incomeInput: { backgroundColor: '#f8f8ff', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: '#bdbdbd', width: 90, marginRight: 6 },
  incomeButton: { backgroundColor: '#008080', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  incomeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  incomeCurrent: { marginTop: 4, color: '#43a047', fontWeight: 'bold', fontSize: 13 },
  headerCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#008080',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#DE3163', marginBottom: 6, textAlign: 'center' },
  pickerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  picker: { width: 110, height: 32, backgroundColor: '#f8f8ff', borderRadius: 8 },
  monthLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 2, color: '#008080', textShadowColor: '#008080', textShadowRadius: 2 },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    elevation: 4,
    shadowColor: '#008080',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginBottom: 16,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#008080', fontSize: 13, marginBottom: 1 },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 10,
    backgroundColor: '#f8f8ff',
    elevation: 2,
    shadowColor: '#008080',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  todayCell: {
    backgroundColor: '#DE3163',
    borderColor: '#DE3163',
    elevation: 4,
    shadowOpacity: 0.18,
  },
  selectedCell: {
    backgroundColor: '#008080',
    borderColor: '#008080',
    elevation: 4,
    shadowOpacity: 0.18,
  },
  dayText: { fontSize: 14, color: '#1565c0', fontWeight: 'bold' },
  todayText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  selectedText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  calendarCardLarge: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    elevation: 6,
    shadowColor: '#008080',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    marginBottom: 18,
    alignItems: 'center',
  },
  weekRowLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    width: '100%',
  },
  dayHeaderLarge: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#008080',
    fontSize: 15,
    marginBottom: 2,
  },
  dayCellLarge: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 14,
    backgroundColor: '#f8f8ff',
    elevation: 3,
    shadowColor: '#008080',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 32,
    minHeight: 32,
    maxWidth: 40,
    maxHeight: 40,
  },
  todayCellLarge: {
    backgroundColor: '#DE3163',
    borderColor: '#DE3163',
    elevation: 6,
    shadowOpacity: 0.22,
  },
  selectedCellLarge: {
    backgroundColor: '#008080',
    borderColor: '#008080',
    elevation: 6,
    shadowOpacity: 0.22,
  },
  dayTextLarge: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  todayTextLarge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  selectedTextLarge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  topRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 900,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: 2,
    minWidth: 180,
    marginRight: 8,
  },
  rightCol: {
    flex: 1,
    minWidth: 180,
    alignItems: 'flex-end',
  },
  headerCardNoMargin: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#008080',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  incomeCardSmall: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 8,
  },
  leftColCentered: {
    flex: 2,
    minWidth: 180,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerTitleCentered: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DE3163',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  pickerRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  monthLabelCentered: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#008080',
    textAlign: 'center',
    width: '100%',
  },
  salarySummary: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008080',
    marginVertical: 4,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  expandHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  expenseTableWrap: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#f8f8ff',
    borderRadius: 10,
    padding: 8,
    elevation: 1,
  },
  expenseTableTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  expenseTableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#008080',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  expenseTableHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    flex: 1,
    paddingVertical: 4,
    fontFamily: 'SpaceMono',
  },
  expenseTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  expenseTableCell: {
    flex: 1,
    padding: 4,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  expenseNote: {
    fontStyle: 'italic',
    color: '#888',
    fontFamily: 'SpaceMono',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
    backgroundColor: '#ECF0F1',
    elevation: 2,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: '#ECF0F1',
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginHorizontal: 16,
    fontFamily: 'SpaceMono',
  },
  filterIcon: {
    marginLeft: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
  },
  summaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'SpaceMono',
  },
  summaryExpense: {
    color: '#DE3163',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  summaryIncome: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  summaryTotal: {
    color: '#2C3E50',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  emptyStateWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    color: '#8A9A8D',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'SpaceMono',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#DE3163',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#DE3163',
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  calendarScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  summaryIncomeValue: {
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  tapToEdit: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'normal',
  },
  incomeEditInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    width: 100,
    fontFamily: 'SpaceMono',
    color: '#008080',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  yearModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  yearModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 220,
    elevation: 6,
  },
  yearModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    fontFamily: 'SpaceMono',
  },
  yearModalItem: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
  },
  yearModalText: {
    fontSize: 16,
    color: '#2C3E50',
    fontFamily: 'SpaceMono',
  },
  yearModalTextSelected: {
    color: '#DE3163',
    fontWeight: 'bold',
  },
  yearModalClose: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#DE3163',
    borderRadius: 8,
  },
  yearModalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    fontSize: 15,
  },
  topWhiteBarWithMonth: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 0,
  },
});

export default CalendarMonth; 