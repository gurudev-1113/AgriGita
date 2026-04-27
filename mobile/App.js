import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';

import DashboardScreen from './src/screens/Dashboard';
import ValvesScreen from './src/screens/Valves';
import AIScreen from './src/screens/AI';
import LoginSuccess from './src/screens/LoginSuccess';
import PlantCareScreen from './src/screens/PlantCare';
import OrdersHistoryScreen from './src/screens/OrdersHistory';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0 },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
    }}>
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: t('dashboard') }} />
      <Tab.Screen name="Valves" component={ValvesScreen} options={{ tabBarLabel: t('valves') }} />
      <Tab.Screen name="PlantCare" component={PlantCareScreen} options={{ tabBarLabel: t('plant_health') }} />
      <Tab.Screen name="AI" component={AIScreen} options={{ tabBarLabel: t('ai_suggestions') }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LoginSuccess">
        <Stack.Screen name="LoginSuccess" component={LoginSuccess} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
