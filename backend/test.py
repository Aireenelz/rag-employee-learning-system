from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
mongodb_uri = os.getenv("MONGODB_URI")
if not mongodb_uri:
    raise ValueError("MONGODB_URI not found in .env file")

client = None  # Initialize client as None to avoid NameError in finally
try:
    client = MongoClient(mongodb_uri, tls=True, tlsAllowInvalidCertificates=True)  # Use TLS parameters
    db = client["els_db"]
    
    # Get current date and time
    current_time = datetime.now()
    formatted_time = current_time.strftime("%d/%m/%Y %I:%M %p")
    
    db.test.insert_one({"test": f"connection as of {formatted_time} Aireen"})
    result = db.test.find_one()
    print("Connection successful:", result)
    # Optional: Clean up test document
    # db.test.delete_one({"test": f"connection as of {formatted_time} Aireen"})
except Exception as e:
    print(f"Connection failed: {str(e)}")
finally:
    if client:
        client.close()  # Only close if client was successfully created