import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
cred = credentials.Certificate("./<*>.json")
firebase_admin.initialize_app(cred)

# Reference to Firestore
db = firestore.client()

def delete_collection(collection_name, batch_size=100):
    collection_ref = db.collection(collection_name)
    docs = collection_ref.limit(batch_size).stream()

    deleted = 0
    for doc in docs:
        print(f"Deleting document {doc.id}")
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        # Recursively delete next batch
        delete_collection(collection_name, batch_size)

# Replace with your collection name
delete_collection("<collection-name>")
