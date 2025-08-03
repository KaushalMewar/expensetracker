// Test file for chart data generation
// This can be used to verify the chart data functions work correctly

export const testPieChartData = (expenses) => {
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  
  if (totalAmount === 0) {
    console.log('No expenses found for pie chart');
    return [];
  }
  
  const chartData = Object.keys(categoryTotals).map(category => {
    const percentage = Math.round((categoryTotals[category] / totalAmount) * 100);
    
    return {
      name: category,
      amount: categoryTotals[category],
      percentage: percentage,
      color: '#2196F3', // Default color for testing
    };
  });

  return chartData.sort((a, b) => b.amount - a.amount);
};

export const testLineChartData = (expenses, timeFilter) => {
  if (expenses.length === 0) {
    return {
      labels: [],
      datasets: [{ data: [] }]
    };
  }

  let labels = [];
  let data = [];

  switch (timeFilter) {
    case 'DAILY':
      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.getDate().toString().padStart(2, '0'));
        
        // Mock data for testing
        data.push(Math.floor(Math.random() * 1000) + 500);
      }
      break;

    case 'MONTHLY':
      // Generate last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        
        // Mock data for testing
        data.push(Math.floor(Math.random() * 2000) + 1000);
      }
      break;

    default:
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      data = [1200, 1400, 1300, 1600, 1500, 1800];
  }

  return {
    labels: labels,
    datasets: [{ data: data }]
  };
};

// Test with sample data
export const runTests = () => {
  const sampleExpenses = [
    { category: 'Groceries', amount: 500 },
    { category: 'Transportation', amount: 300 },
    { category: 'Entertainment', amount: 200 },
    { category: 'Utilities', amount: 400 },
    { category: 'Shopping', amount: 600 },
  ];

  console.log('Testing pie chart data:');
  const pieData = testPieChartData(sampleExpenses);
  console.log(pieData);

  console.log('Testing line chart data (DAILY):');
  const lineDataDaily = testLineChartData(sampleExpenses, 'DAILY');
  console.log(lineDataDaily);

  console.log('Testing line chart data (MONTHLY):');
  const lineDataMonthly = testLineChartData(sampleExpenses, 'MONTHLY');
  console.log(lineDataMonthly);
}; 