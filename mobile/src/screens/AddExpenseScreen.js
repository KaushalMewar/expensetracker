import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addExpense } from '../utils/expenseService';
import { allCategories, needsCategories, wantsCategories } from '../constants/categories';

const { width } = Dimensions.get('window');

const AddExpenseScreen = ({ navigation }) => {
  const [date, setDate] = useState(() => {
    // Create a safe date object for today
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a proper datetime for the selected date (current time on that date)
      const now = new Date();
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      console.log('Selected date object:', selectedDate);
      console.log('Selected date ISO string:', selectedDate.toISOString());
      console.log('Selected date local string:', selectedDate.toLocaleDateString());
      
      await addExpense(selectedDate, category, parseFloat(amount), comment);
      
      Alert.alert(
        'Success',
        `Expense added successfully!\nDate: ${formatDate(date)}\nCategory: ${category}\nAmount: ₹${parseFloat(amount).toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setDate(new Date());
              setCategory('');
              setAmount('');
              setComment('');
              // Navigate back to previous screen
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
      console.error('Error adding expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    try {
      // Ensure we have a valid date object
      const validDate = date instanceof Date ? date : new Date(date);
      
      // Check if the date is valid
      if (isNaN(validDate.getTime())) {
        console.error('Invalid date:', date);
        return 'Invalid Date';
      }
      
      return validDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

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
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Form Card */}
          <View style={styles.formCard}>
            {/* Date Picker */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  try {
                    console.log('Opening DatePicker with date:', date);
                    setShowDatePicker(true);
                  } catch (error) {
                    console.error('Error opening DatePicker:', error);
                    // Reset to a safe date if there's an error
                    setDate(new Date());
                    setShowDatePicker(true);
                  }
                }}
              >
                <Icon name="calendar-today" size={20} color="#666" />
                <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
                <Icon name="arrow-drop-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <DatePicker
              modal
              open={showDatePicker}
              date={date}
              mode="date"
              onConfirm={(selectedDate) => {
                try {
                  console.log('DatePicker - Selected date:', selectedDate);
                  setShowDatePicker(false);
                  setDate(selectedDate);
                } catch (error) {
                  console.error('Error in DatePicker onConfirm:', error);
                  setShowDatePicker(false);
                }
              }}
              onCancel={() => {
                console.log('DatePicker - Cancelled');
                setShowDatePicker(false);
              }}
              maximumDate={new Date()}
              onError={(error) => {
                console.error('DatePicker error:', error);
                setShowDatePicker(false);
              }}
            />

            {/* Category Picker */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Category</Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Icon name="category" size={20} color="#666" />
                <Text style={[styles.categoryButtonText, !category && styles.placeholderText]}>
                  {category || 'Select a category'}
                </Text>
                <Icon name="arrow-drop-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Amount</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  returnKeyType="done"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Comment Input */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Comment (Optional)</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Add a note about this expense..."
                multiline
                numberOfLines={3}
                returnKeyType="done"
                placeholderTextColor="#999"
              />
            </View>

            {/* Submit Button */}
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
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                <View style={styles.categorySection}>
                  <Text style={styles.categorySectionTitle}>NEEDS</Text>
                  {needsCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.categoryItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={styles.categoryItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.categorySection}>
                  <Text style={styles.categorySectionTitle}>WANTS</Text>
                  {wantsCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.categoryItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={styles.categoryItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  categoryButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  placeholderText: {
    color: '#999',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    height: 100,
    textAlignVertical: 'top',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
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
    padding: 20,
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
  categoryList: {
    maxHeight: 500,
  },
  categorySection: {
    marginBottom: 16,
  },
  categorySectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddExpenseScreen; 