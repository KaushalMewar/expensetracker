import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import EditExpenseScreen from './src/screens/EditExpenseScreen';
import BudgetScreen from './src/screens/BudgetScreen';

// Import Firebase config
import './src/config/firebase';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for History tab (to handle edit screen)
function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HistoryList" 
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditExpense" 
        component={EditExpenseScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for Add Expense (to handle navigation)
function AddExpenseStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AddExpenseMain" 
        component={AddExpenseScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for Budget (to handle navigation)
function BudgetStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BudgetMain" 
        component={BudgetScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Custom Tab Bar Button for Add Expense
const CustomAddButton = ({ onPress }) => (
  <TouchableOpacity
    style={styles.customAddButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.addButtonContainer}>
      <Icon name="add" size={32} color="white" />
    </View>
  </TouchableOpacity>
);

// Custom Tab Bar Component for better spacing control
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.customTabBar}>
      {/* Left side - Dashboard */}
      <View style={styles.leftSection}>
        {state.routes.map((route, index) => {
          if (route.name === 'Dashboard') {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.regularTab}
                onPress={onPress}
              >
                <Icon name="dashboard" size={24} color={isFocused ? '#2196F3' : 'gray'} />
                <Text style={[styles.tabLabel, { color: isFocused ? '#2196F3' : 'gray' }]}>
                  Dashboard
                </Text>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </View>

      {/* Center - Add Expense Button */}
      <View style={styles.centerSection}>
        {state.routes.map((route, index) => {
          if (route.name === 'Add Expense') {
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.customAddButton}
                onPress={onPress}
                activeOpacity={0.8}
              >
                <View style={styles.addButtonContainer}>
                  <Icon name="add" size={32} color="white" />
                </View>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </View>

      {/* Right side - History and Budget */}
      <View style={styles.rightSection}>
        {state.routes.map((route, index) => {
          if (route.name === 'History' || route.name === 'Budget') {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.compactTab}
                onPress={onPress}
              >
                <Icon 
                  name={route.name === 'History' ? 'history' : 'account-balance-wallet'} 
                  size={24} 
                  color={isFocused ? '#2196F3' : 'gray'} 
                />
                <Text style={[styles.tabLabel, { color: isFocused ? '#2196F3' : 'gray' }]}>
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </View>
    </View>
  );
};

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ 
            title: 'Dashboard',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Add Expense" 
          component={AddExpenseStack}
          options={{ 
            title: '',
            tabBarIcon: ({ focused }) => (
              <CustomAddButton />
            ),
            tabBarButton: (props) => (
              <CustomAddButton onPress={props.onPress} />
            ),
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryStack}
          options={{ 
            title: 'History',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="history" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Budget" 
          component={BudgetStack}
          options={{ 
            title: 'Budget',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="account-balance-wallet" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 5,
    paddingTop: 5,
    height: 70,
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  regularTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  compactTab: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  customAddButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default App; 