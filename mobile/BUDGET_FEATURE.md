# Monthly Budget Feature

## Overview

The Monthly Budget feature allows users to set and manage monthly budget targets for their expenses. This helps users track their spending against predefined budgets and stay within their financial limits.

## Features

### ✅ Budget Management
- **Add Monthly Budgets** - Set budget amounts for specific months and years
- **Edit Budgets** - Modify existing budget amounts
- **Delete Budgets** - Remove unwanted budget entries
- **View All Budgets** - See all your budget entries in a list

### ✅ User Interface
- **Intuitive Form** - Easy month/year selection with visual pickers
- **Amount Input** - Numeric keyboard for budget amount entry
- **Loading States** - Visual feedback during operations
- **Error Handling** - User-friendly error messages

### ✅ Data Storage
- **Firestore Collection** - `monthly_budgets` collection
- **Structured Data** - Month, year, amount, timestamps
- **Real-time Updates** - Immediate reflection of changes

## Database Schema

### Collection: `monthly_budgets`

```javascript
{
  id: "auto-generated",
  month: 8,           // Number 1-12 (August = 8)
  year: 2025,         // Full year (2025)
  amount: 50000.00,   // Budget amount in rupees
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## API Functions

### `budgetService.js`

#### 1. `addMonthlyBudget(month, year, amount)`
- Adds a new monthly budget
- Parameters: month (1-12), year, amount
- Returns: Document ID

#### 2. `getMonthlyBudgets()`
- Retrieves all budget entries
- Returns: Array of budget objects

#### 3. `getBudgetForMonth(month, year)`
- Gets budget for specific month/year
- Returns: Budget object or null

#### 4. `updateMonthlyBudget(budgetId, month, year, amount)`
- Updates existing budget
- Parameters: budget ID, month, year, amount

#### 5. `deleteMonthlyBudget(budgetId)`
- Deletes budget entry
- Parameters: budget ID

#### 6. `getCurrentMonthBudget()`
- Gets budget for current month
- Returns: Budget object or null

## Screen Features

### BudgetScreen.js

#### Form Section
- **Month Picker** - Visual selection of months (January-December)
- **Year Picker** - Selection of years (current year ±2)
- **Amount Input** - Numeric input for budget amount
- **Action Buttons** - Add/Update/Cancel buttons

#### Budget List Section
- **Budget Cards** - Display month, year, and amount
- **Edit/Delete Actions** - Individual action buttons per budget
- **Empty State** - Helpful message when no budgets exist

## Navigation

### Tab Bar Integration
- **New Tab** - "Budget" tab with wallet icon
- **Stack Navigation** - Proper navigation handling
- **Consistent Design** - Matches app's design language

## Usage Flow

### Adding a Budget
1. Navigate to "Budget" tab
2. Select month from picker
3. Select year from picker
4. Enter budget amount
5. Tap "Add Budget"
6. Budget appears in list

### Editing a Budget
1. Tap edit button on budget card
2. Form populates with existing data
3. Modify values as needed
4. Tap "Update Budget"
5. Changes reflect immediately

### Deleting a Budget
1. Tap delete button on budget card
2. Confirm deletion in alert
3. Budget removed from list

## Integration Points

### Future Enhancements
- **Dashboard Integration** - Show budget vs actual spending
- **Progress Indicators** - Visual budget usage tracking
- **Notifications** - Alerts when approaching budget limits
- **Budget Analytics** - Spending patterns and insights

### Dashboard Integration (Planned)
```javascript
// Example: Show budget progress in dashboard
const currentBudget = await getCurrentMonthBudget();
const currentExpenses = await getExpensesByTimeFilter('MONTHLY');
const totalSpent = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
const remainingBudget = currentBudget ? currentBudget.amount - totalSpent : 0;
```

## Error Handling

### Validation
- **Required Fields** - Month, year, and amount must be provided
- **Valid Amount** - Amount must be greater than 0
- **Duplicate Prevention** - One budget per month/year combination

### Network Errors
- **Connection Issues** - Graceful error messages
- **Retry Logic** - Automatic retry on failure
- **Offline Support** - Future enhancement

## Testing

### Manual Testing Checklist
- [ ] Add new budget
- [ ] Edit existing budget
- [ ] Delete budget
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Navigation flow

### Test Data
```javascript
// Sample budget entries
{
  month: 8,
  year: 2025,
  amount: 50000.00
},
{
  month: 9,
  year: 2025,
  amount: 45000.00
}
```

## Performance Considerations

### Optimizations
- **Efficient Queries** - Server-side filtering
- **Minimal Data Transfer** - Only fetch needed data
- **Caching** - Local state management
- **Lazy Loading** - Load budgets on demand

### Scalability
- **Indexed Queries** - Firestore indexes for month/year
- **Pagination** - Future enhancement for large datasets
- **Real-time Updates** - Firebase listeners for live data

## Security

### Data Validation
- **Input Sanitization** - Validate all user inputs
- **Type Checking** - Ensure correct data types
- **Range Validation** - Month (1-12), Year (reasonable range)

### Access Control
- **User-specific Data** - Future user authentication integration
- **Data Privacy** - Secure data transmission
- **Audit Trail** - Timestamp tracking for changes

## Conclusion

The Monthly Budget feature provides a comprehensive solution for budget management with:
- ✅ **Complete CRUD operations**
- ✅ **User-friendly interface**
- ✅ **Robust error handling**
- ✅ **Scalable architecture**
- ✅ **Future-ready design**

This feature enhances the expense tracker by adding financial planning capabilities, helping users maintain better control over their spending habits. 