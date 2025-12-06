#!/usr/bin/env python3
"""
Test script to verify all Vasundhara services are running correctly
"""

import requests
import time
import sys

def test_service(url, service_name, expected_status=200):
    """Test if a service is responding correctly"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == expected_status:
            print(f"OK {service_name}: OK (Status: {response.status_code})")
            return True
        else:
            print(f"FAILED {service_name}: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"ERROR {service_name}: ERROR - {e}")
        return False

def main():
    """Test all services"""
    print("Testing Vasundhara Services...")
    print("=" * 50)
    
    services = [
        ("http://localhost:3000", "Frontend (Next.js)"),
        ("http://localhost:5001/health", "API Service"),
        ("http://localhost:8000/health", "ML Service"),
    ]
    
    all_passed = True
    
    for url, name in services:
        if not test_service(url, name):
            all_passed = False
        time.sleep(1)  # Small delay between tests
    
    print("=" * 50)
    if all_passed:
        print("SUCCESS: All services are running correctly!")
        print("\nAccess your application:")
        print("   Frontend: http://localhost:3000")
        print("   API Docs: http://localhost:5001/api")
        print("   ML Docs:  http://localhost:8000/docs")
    else:
        print("WARNING: Some services are not responding correctly.")
        print("   Please check the service logs and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
