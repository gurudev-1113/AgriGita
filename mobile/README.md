# Running AgriGita Mobile (Expo)

This mobile app is built with **React Native** and **Expo**. It is designed to work seamlessly with your existing AgriGita backend.

## Prerequisites
1.  **Node.js**: Installed on your computer.
2.  **Expo Go**: Download the "Expo Go" app from the Play Store (Android) or App Store (iOS) on your mobile phone.
3.  **Local Network**: Ensure your computer and your phone are connected to the **same Wi-Fi network**.

## Setup Instructions

1.  **Open a terminal** in the `mobile/` directory:
    ```bash
    cd mobile
    ```

2.  **Install Dependencies**:
    *Note: If you are behind a restricted network, you may need to use a mobile hotspot or a standard internet connection for this step.*
    ```bash
    npm install
    # and install specific libraries used in the code:
    npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-safe-area-context react-native-screens axios
    ```

3.  **Start the Mobile Server**:
    ```bash
    npx expo start
    ```

## Scanning and Playing
1.  Once the command runs, you will see a large **QR Code** in your terminal.
2.  **Android**: Open the "Expo Go" app and tap "Scan QR Code".
3.  **iPhone**: Open your Phone Camera and point it at the QR code.
4.  The app will build and load the **AgriGita Success Animation** followed by your Dashboard!

## Troubleshooting
- **Cannot connect to backend?**
  Double check that the `BASE_URL` in `mobile/src/api/services.js` matches your computer's current IP address (currently set to `192.168.156.220`).
- **Network Errors?**
  Ensure your computer's firewall allows traffic on Port 5000 (Backend) and Port 19000/8081 (Expo).
