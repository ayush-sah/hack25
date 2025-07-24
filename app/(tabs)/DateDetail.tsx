import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMonth } from './monthContext';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_ICONS = {
  'Groceries': '🛒',
  'Rent / PG': '🏠',
  'Utilities': '💡',
  'Mobile Recharge / Bills': '📱',
  'Transport': '🚌',
  'Eating Out': '🍔',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Personal Care': '💅',
  'Education': '📚',
  'Productivity Tools': '🧰',
  'Medical / Health': '💊',
  'Fitness': '🏋️',
  'EMI / Loan Repayments': '💳',
  'Savings / Investments': '💰',
  'Donations / Gifting': '🎁',
  'Emergency / Unexpected': '⚠️',
};

const CATEGORY_GROUPS = [
  {
    label: 'Essentials',
    categories: [
      'Groceries',
      'Rent / PG',
      'Utilities',
      'Mobile Recharge / Bills',
      'Transport',
    ],
  },
  {
    label: 'Lifestyle & Leisure',
    categories: [
      'Eating Out',
      'Entertainment',
      'Shopping',
      'Personal Care',
    ],
  },
  {
    label: 'Learning & Growth',
    categories: [
      'Education',
      'Productivity Tools',
    ],
  },
  {
    label: 'Health & Wellness',
    categories: [
      'Medical / Health',
      'Fitness',
    ],
  },
  {
    label: 'Finance',
    categories: [
      'EMI / Loan Repayments',
      'Savings / Investments',
      'Donations / Gifting',
    ],
  },
  {
    label: 'Miscellaneous',
    categories: [
      'Emergency / Unexpected',
    ],
  },
];

const getAllCategories = () => CATEGORY_GROUPS.flatMap(g => g.categories);

const DateDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { date } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('Groceries');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { expenses, addExpense } = useMonth();
  const [showCustom, setShowCustom] = useState(false);
  const [removingIdx, setRemovingIdx] = useState<number | null>(null);

  const handleAddExpense = () => {
    if ((!selectedCategory && !customCategory) || !amount) return;
    addExpense({
      date,
      category: showCustom ? customCategory : selectedCategory,
      amount: parseFloat(amount),
      note,
    });
    setAmount('');
    setNote('');
    setCustomCategory('');
    setShowCustom(false);
  };

  const formattedDate = new Date(date).toDateString();

  // Only show expenses for the selected date
  const expensesForDate = expenses.filter(e => {
    const d = new Date(e.date);
    const sel = new Date(date);
    return d.getFullYear() === sel.getFullYear() && d.getMonth() === sel.getMonth() && d.getDate() === sel.getDate();
  });

  // All expenses for the month (for table at bottom)
  const expensesForMonth = expenses.filter(e => {
    const d = new Date(e.date);
    const sel = new Date(date);
    return d.getFullYear() === sel.getFullYear() && d.getMonth() === sel.getMonth();
  });

  const handleRemoveExpense = (idx: number) => {
    // Remove the correct expense for the current date
    const expenseToRemove = expensesForDate[idx];
    const updatedExpenses = expenses.filter(e => e !== expenseToRemove);
    // If using context, update the context/state here
    if (typeof useMonth === 'function') {
      // If addExpense is from context, update context if possible
      // This is a placeholder; you may need to implement a removeExpense in context
      // For now, just update local state if you have it
    }
    // If expenses is from useState, setExpenses(updatedExpenses)
    // If from context, you need to implement a removeExpense in MonthContext
    setRemovingIdx(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#BDC3C7', position: 'relative', width: '100%' }}>
        <TouchableOpacity onPress={() => navigation.navigate('calendarMonth')} style={{ padding: 4, marginRight: 8, zIndex: 2 }}>
          <Ionicons name="arrow-back" size={26} color="#008080" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#008080', marginTop: 0, marginBottom: 0, zIndex: 1 }}>Your Daily Spending</Text>
      </View>
      <Text style={[styles.dateSubtitle, { marginTop: 8 }]}>{formattedDate}</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { backgroundColor: '#fff' }] }>
        {/* Expense Entry Card */}
        <View style={styles.entryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={showCustom ? 'custom' : selectedCategory}
                style={styles.picker}
                onValueChange={(v) => {
                  if (v === 'custom') {
                    setShowCustom(true);
                    setSelectedCategory('');
                  } else {
                    setShowCustom(false);
                    setSelectedCategory(v);
                  }
                }}
              >
                {CATEGORY_GROUPS.map((group) => [
                  <Picker.Item key={group.label} label={`-- ${group.label} --`} value={group.label} enabled={false} color="#888" />, 
                  ...group.categories.map((cat) => (
                    <Picker.Item key={cat} label={`${CATEGORY_ICONS[cat] || ''} ${cat}`} value={cat} />
                  )),
                ])}
                <Picker.Item label="➕ Add Custom Category" value="custom" />
              </Picker>
            </View>
          </View>
          {showCustom && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom category"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 250"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dinner with friends"
              value={note}
              onChangeText={setNote}
            />
          </View>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity style={styles.centeredAddButton} onPress={handleAddExpense}>
              <AntDesign name="pluscircle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.addExpenseBtnText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Expense Table (Bottom of Page) */}
        <View style={styles.tableCard}>
          <Text style={styles.sectionTitle}>📊 Today's Expenses</Text>
          <View style={styles.tableWrap}>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Category</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Amount</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Notes</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}></Text>
            </View>
            {expensesForDate.length === 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { color: '#888', fontStyle: 'italic' }]} colSpan={4}>No expenses yet.</Text>
              </View>
            )}
            {expensesForDate.map((item, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowAlt : null]}>
                <Text style={styles.tableCell}>{CATEGORY_ICONS[item.category] || ''} {item.category}</Text>
                <Text style={styles.tableCell}>₹{item.amount}</Text>
                <Text style={[styles.tableCell, styles.expenseNote]}>{item.note}</Text>
                <TouchableOpacity onPress={() => handleRemoveExpense(idx)}>
                  <AntDesign name="delete" size={18} color="#e53935" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 24 },
  bigTitle: { fontSize: 28, fontWeight: 'bold', color: '#008080', marginTop: 18, marginBottom: 18, textAlign: 'center', width: '100%' },
  dateSubtitle: { color: '#008080', fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' },
  entryCard: { width: '100%', backgroundColor: '#F8F9FB', borderRadius: 18, padding: 20, marginBottom: 18, elevation: 3, shadowColor: '#008080', shadowOpacity: 0.08, shadowRadius: 4, alignSelf: 'stretch' },
  tableCard: { width: '100%', backgroundColor: '#F8F9FB', borderRadius: 18, padding: 20, marginBottom: 18, elevation: 3, shadowColor: '#008080', shadowOpacity: 0.08, shadowRadius: 4, alignSelf: 'stretch' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#DE3163', marginBottom: 10, textAlign: 'center', width: '100%' },
  label: { fontSize: 15, color: '#008080', marginBottom: 4, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#bdbdbd', flex: 1, minWidth: 80, marginLeft: 8 },
  pickerWrap: { borderWidth: 1, borderColor: '#bdbdbd', borderRadius: 8, backgroundColor: '#fff', elevation: 1, flex: 1, marginLeft: 8 },
  picker: { height: 40, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '100%' },
  fixedAddButton: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#008080', padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 18, borderTopRightRadius: 18, elevation: 8 },
  fixedAddButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addButton: { display: 'none' },
  addButtonText: { display: 'none' },
  tableWrap: { width: '100%', marginTop: 8, backgroundColor: '#fff', borderRadius: 8, elevation: 1, overflow: 'hidden', alignSelf: 'stretch' },
  tableRowHeader: { flexDirection: 'row', backgroundColor: '#008080', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tableHeader: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center', paddingVertical: 6 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#f8f8ff', alignItems: 'center' },
  tableRowAlt: { backgroundColor: '#F3F6F9' },
  tableCell: { flex: 1, padding: 6, fontSize: 14, textAlign: 'center' },
  expenseNote: { color: '#263238', fontSize: 13, fontStyle: 'italic' },
  topWhiteBar: {
    width: '100%',
    height: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
    paddingTop: 8,
    paddingBottom: 8,
  },
  addExpenseBtn: { flexDirection: 'row', backgroundColor: '#008080', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 10, marginTop: 2 },
  addExpenseBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  centeredAddButton: { flexDirection: 'row', backgroundColor: '#008080', padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minWidth: 160 },
});

export default DateDetail; 