import sys
import os
from datetime import date, datetime, timedelta
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import tempfile

from PyQt5.QtCore import Qt, QUrl, QDate
from PyQt5.QtWidgets import (
    QApplication, QWidget, QLabel, QLineEdit, QComboBox, QPushButton,
    QVBoxLayout, QHBoxLayout, QMessageBox, QFrame, QTableWidget, QTableWidgetItem,
    QHeaderView, QDateEdit, QDialog
)
from PyQt5.QtWebEngineWidgets import QWebEngineView

import firebase_admin
from firebase_admin import credentials, firestore

# Read Firestore credentials path from environment variable
FIREBASE_CREDENTIALS = os.environ.get('FIREBASE_CREDENTIALS', 'firebase-key.json')
cred = credentials.Certificate(FIREBASE_CREDENTIALS)
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

def add_expense_firestore(date, category, amount, comment):
    db.collection('expenses').add({
        'date': date,
        'category': category,
        'amount': amount,
        'comment': comment
    })

def get_expenses_firestore():
    docs = db.collection('expenses').stream()
    data = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        data.append(d)
    return data

def update_expense_firestore(doc_id, date, category, amount, comment):
    db.collection('expenses').document(doc_id).update({
        'date': date,
        'category': category,
        'amount': amount,
        'comment': comment
    })

def delete_expense_firestore(doc_id):
    db.collection('expenses').document(doc_id).delete()


needs_categories = [
    "Rent or mortgage", "Utilities (electricity, water, gas)",
    "Self Upskilling",
    "Transportation (car payments, gas, public transit)",
    "Insurance (health, car, home)", "Groceries (basic, not luxury food)",
    "Debt payments", "Childcare or essential education costs",
    "Phone and internet bills (basic plans)", "Medicines", "Investment (NPS, Equity, Debth, ETF, Stocks)"
]

wants_categories = [
    "Dining out", "Streaming services (Netflix, Spotify)",
    "Shopping (clothes, gadgets beyond the basics)",
    "Hobbies and entertainment (movies, concerts, sports)",
    "Vacations and travel", "Gym memberships",
    "Upgraded phone/internet/cable plans", "Coffee shop runs", "Miscellaneous", "Membership"
]

all_categories = sorted(needs_categories + wants_categories)


class ExpenseTracker(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Expense Tracker")
        self.dashboard = None  # Track dashboard window
        self.history = None    # Track history window
        self.setup_ui()

    def setup_ui(self):
        self.date_label = QLabel("Select Date:")
        self.date_edit = QDateEdit(QDate.currentDate())
        self.date_edit.setCalendarPopup(True)
        self.date_edit.setDisplayFormat("yyyy-MM-dd")

        self.category_label = QLabel("Select Category:")
        self.category_combo = QComboBox()
        self.category_combo.addItems(all_categories)

        self.amount_label = QLabel("Enter Amount (₹):")
        self.amount_edit = QLineEdit()
        self.amount_edit.setPlaceholderText("e.g., 50.75")

        self.comment_label = QLabel("Comment (Optional):")
        self.comment_edit = QLineEdit()
        self.comment_edit.setPlaceholderText("e.g., Lunch with colleagues")

        self.add_button = QPushButton("Add Expense")
        self.add_button.clicked.connect(self.add_expense)

        self.dashboard_button = QPushButton("Open Dashboard")
        self.dashboard_button.clicked.connect(self.open_dashboard)

        self.history_button = QPushButton("View History")
        self.history_button.clicked.connect(self.open_history)

        main_layout = QVBoxLayout()

        date_layout = QHBoxLayout()
        date_layout.addWidget(self.date_label)
        date_layout.addWidget(self.date_edit)

        cat_layout = QHBoxLayout()
        cat_layout.addWidget(self.category_label)
        cat_layout.addWidget(self.category_combo)

        amt_layout = QHBoxLayout()
        amt_layout.addWidget(self.amount_label)
        amt_layout.addWidget(self.amount_edit)

        comm_layout = QHBoxLayout()
        comm_layout.addWidget(self.comment_label)
        comm_layout.addWidget(self.comment_edit)

        btn_layout = QHBoxLayout()
        btn_layout.addWidget(self.add_button)
        btn_layout.addWidget(self.dashboard_button)
        btn_layout.addWidget(self.history_button)

        main_layout.addLayout(date_layout) # Added date layout
        main_layout.addLayout(cat_layout)
        main_layout.addLayout(amt_layout)
        main_layout.addLayout(comm_layout)
        main_layout.addLayout(btn_layout)
        self.setLayout(main_layout)

    def add_expense(self):
        selected_date = self.date_edit.date().toString("yyyy-MM-dd")
        cat = self.category_combo.currentText()
        amt_text = self.amount_edit.text()
        comment = self.comment_edit.text()

        if not amt_text:
            QMessageBox.warning(self, "Input Error", "Amount cannot be empty.")
            return

        try:
            amt = float(amt_text)
            if amt <= 0:
                QMessageBox.warning(self, "Input Error", "Amount must be a positive number.")
                return
        except ValueError:
            QMessageBox.critical(self, "Invalid Input", "Please enter a valid numerical amount.")
            return

        try:
            add_expense_firestore(selected_date, cat, amt, comment if comment else "N/A")
            QMessageBox.information(self, "Success", f"Expense added:\nDate: {selected_date}\nCategory: {cat}\nAmount: ₹{amt:.2f}")
            self.amount_edit.clear()
            self.comment_edit.clear()
            self.category_combo.setCurrentIndex(0) # Reset category to the first item
            self.date_edit.setDate(QDate.currentDate()) # Reset date to current
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to add expense to Firestore:\n{e}")

    def open_dashboard(self):
        try:
            if self.dashboard is None or not self.dashboard.isVisible():
                self.dashboard = ExpenseDashboard()
                self.dashboard.show()
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load dashboard:\n{e}")

    def open_history(self):
        try:
            if self.history is None or not self.history.isVisible():
                self.history = ExpenseHistory()
                self.history.show()
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load history:\n{e}")

    def closeEvent(self, event):
        # Close dashboard if open
        if self.dashboard and self.dashboard.isVisible():
            self.dashboard.close()
        
        # Close history if open
        if self.history and self.history.isVisible():
            self.history.close()
        
        # Accept the close event
        event.accept()


class ExpenseDashboard(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Expense Dashboard")
        self.setMinimumSize(1200, 800)
        self.temp_html_file = None # To store the path of the temporary HTML file
        self.setup_ui()

    def setup_ui(self):
        self.category_filter = QComboBox()
        self.category_filter.addItem("All Categories")
        self.category_filter.addItems(all_categories)

        self.time_filter = QComboBox()
        self.time_filter.addItems(["This Month", "This Week", "Last Week", "Last Month", "Last 3 Months", "Last 6 Months", "This Year", "All Time"])
        self.time_filter.setCurrentText("This Month")  # Set default selection

        self.refresh_button = QPushButton("Refresh Dashboard")
        self.refresh_button.clicked.connect(self.refresh_chart)

        self.category_filter.currentTextChanged.connect(self.refresh_chart)
        self.time_filter.currentTextChanged.connect(self.refresh_chart)

        filter_layout = QHBoxLayout()
        filter_layout.addWidget(QLabel("Category:"))
        filter_layout.addWidget(self.category_filter)
        filter_layout.addWidget(QLabel("Time Period:"))
        filter_layout.addWidget(self.time_filter)
        filter_layout.addWidget(self.refresh_button)
        filter_layout.addStretch()

        self.web_view = QWebEngineView()

        main_layout = QVBoxLayout()
        main_layout.addLayout(filter_layout)

        divider = QFrame()
        divider.setFrameShape(QFrame.HLine)
        divider.setFrameShadow(QFrame.Sunken)
        main_layout.addWidget(divider)

        main_layout.addWidget(self.web_view)
        self.setLayout(main_layout)

        self.refresh_chart()

    def get_filtered_data(self):
        try:
            # Fetch all expenses from Firestore
            data = get_expenses_firestore()
            if not data:
                return pd.DataFrame(columns=["Date", "Category", "Amount", "Comment", "Period", "PeriodStr"])

            df = pd.DataFrame(data)
            df["Date"] = pd.to_datetime(df["date"], format='mixed')
            df = df.sort_values(by="Date", ascending=True) # Ensure data is sorted for time series

            cat_filter = self.category_filter.currentText()
            time_filter_text = self.time_filter.currentText()
            now = pd.Timestamp.now()

            if cat_filter != "All Categories":
                df = df[df["category"] == cat_filter].copy()

            # Time filtering logic (same as before, but use df["Date"])
            if time_filter_text == "This Week":
                start_of_week = now - pd.Timedelta(days=now.dayofweek)
                end_of_week = start_of_week + pd.Timedelta(days=6)
                df = df[(df["Date"] >= start_of_week.normalize()) & (df["Date"] <= end_of_week.normalize())].copy()
                df.loc[:, "Period"] = df["Date"].dt.to_period("D").dt.start_time
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m-%d (%a)")
            elif time_filter_text == "This Month":
                start_of_month = now.replace(day=1)
                df = df[(df["Date"] >= start_of_month.normalize()) & (df["Date"] <= now.normalize())].copy()
                df.loc[:, "Period"] = df["Date"].dt.to_period("D").dt.start_time
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m-%d")
            elif time_filter_text == "Last Week":
                start_of_week = now - pd.Timedelta(days=now.dayofweek + 7)
                end_of_week = start_of_week + pd.Timedelta(days=6)
                df = df[(df["Date"] >= start_of_week.normalize()) & (df["Date"] <= end_of_week.normalize())].copy()
                df.loc[:, "Period"] = df["Date"].dt.to_period("D").dt.start_time
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m-%d (%a)")
            elif time_filter_text == "Last Month":
                last_month_end = now.replace(day=1) - pd.Timedelta(days=1)
                last_month_start = last_month_end.replace(day=1)
                df = df[(df["Date"] >= last_month_start.normalize()) & (df["Date"] <= last_month_end.normalize())].copy()
                df.loc[:, "Period"] = df["Date"].dt.to_period("D").dt.start_time
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m-%d")
            elif time_filter_text == "Last 3 Months":
                start_date = now - pd.Timedelta(days=90)
                df = df[(df["Date"] >= start_date.normalize()) & (df["Date"] <= now.normalize())].copy()
                df.loc[:, "Period"] = df["Date"].dt.to_period("M").dt.start_time
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m")
            elif time_filter_text == "Last 6 Months":
                start_date = now - pd.Timedelta(days=180)
                df = df[(df["Date"] >= start_date.normalize()) & (df["Date"] <= now.normalize())].copy()
                df.loc[:, "Period"] = df["Date"].dt.to_period("M").dt.start_time
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m")
            elif time_filter_text == "This Year":
                start_of_year = now.replace(month=1, day=1)
                df = df[(df["Date"] >= start_of_year.normalize()) & (df["Date"] <= now.normalize())].copy()
                df.loc[:, "Period"] = df["Date"].dt.to_period("M").dt.start_time
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m")
            else: # All Time
                df.loc[:, "Period"] = df["Date"].dt.to_period("M").dt.start_time # Default to monthly for "All Time" line chart
                df.loc[:, "PeriodStr"] = df["Period"].dt.strftime("%Y-%m")

            if df.empty: # Handle cases where filtering results in no data
                 return pd.DataFrame(columns=["Date", "Category", "Amount", "Comment", "Period", "PeriodStr"])

            # Rename columns to match rest of code
            df = df.rename(columns={"category": "Category", "amount": "Amount", "comment": "Comment"})
            return df

        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to read or filter data from Firestore:\n{e}")
            return pd.DataFrame(columns=["Date", "Category", "Amount", "Comment", "Period", "PeriodStr"])


    def refresh_chart(self):
        df = self.get_filtered_data()

        if df.empty:
            self.web_view.setHtml("<html><body><h2 style='text-align:center; margin-top: 50px;'>No data available for the selected filters.</h2></body></html>")
            return

        try:
            # 1. Pie Chart: Expenses by Category
            pie_fig = px.pie(df, names="Category", values="Amount", title="<b>Expenses by Category</b>",
                             color_discrete_sequence=px.colors.sequential.RdBu)
            pie_fig.update_layout(title_x=0.5)


            # 2. Bar Chart: Category Breakdown (sorted)
            category_sum = df.groupby("Category")["Amount"].sum().reset_index().sort_values("Amount", ascending=False)
            bar_fig = px.bar(category_sum,
                             x="Amount", y="Category", orientation="h",
                             title="<b>Category Breakdown (Total Spending)</b>", color="Category",
                             labels={"Amount": "Total Amount (₹)", "Category": "Expense Category"},
                             text_auto=True)
            bar_fig.update_layout(yaxis={'categoryorder':'total ascending'}, title_x=0.5)
            bar_fig.update_traces(texttemplate='%{x:,.2f} ₹', textposition='outside')


            # 3. Line Chart: Spending Over Time
            # Ensure PeriodStr is sorted correctly if it represents dates/weeks for the line chart
            if "PeriodStr" in df.columns and not df.empty:
                 # Group by the already determined 'PeriodStr' which is formatted based on time_filter
                line_data = df.groupby("PeriodStr")["Amount"].sum().reset_index()
                # If PeriodStr are dates or weekly, ensure they are sorted chronologically
                # This might need adjustment if PeriodStr format isn't directly sortable as string.
                # For simplicity, if Period involves dates, sorting by Period (timestamp) before creating PeriodStr is better.
                # The get_filtered_data already sorts by Date initially.
                # If PeriodStr contains day names or non-standard date strings, direct string sort might be wrong.
                # However, the current PeriodStr formats (YYYY-MM-DD, YYYY-MM, YYYY-MM-DD (Mon)) should sort okay as strings for plotly.
                line_data = line_data.sort_values("PeriodStr")


                line_fig_title = f"<b>Spending Over Time ({self.time_filter.currentText()})</b>"
                if self.category_filter.currentText() != "All Categories":
                    line_fig_title += f" - {self.category_filter.currentText()}"

                line_fig = px.line(line_data,
                                   x="PeriodStr", y="Amount", markers=True,
                                   title=line_fig_title,
                                   labels={"PeriodStr": "Period", "Amount": "Total Amount (₹)"})
                line_fig.update_layout(xaxis_title="Time Period", yaxis_title="Amount (₹)", title_x=0.5)
                line_fig.update_traces(mode="lines+markers+text", texttemplate='%{y:,.0f}', textposition="top center")
            else:
                 line_fig = go.Figure().update_layout(title="<b>Spending Over Time (No Data)</b>", title_x=0.5)


            # Create HTML dashboard
            total_expenses = df['Amount'].sum()
            summary_html = f"<h3 style='text-align:center;'>Total Expenses for Period: ₹{total_expenses:,.2f}</h3>"
            divider_html = "<hr style='margin:30px 0; border-top: 1px solid #ccc;'>"

            html_content = f"<html><head><title>Expense Dashboard</title></head><body>"
            html_content += summary_html
            html_content += pie_fig.to_html(full_html=False, include_plotlyjs=True) # Embed JS directly
            html_content += divider_html
            html_content += bar_fig.to_html(full_html=False, include_plotlyjs=False)
            html_content += divider_html
            html_content += line_fig.to_html(full_html=False, include_plotlyjs=False)
            html_content += "</body></html>"


            # Clean up previous temporary file if it exists
            if self.temp_html_file and os.path.exists(self.temp_html_file):
                try:
                    os.remove(self.temp_html_file)
                except OSError as e:
                    print(f"Error removing old temp file: {e}")


            with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".html", encoding="utf-8") as f:
                f.write(html_content)
                self.temp_html_file = f.name # Store the path

            self.web_view.load(QUrl.fromLocalFile(self.temp_html_file))

        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to generate charts:\n{e}")
            self.web_view.setHtml(f"<html><body><h2>Error generating charts:</h2><pre>{e}</pre></body></html>")

    def closeEvent(self, event):
        # Clean up the temporary HTML file when the dashboard window is closed
        if self.temp_html_file and os.path.exists(self.temp_html_file):
            try:
                os.remove(self.temp_html_file)
                print(f"Temporary file {self.temp_html_file} deleted.")
            except OSError as e:
                print(f"Error deleting temporary file {self.temp_html_file}: {e}")
        super().closeEvent(event)


class ExpenseHistory(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Expense History & Management")
        self.setMinimumSize(900, 700) # Increased size for better usability
        self.df_history = pd.DataFrame() # Initialize to avoid attribute error
        self.current_page = 1
        self.page_size = 25
        self.setup_ui()
        self.load_data() # Load data initially

    def setup_ui(self):
        # --- Top Filter Layout ---
        filter_layout = QHBoxLayout()
        self.date_filter_label = QLabel("Time Period:")
        self.date_filter_combo = QComboBox()
        self.date_filter_combo.addItems(["This Month", "This Week", "Last Week", "Last Month", "Last 3 Months", "Last 6 Months", "This Year", "All Time"])
        self.date_filter_combo.setCurrentText("This Month")  # Set default to "This Month"
        self.date_filter_combo.currentTextChanged.connect(self.filter_data_changed)

        self.category_filter_label = QLabel("Category:")
        self.category_filter_combo = QComboBox()
        self.category_filter_combo.addItem("All Categories")
        self.category_filter_combo.addItems(all_categories) # Make sure all_categories is accessible
        self.category_filter_combo.currentTextChanged.connect(self.filter_data_changed)

        self.refresh_button = QPushButton("Refresh List")
        self.refresh_button.clicked.connect(self.load_data)

        filter_layout.addWidget(self.date_filter_label)
        filter_layout.addWidget(self.date_filter_combo)
        filter_layout.addWidget(self.category_filter_label)
        filter_layout.addWidget(self.category_filter_combo)
        filter_layout.addStretch()
        filter_layout.addWidget(self.refresh_button)

        # --- Table ---
        self.table = QTableWidget()
        self.table.setColumnCount(6) # Date, Category, Amount, Comment, Edit, Delete
        self.table.setHorizontalHeaderLabels(["Date", "Category", "Amount (₹)", "Comment", "Edit", "Delete"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents) # Amount
        self.table.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeToContents) # Edit
        self.table.horizontalHeader().setSectionResizeMode(5, QHeaderView.ResizeToContents) # Delete
        self.table.setEditTriggers(QTableWidget.NoEditTriggers) # Make table read-only by default
        self.table.setSelectionBehavior(QTableWidget.SelectRows)


        # --- Pagination Layout ---
        pagination_layout = QHBoxLayout()
        self.page_size_label = QLabel("Items per page:")
        self.page_size_combo = QComboBox()
        self.page_size_combo.addItems(["10", "25", "50", "100"])
        self.page_size_combo.setCurrentText(str(self.page_size))
        self.page_size_combo.currentTextChanged.connect(self.change_page_size)

        self.prev_button = QPushButton("<< Previous")
        self.prev_button.clicked.connect(self.prev_page)
        self.page_label = QLabel("Page 1 / 1") # Placeholder
        self.next_button = QPushButton("Next >>")
        self.next_button.clicked.connect(self.next_page)

        pagination_layout.addWidget(self.page_size_label)
        pagination_layout.addWidget(self.page_size_combo)
        pagination_layout.addStretch()
        pagination_layout.addWidget(self.prev_button)
        pagination_layout.addWidget(self.page_label)
        pagination_layout.addWidget(self.next_button)

        # --- Totals Display ---
        self.totals_label = QLabel("Total Expenses for displayed items: ₹0.00")
        font = self.totals_label.font()
        font.setBold(True)
        self.totals_label.setFont(font)

        # --- Main Layout ---
        main_layout = QVBoxLayout()
        main_layout.addLayout(filter_layout)
        main_layout.addWidget(self.table)
        main_layout.addWidget(self.totals_label, alignment=Qt.AlignRight)
        main_layout.addLayout(pagination_layout)
        self.setLayout(main_layout)

    def filter_data_changed(self):
        self.current_page = 1 # Reset to first page on filter change
        self.load_data()


    def load_data(self):
        try:
            # Fetch all expenses from Firestore
            data = get_expenses_firestore()
            if not data:
                self.df_history = pd.DataFrame(columns=["Date", "Category", "Amount", "Comment", "id"])
                self.display_page() # Display empty table
                return

            df = pd.DataFrame(data)
            df["Date"] = pd.to_datetime(df["date"], format='mixed')

            # Apply date filter
            date_filter_text = self.date_filter_combo.currentText()
            now = pd.Timestamp.now()
            if date_filter_text == "This Week":
                start_of_week = now - pd.Timedelta(days=now.dayofweek)
                end_of_week = start_of_week + pd.Timedelta(days=6)
                df = df[(df["Date"] >= start_of_week.normalize()) & (df["Date"] <= end_of_week.normalize())]
            elif date_filter_text == "This Month":
                df = df[(df["Date"].dt.year == now.year) & (df["Date"].dt.month == now.month)]
            elif date_filter_text == "Last Week":
                start_of_week = now - pd.Timedelta(days=now.dayofweek + 7)
                end_of_week = start_of_week + pd.Timedelta(days=6)
                df = df[(df["Date"] >= start_of_week.normalize()) & (df["Date"] <= end_of_week.normalize())]
            elif date_filter_text == "Last Month":
                last_month_end = now.replace(day=1) - pd.Timedelta(days=1)
                last_month_start = last_month_end.replace(day=1)
                df = df[(df["Date"] >= last_month_start) & (df["Date"] <= last_month_end)]
            elif date_filter_text == "Last 3 Months":
                start_date = now - pd.Timedelta(days=90)
                df = df[df["Date"] >= start_date.normalize()]
            elif date_filter_text == "Last 6 Months":
                start_date = now - pd.Timedelta(days=180)
                df = df[df["Date"] >= start_date.normalize()]
            elif date_filter_text == "This Year":
                df = df[df["Date"].dt.year == now.year]
            # "All Time" - no date filtering

            # Apply category filter
            cat_filter_text = self.category_filter_combo.currentText()
            if cat_filter_text != "All Categories":
                df = df[df["category"] == cat_filter_text]

            # Sort by Date descending
            df = df.sort_values(by="Date", ascending=False)
            self.df_history = df.rename(columns={"category": "Category", "amount": "Amount", "comment": "Comment"})
            self.display_page()

        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load history from Firestore:\n{e}")
            self.df_history = pd.DataFrame(columns=["Date", "Category", "Amount", "Comment", "id"])
            self.display_page()


    def edit_expense(self, doc_id, date, category, amount, comment):
        dialog = EditExpenseDialog(self, date, category, amount, comment)
        if dialog.exec_() == QDialog.Accepted:
            new_date, new_category, new_amount, new_comment = dialog.get_expense_data()
            try:
                update_expense_firestore(doc_id, new_date, new_category, new_amount, new_comment)
                QMessageBox.information(self, "Success", "Expense updated successfully.")
                self.load_data()  # Refresh the view
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to update expense in Firestore:\n{e}")

    def delete_expense_from_excel(self, doc_id):
        reply = QMessageBox.question(self, 'Confirm Delete',
                                     "Are you sure you want to delete this expense record permanently?",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)

        if reply == QMessageBox.Yes:
            try:
                delete_expense_firestore(doc_id)
                QMessageBox.information(self, "Success", "Expense record deleted successfully.")
                self.load_data() # Refresh the view
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to delete expense from Firestore:\n{e}")


    def change_page_size(self):
        self.page_size = int(self.page_size_combo.currentText())
        self.current_page = 1 # Reset to first page
        self.display_page()

    def next_page(self):
        total_items = len(self.df_history)
        total_pages = (total_items + self.page_size - 1) // self.page_size if total_items > 0 else 1
        if self.current_page < total_pages:
            self.current_page += 1
            self.display_page()

    def prev_page(self):
        if self.current_page > 1:
            self.current_page -= 1
            self.display_page()

    # Restore display_page method if missing
    def display_page(self):
        if self.df_history.empty:
            self.table.setRowCount(0)
            self.totals_label.setText("Total Expenses for displayed items: ₹0.00")
            self.page_label.setText("Page 0 / 0")
            self.prev_button.setEnabled(False)
            self.next_button.setEnabled(False)
            return

        start_index = (self.current_page - 1) * self.page_size
        end_index = start_index + self.page_size
        page_df = self.df_history.iloc[start_index:end_index]
        page_df = page_df.reset_index(drop=True)

        self.table.setRowCount(len(page_df))
        current_page_total = 0.0

        for i, row_data in page_df.iterrows():
            doc_id = row_data['id']

            self.table.setItem(i, 0, QTableWidgetItem(row_data["Date"].strftime("%Y-%m-%d")))
            self.table.setItem(i, 1, QTableWidgetItem(str(row_data["Category"])))
            amount_item = QTableWidgetItem(f"{row_data['Amount']:.2f}")
            amount_item.setTextAlignment(Qt.AlignRight | Qt.AlignVCenter)
            self.table.setItem(i, 2, amount_item)
            self.table.setItem(i, 3, QTableWidgetItem(str(row_data.get("Comment", ""))))
            current_page_total += row_data['Amount']

            # --- Edit Button ---
            edit_btn = QPushButton("Edit")
            edit_btn.setStyleSheet("color: blue;")
            edit_btn.clicked.connect(lambda _, did=doc_id, 
                                   date=row_data["Date"], 
                                   cat=row_data["Category"], 
                                   amt=row_data["Amount"], 
                                   comm=row_data.get("Comment", ""): 
                                   self.edit_expense(did, date, cat, amt, comm))
            self.table.setCellWidget(i, 4, edit_btn)

            # --- Delete Button ---
            delete_btn = QPushButton("Delete")
            delete_btn.setStyleSheet("color: red;")
            delete_btn.clicked.connect(lambda _, did=doc_id: self.delete_expense_from_excel(did))
            self.table.setCellWidget(i, 5, delete_btn)

        self.totals_label.setText(f"Total Expenses for displayed items: ₹{current_page_total:,.2f}")

        total_items = len(self.df_history)
        total_pages = (total_items + self.page_size - 1) // self.page_size if total_items > 0 else 1
        self.page_label.setText(f"Page {self.current_page} / {total_pages}")
        self.prev_button.setEnabled(self.current_page > 1)
        self.next_button.setEnabled(self.current_page < total_pages)


class EditExpenseDialog(QDialog):
    def __init__(self, parent=None, date=None, category=None, amount=None, comment=None):
        super().__init__(parent)
        self.setWindowTitle("Edit Expense")
        self.setup_ui(date, category, amount, comment)

    def setup_ui(self, date, category, amount, comment):
        layout = QVBoxLayout()

        # Date
        date_layout = QHBoxLayout()
        date_label = QLabel("Date:")
        self.date_edit = QDateEdit(date)
        self.date_edit.setCalendarPopup(True)
        self.date_edit.setDisplayFormat("yyyy-MM-dd")
        date_layout.addWidget(date_label)
        date_layout.addWidget(self.date_edit)

        # Category
        category_layout = QHBoxLayout()
        category_label = QLabel("Category:")
        self.category_combo = QComboBox()
        self.category_combo.addItems(all_categories)
        self.category_combo.setCurrentText(category)
        category_layout.addWidget(category_label)
        category_layout.addWidget(self.category_combo)

        # Amount
        amount_layout = QHBoxLayout()
        amount_label = QLabel("Amount (₹):")
        self.amount_edit = QLineEdit()
        self.amount_edit.setText(str(amount))
        amount_layout.addWidget(amount_label)
        amount_layout.addWidget(self.amount_edit)

        # Comment
        comment_layout = QHBoxLayout()
        comment_label = QLabel("Comment:")
        self.comment_edit = QLineEdit()
        self.comment_edit.setText(comment)
        comment_layout.addWidget(comment_label)
        comment_layout.addWidget(self.comment_edit)

        # Buttons
        button_layout = QHBoxLayout()
        save_button = QPushButton("Save")
        save_button.clicked.connect(self.accept)
        cancel_button = QPushButton("Cancel")
        cancel_button.clicked.connect(self.reject)
        button_layout.addWidget(save_button)
        button_layout.addWidget(cancel_button)

        # Add all layouts to main layout
        layout.addLayout(date_layout)
        layout.addLayout(category_layout)
        layout.addLayout(amount_layout)
        layout.addLayout(comment_layout)
        layout.addLayout(button_layout)

        self.setLayout(layout)

    def get_expense_data(self):
        try:
            amount = float(self.amount_edit.text())
            if amount <= 0:
                raise ValueError("Amount must be positive")
            return (
                self.date_edit.date().toString("yyyy-MM-dd"),
                self.category_combo.currentText(),
                amount,
                self.comment_edit.text()
            )
        except ValueError as e:
            QMessageBox.critical(self, "Error", f"Invalid amount: {str(e)}")
            return None


if __name__ == "__main__":
    app = QApplication(sys.argv)
    # Apply a style (Optional)
    # app.setStyle("Fusion") # Example: "Fusion", "Windows", "Motif", "WindowsVista"
    tracker = ExpenseTracker()
    tracker.show()
    sys.exit(app.exec_())