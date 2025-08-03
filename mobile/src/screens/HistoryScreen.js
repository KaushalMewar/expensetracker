import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { 
  getExpenses, 
  deleteExpense, 
  getExpensesByTimeFilter, 
  getExpensesByCategory,
  getExpensesByDateRangeAndCategory 
} from '../utils/expenseService';
import { allCategories } from '../constants/categories';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;
const isMediumScreen = width >= 360 && width < 480;

const HistoryScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('This Month');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTimeFilterPicker, setShowTimeFilterPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
    }, [])
  );

  useEffect(() => {
    loadFilteredExpenses();
  }, [selectedCategory, selectedTimeFilter, searchQuery, expenses]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      
      // After loading expenses, also refresh filtered expenses
      await loadFilteredExpenses();
    } catch (error) {
      Alert.alert('Error', 'Failed to load expenses');
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredExpenses = async () => {
    try {
      let data;
      
      // Handle category filtering
      if (selectedCategory !== 'All Categories') {
        // If category is selected, use category-based filtering
        data = await getExpensesByCategory(selectedCategory);
      } else {
        // If no category filter, use time-based filtering
        switch (selectedTimeFilter) {
          case 'This Month':
            data = await getExpensesByTimeFilter('MONTHLY');
            break;
          case 'This Week':
            data = await getExpensesByTimeFilter('WEEKLY');
            break;
          case 'This Year':
            data = await getExpensesByTimeFilter('YEAR');
            break;
          case 'All Time':
            data = await getExpenses();
            break;
          default:
            data = await getExpensesByTimeFilter('MONTHLY');
        }
      }
      
      // Apply search filter locally (since it's text-based)
      if (searchQuery.trim()) {
        data = data.filter(expense => 
          expense.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.amount.toString().includes(searchQuery)
        );
      }
      
      setFilteredExpenses(data);
      
      // Calculate total amount
      const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error loading filtered expenses:', error);
      Alert.alert('Error', 'Failed to load filtered expenses');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFilteredExpenses();
    setRefreshing(false);
  };

  const handleEdit = (expense) => {
    navigation.navigate('EditExpense', { expense });
  };

  const handleDelete = (expense) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this expense record permanently?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              Alert.alert('Success', 'Expense record deleted successfully.');
              loadFilteredExpenses(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense record.');
              console.error('Error deleting expense:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateInput) => {
    try {
      let date;
      
      // Handle Firestore Timestamp objects
      if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
        date = dateInput.toDate();
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else {
        console.error('Invalid date input:', dateInput);
        return 'Invalid Date';
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date after parsing:', dateInput);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateInput);
      return 'Invalid Date';
    }
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
      </View>
      
      {item.comment && item.comment !== 'N/A' && (
        <Text style={styles.expenseComment}>{item.comment}</Text>
      )}
      
      <View style={styles.expenseActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
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
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Icon name="hourglass-empty" size={48} color="#666" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      ) : (
        <>
          {/* Filters Section */}
          <View style={styles.filtersSection}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View style={[
          styles.filterButtonsContainer,
          isSmallScreen && styles.filterButtonsContainerSmall
        ]}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              isSmallScreen && styles.filterButtonSmall
            ]}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Icon name="category" size={isSmallScreen ? 16 : 18} color="#666" />
            <Text style={[
              styles.filterButtonText,
              isSmallScreen && styles.filterButtonTextSmall
            ]} numberOfLines={1}>
              {selectedCategory}
            </Text>
            <Icon name="arrow-drop-down" size={isSmallScreen ? 18 : 20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              isSmallScreen && styles.filterButtonSmall
            ]}
            onPress={() => setShowTimeFilterPicker(true)}
          >
            <Icon name="schedule" size={isSmallScreen ? 16 : 18} color="#666" />
            <Text style={[
              styles.filterButtonText,
              isSmallScreen && styles.filterButtonTextSmall
            ]} numberOfLines={1}>
              {selectedTimeFilter}
            </Text>
            <Icon name="arrow-drop-down" size={isSmallScreen ? 18 : 20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>₹{totalAmount.toFixed(2)}</Text>
          <Text style={styles.summaryCount}>{filteredExpenses.length} expenses</Text>
        </View>
        <View style={styles.summaryIcon}>
          <Icon name="account-balance-wallet" size={32} color="#fff" />
        </View>
      </View>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        style={styles.expenseList}
        contentContainerStyle={styles.expenseListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="receipt-long" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No expenses found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or add a new expense
            </Text>
          </View>
        }
      />

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowCategoryPicker(false)}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedCategory('All Categories');
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>All Categories</Text>
                </TouchableOpacity>
                {allCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {/* Time Filter Picker Modal */}
      {showTimeFilterPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Time Period</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowTimeFilterPicker(false)}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
                {[
                  'This Month',
                  'This Week',
                  'Last Week',
                  'Last Month',
                  'Last 3 Months',
                  'Last 6 Months',
                  'This Year',
                  'All Time'
                ].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedTimeFilter(period);
                      setShowTimeFilterPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{period}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
        </>
      )}
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
  filtersSection: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    marginBottom: 0,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
    minHeight: 44,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  filterButtonsContainerSmall: {
    gap: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
    flex: 1,
    minHeight: 44,
    minWidth: 120,
  },
  filterButtonSmall: {
    padding: 8,
    minHeight: 40,
    minWidth: 100,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
    flex: 1,
    textAlign: 'center',
  },
  filterButtonTextSmall: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  summaryCard: {
    backgroundColor: '#2196F3',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryContent: {
    flex: 1,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryCount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
  },
  expenseList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  expenseListContent: {
    paddingBottom: 16,
  },
  expenseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    flexShrink: 0,
  },
  expenseComment: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 36,
    minHeight: 36,
  },
  editButton: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },

  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: isSmallScreen ? '95%' : '85%',
    maxHeight: '80%',
    minHeight: isSmallScreen ? 300 : 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  pickerList: {
    maxHeight: 500,
    paddingBottom: 10,
  },
  pickerItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 56,
    justifyContent: 'center',
  },
  pickerItemText: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
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
});

export default HistoryScreen; 