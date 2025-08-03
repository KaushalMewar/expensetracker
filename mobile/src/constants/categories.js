export const needsCategories = [
  "Rent or mortgage",
  "Utilities (electricity, water, gas)",
  "Self Upskilling",
  "Transportation (car payments, gas, public transit)",
  "Insurance (health, car, home)",
  "Groceries (basic, not luxury food)",
  "Debt payments",
  "Childcare or essential education costs",
  "Phone and internet bills (basic plans)",
  "Medicines",
  "Investment (NPS, Equity, Debth, ETF, Stocks)"
];

export const wantsCategories = [
  "Dining out",
  "Streaming services (Netflix, Spotify)",
  "Shopping (clothes, gadgets beyond the basics)",
  "Hobbies and entertainment (movies, concerts, sports)",
  "Vacations and travel",
  "Gym memberships",
  "Upgraded phone/internet/cable plans",
  "Coffee shop runs",
  "Miscellaneous",
  "Membership"
];

export const allCategories = [...needsCategories, ...wantsCategories].sort();

export const categoryColors = {
  // High Contrast, Colorblind-Friendly Palette (No Red Shades)
  // Warm Colors (Orange/Yellow/Amber)
  "Rent or mortgage": "#3F51B5", // Indigo - Essential housing (unique color)
  "Groceries (basic, not luxury food)": "#FF9800", // Orange - Basic food needs
  "Dining out": "#7B1FA2", // Purple - Restaurant dining
  "Shopping (clothes, gadgets beyond the basics)": "#F57C00", // Dark Orange
  "Coffee shop runs": "#FFB300", // Amber - Food category
  "Gym memberships": "#FFC107", // Yellow - Warm
  "Miscellaneous": "#FFD54F", // Light Yellow - Warm, high visibility
  
  // Cool Colors (Blue/Green/Purple/Teal)
  "Utilities (electricity, water, gas)": "#1976D2", // Blue - Cool, distinct
  "Transportation (car payments, gas, public transit)": "#388E3C", // Green - Cool
  "Insurance (health, car, home)": "#6A4C93", // Purple - Cool, distinct
  "Phone and internet bills (basic plans)": "#1565C0", // Dark Blue
  "Investment (NPS, Equity, Debth, ETF, Stocks)": "#2E7D32", // Dark Green
  "Healthcare": "#6A1B9A", // Dark Purple
  "Medicines": "#0277BD", // Dark Blue
  "Debt payments": "#00695C", // Teal - Cool, distinct
  
  // Neutral Colors (Gray/Brown)
  "Childcare or essential education costs": "#5D4037", // Brown - Neutral
  "Self Upskilling": "#424242", // Dark Gray - Neutral
  "Education": "#616161", // Gray - Neutral
  "Investment": "#757575", // Gray - Neutral
  "Insurance": "#8D6E63", // Brown - Neutral
  
  // Entertainment & Lifestyle (Distinct Purples/Pinks)
  "Streaming services (Netflix, Spotify)": "#8E24AA", // Purple
  "Hobbies and entertainment (movies, concerts, sports)": "#AD1457", // Pink
  "Vacations and travel": "#6A4C93", // Purple
  "Upgraded phone/internet/cable plans": "#C2185B", // Pink
  "Membership": "#7B1FA2", // Purple
  "Entertainment": "#E91E63", // Pink
  "Dining": "#9C27B0", // Purple
  "Travel": "#673AB7", // Purple
  
  // Additional Categories with High Contrast
  "Groceries": "#FF9800", // Orange - Basic food needs (same as groceries)
  "Food": "#7B1FA2", // Purple - Restaurant dining (same as dining out)
  "Health": "#43A047", // Green
  "Transport": "#388E3C", // Green
  "Transportation": "#2E7D32", // Green
  "Utilities": "#1976D2", // Blue
  "Shopping": "#F57C00", // Dark Orange
  "Transport": "#388E3C", // Green
  "Health": "#43A047", // Green
  "Dining": "#7B1FA2" // Purple - Restaurant dining (same as dining out)
}; 