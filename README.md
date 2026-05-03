# AgriGita 🌱 - Smart Water Management System

AgriGita is a professional, full-stack smart agriculture platform designed to optimize water usage and farm infrastructure management. It leverages IoT simulation, real-time data visualization, and AI-driven insights to help farmers monitor and control their fields efficiently.

## 🚀 Key Features

- **Real-time Monitoring**: Live dashboard tracking water usage, soil moisture, and infrastructure status.
- **Infrastructure Management**: Visual tools to manage and monitor Wells, Valves, and Pipelines.
- **AI-Powered Assistant**: A real-time chatbot to assist with diagnostics, system status, and farming advice.
- **Disease Detection**: Integrated AI model for identifying crop diseases from uploaded images.
- **Alert System**: Immediate notifications for mechanical failures or critical system alerts via WebSocket and simulated email.
- **IoT Simulation**: Built-in simulator for real-time sensor data and valve feedback.
- **Market Integration**: Integrated order system for agricultural products and hardware.

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS (Modern, Responsive Design)
- **Maps**: Leaflet / React-Leaflet
- **Data Visualization**: Recharts
- **Communication**: Socket.io-client, Axios

### Backend
- **Framework**: Flask (Python)
- **Real-time**: Flask-SocketIO (with Eventlet)
- **Database**: SQLite (SQLAlchemy ORM)
- **Security**: JWT Authentication, Bcrypt hashing
- **Integration**: IoT Simulator, AI Chatbot

### Mobile
- **Framework**: React Native (Expo)

---

## 🏗 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python app.py
```
*The backend will run on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000` (or `http://localhost:5173`)*

### 3. Mobile App (Optional)
```bash
cd mobile
npm install
npx expo start
```

---

## 📂 Project Structure

```text
├── backend/            # Flask API, Database, and AI services
├── frontend/           # React dashboard and user interface
├── mobile/             # React Native (Expo) mobile application
├── docker-compose.yml  # Containerization config
└── README.md           # Project documentation
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Developed with ❤️ for the Agriculture Community.*
# AgriGita
