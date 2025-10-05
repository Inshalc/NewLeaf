import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, FlatList } from 'react-native';
import { ProgressBar } from 'react-native-paper';

type Country = 'Canada' | 'USA' | 'UK';
type HealthType = 'Doctor' | 'Vaccination' | 'Insurance';
type Expense = { id: string; category: string; amount: number; date: string };
type HealthTask = { id: string; type: HealthType; description: string; date: string; reminder?: boolean };

const defaultBudgets: Record<Country, Record<string, number>> = {
  Canada: { Rent: 1200, Groceries: 350, Transport: 150, Healthcare: 50, Misc: 200 },
  USA: { Rent: 1300, Groceries: 400, Transport: 200, Healthcare: 100, Misc: 250 },
  UK: { Rent: 1000, Groceries: 300, Transport: 120, Healthcare: 60, Misc: 180 },
};

export default function SettlementDashboard() {
  const router = useRouter();

  const [country, setCountry] = useState<Country>('Canada');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [healthTasks, setHealthTasks] = useState<HealthTask[]>([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '' });
  const [newHealthTask, setNewHealthTask] = useState<{ type: HealthType; description: string; date: Date }>({ type: 'Doctor', description: '', date: new Date() });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => { loadData(); }, [country]);

  const loadData = async () => {
    const exp = await AsyncStorage.getItem(`expenses_${country}`);
    const health = await AsyncStorage.getItem(`health_${country}`);
    setExpenses(exp ? JSON.parse(exp) : []);
    setHealthTasks(health ? JSON.parse(health) : []);
  };

  const saveData = async () => {
    await AsyncStorage.setItem(`expenses_${country}`, JSON.stringify(expenses));
    await AsyncStorage.setItem(`health_${country}`, JSON.stringify(healthTasks));
    Alert.alert('Saved!');
  };

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount) {
      Alert.alert('Error', 'Please select a category and enter an amount');
      return;
    }
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }

    const expense: Expense = { 
      id: Date.now().toString(), 
      category: newExpense.category, 
      amount: amount, 
      date: new Date().toISOString() 
    };
    
    setExpenses(prev => [...prev, expense]);
    setNewExpense({ category: '', amount: '' });
    setShowCategoryDropdown(false);
  };

  const addHealthTask = () => {
    if (!newHealthTask.description) return;
    const task: HealthTask = { id: Date.now().toString(), type: newHealthTask.type, description: newHealthTask.description, date: newHealthTask.date.toISOString(), reminder: true };
    setHealthTasks(prev => [...prev, task]);
    setNewHealthTask({ type: 'Doctor', description: '', date: new Date() });
    setShowDatePicker(false);
  };

  const getTotalSpent = (category: string) => expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
  const upcomingHealthTasks = healthTasks.filter(task => new Date(task.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const selectCategory = (category: string) => {
    setNewExpense({ ...newExpense, category });
    setShowCategoryDropdown(false);
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and one decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (cleanedText.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setNewExpense({ ...newExpense, amount: cleanedText });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backText}>← Back to Homepage</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>NewLeaf Settlement Dashboard</Text>
        <Text style={styles.subtitle}>Track your expenses and health tasks</Text>
      </View>

      {/* Country Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Country</Text>
        <View style={styles.countryBar}>
          {(['Canada', 'USA', 'UK'] as Country[]).map(c => (
            <TouchableOpacity 
              key={c} 
              style={[styles.countryButton, country === c && styles.countrySelected]} 
              onPress={() => setCountry(c)}
            >
              <Text style={[styles.countryText, country === c && styles.countryTextSelected]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Expense Tracker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Expense Tracker</Text>
        <View style={styles.cardContainer}>
          {Object.keys(defaultBudgets[country]).map(cat => {
            const spent = getTotalSpent(cat);
            const budget = defaultBudgets[country][cat];
            const progress = Math.min(spent / budget, 1);
            return (
              <View key={cat} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <Text style={styles.expenseCategory}>{cat}</Text>
                  <Text style={styles.expenseAmount}>${spent} / ${budget}</Text>
                </View>
                <ProgressBar 
                  progress={progress} 
                  color={progress < 0.7 ? '#4CAF50' : progress < 0.9 ? '#FF9800' : '#F44336'} 
                  style={styles.progressBar} 
                />
                <Text style={styles.progressText}>
                  {progress < 1 ? `$${Math.round((budget - spent) * 100) / 100} left` : 'Budget exceeded!'}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.addExpenseSection}>
          <Text style={styles.sectionSubtitle}>Add New Expense</Text>
          
          {/* Category Dropdown */}
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowCategoryDropdown(true)}
          >
            <Text style={newExpense.category ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
              {newExpense.category || 'Select Category'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <Modal
            visible={showCategoryDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCategoryDropdown(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowCategoryDropdown(false)}
            >
              <View style={styles.dropdownModal}>
                <FlatList
                  data={Object.keys(defaultBudgets[country])}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => selectCategory(item)}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <TextInput 
            style={styles.input} 
            placeholder="Amount" 
            placeholderTextColor="#999"
            keyboardType="decimal-pad" 
            value={newExpense.amount} 
            onChangeText={handleAmountChange}
          />
          
          <TouchableOpacity style={styles.primaryButton} onPress={addExpense}>
            <Text style={styles.primaryButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Health & Wellness */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🩺 Health & Wellness</Text>
        
        {upcomingHealthTasks.length > 0 ? (
          <View style={styles.cardContainer}>
            {upcomingHealthTasks.map(task => (
              <View key={task.id} style={styles.healthCard}>
                <View style={styles.healthHeader}>
                  <Text style={styles.healthType}>{task.type}</Text>
                  <Text style={styles.healthDate}>{new Date(task.date).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.healthDescription}>{task.description}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming health tasks</Text>
          </View>
        )}

        <View style={styles.addHealthSection}>
          <Text style={styles.sectionSubtitle}>Add Health Task</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Description" 
            placeholderTextColor="#999"
            value={newHealthTask.description} 
            onChangeText={text => setNewHealthTask(prev => ({ ...prev, description: text }))} 
          />

          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>📅 Pick Date</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker 
              value={newHealthTask.date} 
              mode="date" 
              display="default" 
              onChange={(e, date) => { 
                if (date) setNewHealthTask(prev => ({ ...prev, date })); 
                setShowDatePicker(false); 
              }} 
            />
          )}

          <View style={styles.healthTypeBar}>
            {(['Doctor', 'Vaccination', 'Insurance'] as HealthType[]).map(t => (
              <TouchableOpacity 
                key={t} 
                style={[styles.healthTypeButton, newHealthTask.type === t && styles.healthTypeSelected]} 
                onPress={() => setNewHealthTask(prev => ({ ...prev, type: t }))}
              >
                <Text style={[styles.healthTypeButtonText, newHealthTask.type === t && styles.healthTypeButtonSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.primaryButton} onPress={addHealthTask}>
            <Text style={styles.primaryButtonText}>Add Health Task</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveData}>
        <Text style={styles.saveButtonText}>💾 Save All Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f8f9fa',
  },
  backButton: { 
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backText: { 
    color: '#4CAF50', 
    fontSize: 16, 
    fontWeight: '600',
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#2e7d32', 
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 12,
  },
  countryBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  countryButton: { 
    paddingVertical: 10,
    paddingHorizontal: 16, 
    borderRadius: 8, 
    backgroundColor: '#f1f8e9',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  countrySelected: { 
    backgroundColor: '#4CAF50',
  },
  countryText: { 
    color: '#388E3C', 
    fontWeight: '500',
    fontSize: 14,
  },
  countryTextSelected: { 
    color: '#fff', 
    fontWeight: 'bold',
  },
  cardContainer: {
    marginBottom: 15,
  },
  expenseCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseCategory: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2e7d32',
  },
  expenseAmount: {
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  healthCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  healthType: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1976D2',
  },
  healthDate: {
    fontSize: 14,
    color: '#666',
  },
  healthDescription: {
    color: '#333',
    fontSize: 14,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 15,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },
  addExpenseSection: {
    marginTop: 10,
  },
  addHealthSection: {
    marginTop: 10,
  },
  // Dropdown Styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownButtonPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: '80%',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    padding: 12, 
    marginBottom: 15, 
    borderRadius: 8, 
    backgroundColor: '#f8f9fa',
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#f1f8e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  healthTypeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  healthTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f8e9',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  healthTypeSelected: {
    backgroundColor: '#2196F3',
  },
  healthTypeButtonText: {
    color: '#1976D2',
    fontWeight: '500',
    fontSize: 14,
  },
  healthTypeButtonSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});