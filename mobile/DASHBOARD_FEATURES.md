# Dashboard Features

## Overview
The dashboard has been redesigned to replicate the modern design from the attached images, featuring a dark gradient background with a prominent donut chart and detailed legend.

## Key Features

### 1. Dark Gradient Background
- Uses a beautiful gradient from dark blue to purple (`#1a237e` to `#3f51b5`)
- Creates a modern, premium look similar to the reference design

### 2. Header Section
- "MY EXPENSES" title in white text
- Current month and year display (e.g., "March 2019")
- Clean, minimalist design

### 3. Time Period Filters
- Four filter options: DAILY, WEEKLY, MONTHLY, YEAR
- Active filter highlighted with orange underline
- Matches the design pattern from the reference
- **Dynamic chart updates based on selected filter**

### 4. Donut Chart
- Large, prominent pie chart on the left side
- Shows expense distribution by category
- Transparent background to blend with gradient
- Sorted by amount (highest to lowest)
- **Only displays when there is expense data**

### 5. Detailed Legend
- Right side legend with category icons and percentages
- Each category shows:
  - Category icon (Material Icons)
  - Category name
  - Percentage of total expenses
- Limited to top 6 categories for clean layout
- Icons match the category colors

### 6. Category Icons
Each expense category has a relevant Material Icon:
- Home: `home`
- Utilities: `flash-on`
- Self Upskilling: `school`
- Transportation: `directions-car`
- Insurance: `security`
- Groceries: `shopping-cart`
- Debt payments: `account-balance`
- Childcare: `child-care`
- Phone/Internet: `phone`
- Medicines: `local-pharmacy`
- Investment: `trending-up`
- Dining out: `restaurant`
- Streaming: `play-circle-outline`
- Shopping: `shopping-bag`
- Entertainment: `sports-esports`
- Travel: `flight`
- Gym: `fitness-center`
- Upgraded plans: `wifi`
- Coffee: `local-cafe`
- Miscellaneous: `more-horiz`
- Membership: `card-membership`

### 7. Summary Card
- Total expenses amount in large, bold text
- Number of transactions
- Semi-transparent background

### 8. Dynamic Trend Charts
- **Line chart that adapts to selected time filter:**
  - **DAILY**: Shows last 7 days with daily totals
  - **WEEKLY**: Shows last 4 weeks with weekly totals  
  - **MONTHLY**: Shows last 6 months with monthly totals
  - **YEAR**: Shows last 4 quarters with quarterly totals
- White background card with shadow
- Blue data points and lines
- **Real data from actual expenses**
- **Dynamic title based on selected filter**

### 9. Responsive Design
- Adapts to different screen sizes
- Proper spacing and typography
- Touch-friendly interface

### 10. Empty State
- Shows when no expenses are available
- Clean, centered layout
- Helpful messaging

## Technical Implementation

### Dependencies
- `react-native-linear-gradient` for gradient background
- `react-native-chart-kit` for charts
- `react-native-vector-icons` for icons

### State Management
- Filters expenses based on selected time period
- Real-time updates when data changes
- Pull-to-refresh functionality
- **Dynamic chart data generation based on filters**

### Chart Data Generation
- **Pie Chart**: Groups expenses by category and calculates percentages
- **Line Chart**: Groups expenses by time period (day/week/month/quarter) based on selected filter
- **Real-time data**: Charts update immediately when filter changes
- **Empty state handling**: Charts only show when data is available

### Color Scheme
- Primary gradient: `#1a237e` to `#3f51b5`
- Text: White with varying opacity
- Chart colors: Category-specific colors
- Active filter: Orange (`#FF9800`)

## Usage
1. Navigate to the Dashboard screen
2. Use time period filters to view different time ranges
3. View expense distribution in the donut chart
4. Check detailed breakdown in the legend
5. **Monitor trends in the dynamic line chart that changes based on your filter**
6. Pull down to refresh data

## Chart Behavior
- **DAILY filter**: Shows expense trends for the last 7 days
- **WEEKLY filter**: Shows expense trends for the last 4 weeks  
- **MONTHLY filter**: Shows expense trends for the last 6 months
- **YEAR filter**: Shows expense trends for the last 4 quarters
- Charts automatically update when switching between filters
- Empty periods show zero values in the line chart

The dashboard now provides a modern, intuitive interface that matches the reference design while maintaining all existing functionality and adding dynamic chart updates based on user-selected filters. 