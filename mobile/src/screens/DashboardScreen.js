import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { 
  getExpenses, 
  getExpensesByTimeFilter, 
  getExpensesByCategory,
  getExpensesByDateRangeAndCategory 
} from '../utils/expenseService';
import { getCurrentMonthBudget, getMonthlyBudgets } from '../utils/budgetService';
import { allCategories, categoryColors } from '../constants/categories';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;
const isMediumScreen = width >= 360 && width < 480;

// Helper function to format y-axis labels
const formatYAxisLabel = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  } else {
    return value.toString();
  }
};

// Helper function to format chart data values
const formatChartValue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  } else {
    return value.toString();
  }
};



// Circular Progress Component
const CircularProgress = ({ progress, size = 80, strokeWidth = 8, color = '#FF6B6B' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
        }}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
};

const DashboardScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [budgetData, setBudgetData] = useState(null);
  const [monthlyBudgets, setMonthlyBudgets] = useState([]);
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);

  const timeFilters = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEAR'];

  useEffect(() => {
    loadExpenses();
    loadBudgetData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
      loadBudgetData();
    }, [])
  );

  useEffect(() => {
    if (expenses.length > 0) {
      loadFilteredExpenses();
    }
  }, [selectedTimeFilter, selectedCategory, expenses]);

  const loadBudgetData = async () => {
    try {
      const [budget, allBudgets] = await Promise.all([
        getCurrentMonthBudget(),
        getMonthlyBudgets()
      ]);
      setBudgetData(budget);
      
      // Filter budgets for current year
      const currentYear = new Date().getFullYear();
      const currentYearBudgets = allBudgets.filter(b => b.year === currentYear);
      setMonthlyBudgets(currentYearBudgets);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      
      // Calculate current month total (unaffected by time filter)
      calculateCurrentMonthTotal(data);
      
      // Calculate total amount from all expenses
      const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalAmount(total);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expenses');
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentMonthTotal = (expensesData) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const currentMonthExpenses = expensesData.filter(expense => {
      let expenseDate;
      if (expense.date && expense.date.toDate) {
        expenseDate = expense.date.toDate();
      } else if (expense.date) {
        expenseDate = new Date(expense.date);
      } else {
        return false;
      }
      return expenseDate.getMonth() + 1 === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const total = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setCurrentMonthTotal(total);
  };

  const loadFilteredExpenses = async () => {
    try {
      let data;
      
      // Always get data based on time filter first
      switch (selectedTimeFilter) {
        case 'DAILY':
          data = await getExpensesByTimeFilter('DAILY');
          break;
        case 'WEEKLY':
          data = await getExpensesByTimeFilter('WEEKLY');
          break;
        case 'MONTHLY':
          data = await getExpensesByTimeFilter('MONTHLY');
          break;
        case 'YEAR':
          data = await getExpensesByTimeFilter('YEAR');
          break;
        default:
          data = await getExpensesByTimeFilter('MONTHLY');
      }
      
      // Apply category filter client-side if a category is selected
      if (selectedCategory) {
        data = data.filter(expense => expense.category === selectedCategory);
      }
      
      setFilteredExpenses(data);
    } catch (error) {
      console.error('Error loading filtered expenses:', error);
      Alert.alert('Error', 'Failed to load filtered expenses');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadFilteredExpenses(),
      loadBudgetData()
    ]);
    // Recalculate current month total after loading expenses
    calculateCurrentMonthTotal(expenses);
    setRefreshing(false);
  };

  const animateCategory = (category) => {
    // Reset scale animation
    scaleAnim.setValue(1);
    
    // Animate scale up and down for pop effect
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCategoryPress = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(category);
      animateCategory(category);
    }
  };

  const handleOutsidePress = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const handleLegendItemPress = (category, event) => {
    // Prevent the outside press handler from firing when tapping legend items
    event.stopPropagation();
    
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(category);
      animateCategory(category);
    }
  };

  const getPieChartData = () => {
    // Use filtered expenses for pie chart based on time filter
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Calculate total amount
    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    if (totalAmount === 0) {
      return [];
    }
    
    // Create a unique color palette for categories with distinct, visually different colors
    const uniqueColors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Mint Green
      '#FFEAA7', // Light Yellow
      '#DDA0DD', // Plum
      '#98D8C8', // Sea Green
      '#F7DC6F', // Golden Yellow
      '#BB8FCE', // Lavender
      '#85C1E9', // Sky Blue
      '#82E0AA', // Light Green
      '#5F27CD', // Purple
      '#F1948A', // Salmon
      '#D7BDE2', // Light Purple
      '#A9DFBF', // Light Mint
      '#F9E79F', // Pale Yellow
      '#D5A6BD', // Rose
      '#A3E4D7', // Aqua
      '#FAD7A0', // Peach
      '#AED6F1', // Light Blue
      '#FF9F43', // Orange
      '#10AC84', // Green
      '#6C5CE7', // Purple
      '#FF6348', // Tomato Red
      '#2ED573', // Lime Green
      '#1E90FF', // Dodger Blue
      '#FFA502', // Dark Orange
      '#2F3542', // Dark Gray
      '#5352ED', // Indigo
      '#3742FA', // Royal Blue
      '#FF4757', // Bright Red
      '#00D2D3', // Bright Teal
      '#FF6B9D', // Pink
      '#54A0FF', // Bright Blue
      '#00B894', // Emerald
      '#FD79A8', // Pink
      '#6C5CE7', // Purple
      '#00CEC9'  // Cyan
    ];
    
    // Show all categories without filtering by threshold
    const chartData = Object.keys(categoryTotals).map((category, index) => {
      const percentage = Math.round((categoryTotals[category] / totalAmount) * 100);
      const isSelected = selectedCategory === category;
      
      // Use predefined color if available, otherwise use unique color from palette
      const baseColor = categoryColors[category] || uniqueColors[index % uniqueColors.length];
      
      // Apply highlighting for selected category with high contrast
      const color = isSelected ? '#FF1744' : baseColor;
      
      const dataItem = {
        name: category,
        population: categoryTotals[category],
        percentage: percentage,
        color: color,
        legendFontColor: '#7F7F7F',
        legendFontSize: 11,
      };
      
      return dataItem;
    });

    const sortedData = chartData.sort((a, b) => b.population - a.population);
    return sortedData;
  };

  const getLineChartData = () => {
    // Group expenses by month
    const monthlyData = {};
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    return {
      labels: sortedMonths.map(month => month.substring(5)), // Show only month
      datasets: [{
        data: sortedMonths.map(month => monthlyData[month]),
      }],
    };
  };

  const getMonthlyExpenseVsBudgetData = () => {
    const currentYear = new Date().getFullYear();
    const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    
    // Use all expenses for the current year (not filtered by time filter)
    const currentYearExpenses = expenses.filter(expense => {
      // Handle Firestore Timestamp conversion
      let expenseDate;
      if (expense.date && expense.date.toDate) {
        // Firestore Timestamp
        expenseDate = expense.date.toDate();
      } else if (expense.date) {
        // Regular Date object or string
        expenseDate = new Date(expense.date);
      } else {
        return false;
      }
      return expenseDate.getFullYear() === currentYear;
    });

    // Group expenses by month
    const monthlyExpenses = {};
    currentYearExpenses.forEach(expense => {
      let expenseDate;
      if (expense.date && expense.date.toDate) {
        // Firestore Timestamp
        expenseDate = expense.date.toDate();
      } else {
        // Regular Date object or string
        expenseDate = new Date(expense.date);
      }
      const month = expenseDate.getMonth() + 1; // 1-12
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + expense.amount;
    });

    // Create budget data for each month
    const monthlyBudgetData = {};
    monthlyBudgets.forEach(budget => {
      monthlyBudgetData[budget.month] = budget.amount;
    });

    // Prepare chart data
    const expenseData = [];
    const budgetData = [];
    
    for (let month = 1; month <= 12; month++) {
      expenseData.push(monthlyExpenses[month] || 0);
      budgetData.push(monthlyBudgetData[month] || 0);
    }



    return {
      labels: months,
      datasets: [
        {
          data: expenseData,
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // Red for expenses
          strokeWidth: 3,
          fillShadowGradient: '#FF6B6B',
          fillShadowGradientOpacity: 0.3,
        },
        {
          data: budgetData,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green for budget
          strokeWidth: 3,
          fillShadowGradient: '#4CAF50',
          fillShadowGradientOpacity: 0.3,
        },
      ],
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Icon name="hourglass-empty" size={48} color="#666" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Budget Tracker */}
        {budgetData && (
          <View style={styles.budgetTrackerSection}>
            <View style={styles.budgetTrackerCard}>
              <View style={styles.budgetTrackerContent}>
                <View style={styles.budgetProgressSection}>
                  <CircularProgress 
                    progress={Math.min(100, Math.round((currentMonthTotal / budgetData.amount) * 100))}
                    size={80}
                    strokeWidth={8}
                    color={Math.round((currentMonthTotal / budgetData.amount) * 100) > 80 ? '#F44336' : '#4CAF50'}
                  />
                </View>
                <View style={styles.budgetDetailsSection}>
                  <View style={styles.budgetDetailRow}>
                    <Text style={styles.budgetDetailLabel}>Actual Expense</Text>
                    <Text style={styles.budgetDetailValue}>₹{currentMonthTotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.budgetDetailRow}>
                    <Text style={styles.budgetDetailLabel}>Expenses Budget</Text>
                    <Text style={styles.budgetDetailValue}>₹{budgetData.amount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.budgetDetailRow}>
                    <Text style={styles.budgetDetailLabel}>Difference (₹)</Text>
                    <Text style={[
                      styles.budgetDetailValue,
                      { color: (budgetData.amount - currentMonthTotal) >= 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      ₹{(budgetData.amount - currentMonthTotal).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Summary Cards - Shows all data for pie chart context */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryAmount}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryIcon}>
              <Icon name="account-balance-wallet" size={18} color="#fff" />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Icon name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="category" size={24} color="#FF9800" />
              <Text style={styles.statValue}>
                {new Set(expenses.map(e => e.category)).size}
              </Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* Time Filter - Always visible */}
        <View style={styles.timeFilterSection}>
          <View style={[
            styles.timeFilterContainer,
            isSmallScreen && styles.timeFilterContainerSmall
          ]}>
            {timeFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.timeFilterButton,
                  selectedTimeFilter === filter && styles.timeFilterButtonActive,
                  isSmallScreen && styles.timeFilterButtonSmall
                ]}
                onPress={() => setSelectedTimeFilter(filter)}
              >
                <Text style={[
                  styles.timeFilterText,
                  selectedTimeFilter === filter && styles.timeFilterTextActive,
                  isSmallScreen && styles.timeFilterTextSmall
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          {/* Pie Chart - Affected by time filter */}
          <View style={styles.chartSection}>
            <View style={styles.chartCard}>
              <TouchableOpacity
                style={styles.chartCardTouchable}
                activeOpacity={1}
                onPress={handleOutsidePress}
              >
                <Text style={styles.chartTitle}>Expense Distribution ({selectedTimeFilter})</Text>
                                {filteredExpenses.length > 0 ? (
                  <>
                    <View style={styles.chartContainer}>
                      {(() => {
                        const pieData = getPieChartData();
                        if (pieData.length === 0) {
                          return (
                            <View style={styles.pieChartEmptyState}>
                              <Icon name="pie-chart" size={64} color="#ccc" />
                              <Text style={styles.pieChartEmptyText}>No expenses found for {selectedTimeFilter}</Text>
                              <Text style={styles.pieChartEmptySubtext}>
                                Try selecting a different time period or add some expenses
                              </Text>
                            </View>
                          );
                        }
                        
                        return (
                          <PieChart
                            data={pieData}
                            width={Math.min(width - 40, 350)}
                            height={isSmallScreen ? 220 : 280}
                            chartConfig={{
                              backgroundColor: '#ffffff',
                              backgroundGradientFrom: '#ffffff',
                              backgroundGradientTo: '#ffffff',
                              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="90"
                            absolute
                            hasLegend={false}
                          />
                        );
                      })()}
                    </View>
                    <View style={styles.pieChartLegend}>
                      {(() => {
                        const pieData = getPieChartData();
                        if (pieData.length === 0) {
                          return null;
                        }
                        
                        return pieData.map((item, index) => {
                          const isSelected = selectedCategory === item.name;
                          return (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.pieLegendItem,
                                isSelected && styles.pieLegendItemSelected
                              ]}
                              onPress={(event) => handleLegendItemPress(item.name, event)}
                              activeOpacity={0.7}
                            >
                              <Animated.View 
                                style={[
                                  styles.pieLegendDot, 
                                  { 
                                    backgroundColor: item.color,
                                    opacity: isSelected ? 0.9 : 0.7,
                                    transform: [{ scale: isSelected ? scaleAnim : 1 }]
                                  }
                                ]} 
                              />
                              <Text style={[
                                styles.pieLegendCategory,
                                isSelected && styles.pieLegendCategorySelected
                              ]}>
                                {item.name}
                              </Text>
                              <Text style={styles.pieLegendAmount}>₹{item.population.toFixed(2)}</Text>
                              <Text style={styles.pieLegendPercentage}>({item.percentage}%)</Text>
                            </TouchableOpacity>
                          );
                        });
                      })()}
                    </View>
                  </>
                ) : (
                  <View style={styles.pieChartEmptyState}>
                    <Icon name="pie-chart" size={64} color="#ccc" />
                    <Text style={styles.pieChartEmptyText}>No expenses found for {selectedTimeFilter}</Text>
                    <Text style={styles.pieChartEmptySubtext}>
                      Try selecting a different time period or add some expenses
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Monthly Expense vs Budget Line Chart - Always shows for current year */}
          <View style={styles.chartSection}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Monthly Expenses vs Budget</Text>
                              <View style={styles.chartContainer}>
                  <LineChart
                    data={getMonthlyExpenseVsBudgetData()}
                    width={Math.min(width - 60, 320)}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      fillShadowGradient: '#4CAF50',
                      fillShadowGradientOpacity: 0.3,
                      propsForLabels: {
                        fontSize: isSmallScreen ? 8 : 10,
                      },
                    }}
                    bezier
                    withDots={false}
                    withShadow={false}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={true}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </View>
              <View style={styles.lineChartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                  <Text style={styles.legendText}>Expenses</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>Budget</Text>
                </View>
              </View>
            </View>
          </View>
        </View>


        </ScrollView>
      )}
      
      {/* Overlay to handle outside taps when category is selected */}
      {selectedCategory && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleOutsidePress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollView: {
    flex: 1,
  },
  timeFilterSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  timeFilterButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  timeFilterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  timeFilterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    flexShrink: 1,
  },
  timeFilterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  timeFilterContainerSmall: {
    gap: 2,
    paddingHorizontal: 2,
  },
  timeFilterButtonSmall: {
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 36,
  },
  timeFilterTextSmall: {
    fontSize: 10,
  },

  summarySection: {
    margin: 16,
    backgroundColor: 'white',
    padding: 8, // Reduced from 16 to 8
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 16 to 8
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 15, // Reduced from 12 to 10
    color: '#666',
    marginTop: 5,
    marginBottom: 1,
    marginLeft: 10, // Reduced from 2 to 1
  },
  summaryAmount: {
    fontSize: 18, // Reduced from 24 to 18
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 1,
    marginLeft: 10, // Reduced from 2 to 1
  },
  summaryCount: {
    fontSize: 10, // Reduced from 12 to 10
    color: '#666',
  },
  summaryIcon: {
    backgroundColor: '#2196F3',
    borderRadius: 6, // Reduced from 8 to 6
    padding: 6, // Reduced from 8 to 6
    width: 36, // Reduced from 48 to 36
    height: 36, // Reduced from 48 to 36
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6, // Reduced from 10 to 6
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16, // Reduced from 20 to 16
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4, // Reduced from 8 to 4
  },
  statLabel: {
    fontSize: 10, // Reduced from 12 to 10
    color: '#666',
    marginTop: 2, // Reduced from 4 to 2
  },
  chartsSection: {
    margin: 16,
    padding: 0,
  },
  chartSection: {
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  chartCard: {
    backgroundColor: 'white',
    padding: 16,
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
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  topCategoriesCard: {
    padding: 20,
    marginBottom: 20,
  },
  topCategoriesChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingLeft: 10,
    paddingRight: 10,
    overflow: 'hidden',
  },

  pieChartLegend: {
    marginTop: 16,
    paddingHorizontal: 10,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 24,
  },
  pieLegendItemSelected: {
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.3)',
  },
  pieLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  pieLegendCategory: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    flexShrink: 1,
  },
  pieLegendCategorySelected: {
    color: '#FF1744',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  chartCardTouchable: {
    flex: 1,
  },
  pieLegendAmount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  pieLegendPercentage: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  barLegendCategory: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },

  legendSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  lineChartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  pieChartEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  pieChartEmptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  pieChartEmptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    margin: 16,
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
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
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
  budgetTrackerSection: {
    margin: 16,
    marginBottom: 8,
  },
  budgetTrackerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetTrackerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetProgressSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetDetailsSection: {
    flex: 2,
    marginLeft: 16,
  },
  budgetDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  budgetDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  budgetDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

});

export default DashboardScreen; 