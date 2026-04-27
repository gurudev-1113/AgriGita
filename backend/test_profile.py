import requests
import json

app_url = 'http://127.0.0.1:5000'
auth_url = f'{app_url}/api/auth/login'

res = requests.post(auth_url, json={'username': 'farmer', 'password': 'password'})
if res.status_code != 200:
    print('Login failed:', res.json())
else:
    token = res.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    data = {'land_details': 'Test from python script'}
    
    put_res = requests.put(f'{app_url}/api/auth/profile', headers=headers, json=data)
    print('PUT STATUS:', put_res.status_code)
    print('PUT RESPONSE:', put_res.json())
