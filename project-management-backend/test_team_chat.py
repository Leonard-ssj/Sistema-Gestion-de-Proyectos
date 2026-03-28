import requests

BASE_URL = 'http://localhost:5000/api'

# Replace these later if needed
def login(email, password):
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json().get('access_token')
    return None

def test_chat():
    # Attempting to login using the test owner script setup (if it exists)
    # We'll just run this script from run_command to see if the syntax is valid for now
    print("Test script created.")

if __name__ == '__main__':
    test_chat()
