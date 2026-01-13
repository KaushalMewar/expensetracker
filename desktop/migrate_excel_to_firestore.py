import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firestore
cred = credentials.Certificate("")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

EXCEL_FILE = "expenses.xlsx"

# Read Excel data
try:
    df = pd.read_excel(EXCEL_FILE)
    print(f"Loaded {len(df)} expenses from {EXCEL_FILE}")
except Exception as e:
    print(f"Failed to read {EXCEL_FILE}: {e}")
    exit(1)

# Migrate each row to Firestore
count = 0
for _, row in df.iterrows():
    try:
        db.collection('expenses').add({
            'date': str(row['Date']),
            'category': row['Category'],
            'amount': float(row['Amount']),
            'comment': row.get('Comment', '')
        })
        count += 1
    except Exception as e:
        print(f"Failed to migrate row: {row.to_dict()}\nError: {e}")

print(f"Migration complete. {count} expenses added to Firestore.") 