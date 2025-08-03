import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { 
  addMonthlyBudget, 
  getMonthlyBudgets, 
  updateMonthlyBudget,
  deleteMonthlyBudget,
  getCurrentMonthBudget 
} from '../utils/budgetService';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;
const isMediumScreen = width >= 360 && width < 480;

const BudgetScreen = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [amount, setAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  // Generate years: Current year + next 4 years (5 total)
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  useEffect(() => {
    loadBudgets();
    // Set default values to current month and year
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await getMonthlyBudgets();
      setBudgets(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load budgets');
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMonth || !selectedYear || !amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please fill in all fields with valid values');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBudget) {
        // Update existing budget
        await updateMonthlyBudget(editingBudget.id, selectedMonth, selectedYear, amount);
        Alert.alert('Success', 'Budget updated successfully!');
      } else {
        // Add new budget
        await addMonthlyBudget(selectedMonth, selectedYear, amount);
        Alert.alert('Success', 'Budget added successfully!');
      }
      
      // Reset form
      setAmount('');
      setEditingBudget(null);
      await loadBudgets(); // Reload budgets
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
      console.error('Error saving budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setSelectedMonth(budget.month);
    setSelectedYear(budget.year);
    setAmount(budget.amount.toString());
  };

  const handleDelete = (budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the budget for ${months[budget.month - 1].label} ${budget.year}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMonthlyBudget(budget.id);
              Alert.alert('Success', 'Budget deleted successfully!');
              await loadBudgets();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
              console.error('Error deleting budget:', error);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setEditingBudget(null);
    setAmount('');
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  const getMonthLabel = (monthValue) => {
    const month = months.find(m => m.value === monthValue);
    return month ? month.label : 'Unknown';
  };

  const getSelectedMonthLabel = () => {
    return selectedMonth ? getMonthLabel(selectedMonth) : 'Select Month';
  };

  const renderDropdownItem = ({ item, onSelect, isSelected }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
      onPress={() => onSelect(item)}
    >
      <Text style={[
        styles.dropdownItemText,
        isSelected && styles.dropdownItemTextSelected
      ]}>
        {item.label || item.toString()}
      </Text>
      {isSelected && (
        <Icon name="check" size={16} color="#2196F3" />
      )}
    </TouchableOpacity>
  );

  const renderBudgetItem = (budget) => (
    <View key={budget.id} style={styles.budgetCard}>
      <View style={styles.budgetInfo}>
        <Text style={styles.budgetMonth}>
          {getMonthLabel(budget.month)} {budget.year}
        </Text>
        <Text style={styles.budgetAmount}>₹{budget.amount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.budgetActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(budget)}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(budget)}
        >
          <Icon name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Budget</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Icon name="hourglass-empty" size={48} color="#666" />
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Add/Edit Budget Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingBudget ? 'Edit Budget' : 'Add Monthly Budget'}
            </Text>
            
            {/* Month Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Month</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMonthDropdown(true)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  selectedMonth ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder
                ]}>
                  {getSelectedMonthLabel()}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Year Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowYearDropdown(true)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  selectedYear ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder
                ]}>
                  {selectedYear || 'Select Year'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Budget Amount (₹)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter budget amount"
                placeholderTextColor="#999"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.formActions}>
              {editingBudget && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Icon name="hourglass-empty" size={20} color="white" />
                ) : (
                  <Icon name="check" size={20} color="white" />
                )}
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Saving...' : (editingBudget ? 'Update Budget' : 'Add Budget')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget List */}
          <View style={styles.budgetListSection}>
            <Text style={styles.sectionTitle}>Your Budgets</Text>
            {budgets.length > 0 ? (
              budgets.map(renderBudgetItem)
            ) : (
              <View style={styles.emptyState}>
                <Icon name="account-balance-wallet" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No budgets set</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add your first monthly budget to get started
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Month Dropdown Modal */}
      <Modal
        visible={showMonthDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthDropdown(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={months}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => renderDropdownItem({
                item,
                onSelect: (selectedItem) => {
                  setSelectedMonth(selectedItem.value);
                  setShowMonthDropdown(false);
                },
                isSelected: selectedMonth === item.value
              })}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Dropdown Modal */}
      <Modal
        visible={showYearDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearDropdown(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => renderDropdownItem({
                item,
                onSelect: (selectedItem) => {
                  setSelectedYear(selectedItem);
                  setShowYearDropdown(false);
                },
                isSelected: selectedYear === item
              })}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dropdownButtonTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  dropdownButtonTextPlaceholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  budgetListSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  budgetCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  budgetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  editButton: {
    backgroundColor: '#e3f2fd',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default BudgetScreen; 