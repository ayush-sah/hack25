import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ExpenseTrackerContext } from '../../src/context/ExpenseTrackerContext';
// import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';

export default function RecordsScreen() {
  const { state, dispatch } = useContext(ExpenseTrackerContext);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setAccountId(state.accounts.length > 0 ? state.accounts[0].id : '');
    setCategoryId(state.categories.filter((c) => c.type === type).length > 0 ? state.categories.filter((c) => c.type === type)[0].id : '');
  }, [state.accounts, state.categories, type]);

  function addRecord() {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number (e.g., 25.99).');
      return;
    }
    if (!accountId || !state.accounts.find((a) => a.id === accountId)) {
      Alert.alert('Invalid Account', 'Please select a valid account or add one in the Accounts tab.');
      return;
    }
    if (!categoryId || !state.categories.find((c) => c.id === categoryId)) {
      Alert.alert('Invalid Category', 'Please select a valid category or add one in the Categories tab.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    const newRecord = {
      id: 1,
      type,
      date: new Date().toISOString(),
      amount: parsedAmount,
      currency: 'USD',
      accountId,
      categoryId,
      notes: notes.trim() || undefined,
    };

    dispatch({ type: 'ADD_RECORD', payload: newRecord });

    const account = state.accounts.find((a) => a.id === accountId);
    if (account) {
      const updatedBalance = type === 'expense' ? account.balance - parsedAmount : account.balance + parsedAmount;
      dispatch({
        type: 'UPDATE_ACCOUNT',
        payload: { ...account, balance: updatedBalance },
      });
    }

    if (type === 'expense') {
      const budget = state.budgets.find((b) => b.categoryId === categoryId);
      if (budget) {
        const now = new Date();
        const periodStart = budget.period === 'weekly'
          ? new Date(now.setDate(now.getDate() - now.getDay()))
          : new Date(now.getFullYear(), now.getMonth(), 1);

        const totalSpent = state.records
          .filter((r) => r.categoryId === categoryId && r.type === 'expense' && new Date(r.date) >= periodStart)
          .reduce((sum, r) => sum + r.amount, 0) + parsedAmount;

        if (totalSpent > budget.amount) {
          Alert.alert(
            'Budget Exceeded',
            `You have exceeded your ${budget.period} budget for "${
              state.categories.find((c) => c.id === categoryId)?.name || 'Unknown'
            }". Spent: $${totalSpent.toFixed(2)}, Budget: $${budget.amount.toFixed(2)}.`,
            [{ text: 'OK' }]
          );
        }
      }
    }

    setAmount('');
    setNotes('');
    setType('expense');
    setAccountId(state.accounts.length > 0 ? state.accounts[0].id : '');
    setCategoryId(state.categories.filter((c) => c.type === 'expense').length > 0 ? state.categories.filter((c) => c.type === 'expense')[0].id : '');
    setShowForm(false);
    Alert.alert('Success', 'Transaction added successfully!', [{ text: 'OK' }]);
  }

  if (state.accounts.length === 0 || state.categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {state.accounts.length === 0 && state.categories.length === 0
            ? 'Please add at least one account and one category in their respective tabs.'
            : state.accounts.length === 0
            ? 'Please add an account in the Accounts tab.'
            : 'Please add a category in the Categories tab.'}
        </Text>
      </View>
    );
  }

  const recentRecords = state.records.slice(0, 5);

  return (
    <View style={styles.container}>
      <FlatList
        data={recentRecords}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Transaction Records</Text>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {state.records.length > 5 && (
                  <TouchableOpacity onPress={() => Alert.alert('Info', 'Full transaction history can be viewed in a detailed view (coming soon).')}>
                    <Text style={styles.viewMore}>View More</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const category = state.categories.find((c) => c.id === item.categoryId);
          const account = state.accounts.find((a) => a.id === item.accountId);
          return (
            <View style={[styles.recordItem, item.type === 'expense' ? styles.expense : styles.income]}>
              <Text style={styles.recordText}>
                {new Date(item.date).toLocaleDateString()} - {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
              <Text style={styles.recordAmount}>
                {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)} {item.currency}
              </Text>
              <Text style={styles.recordText}>Category: {category?.name || 'Unknown'}</Text>
              <Text style={styles.recordText}>Account: {account?.name || 'Unknown'}</Text>
              {item.notes && <Text style={styles.recordText}>Notes: {item.notes}</Text>}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions recorded yet.</Text>}
        contentContainerStyle={styles.listContent}
      />
      {showForm && (
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Add Transaction</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Enter amount (e.g., 25.99)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => {
                setType(itemValue);
                setCategoryId(state.categories.filter((c) => c.type === itemValue).length > 0 ? state.categories.filter((c) => c.type === itemValue)[0].id : '');
              }}
              style={styles.picker}
            >
              <Picker.Item label="Expense" value="expense" />
              <Picker.Item label="Income" value="income" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={accountId}
              onValueChange={(itemValue) => setAccountId(itemValue)}
              style={styles.picker}
              enabled={state.accounts.length > 0}
            >
              {state.accounts.length === 0 ? (
                <Picker.Item label="No accounts available" value="" />
              ) : (
                state.accounts.map((account) => (
                  <Picker.Item
                    key={account.id}
                    label={`${account.name} ($${account.balance.toFixed(2)} ${account.currency})`}
                    value={account.id}
                  />
                ))
              )}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={(itemValue) => setCategoryId(itemValue)}
              style={styles.picker}
              enabled={state.categories.filter((c) => c.type === type).length > 0}
            >
              {state.categories.filter((c) => c.type === type).length === 0 ? (
                <Picker.Item label={`No ${type} categories available`} value="" />
              ) : (
                state.categories
                  .filter((c) => c.type === type)
                  .map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
                  ))
              )}
            </Picker>
          </View>
          <TextInput
            placeholder="Optional notes (e.g., Grocery shopping)"
            value={notes}
            onChangeText={setNotes}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              (!amount || !accountId || !categoryId || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) && styles.addButtonDisabled,
            ]}
            onPress={addRecord}
            disabled={!amount || !accountId || !categoryId || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
          >
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(!showForm)}
      >
        <Ionicons name={showForm ? 'close' : 'add'} size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingBottom: 80, // Space for FAB
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginVertical: 16,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  viewMore: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  recordItem: {
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
  expense: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  income: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  recordText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: {
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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