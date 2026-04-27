import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { dashboardAPI } from '../api/services';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    { label: 'Valves', value: stats?.total_valves || 0, icon: '🔧', color: '#3b82f6' },
    { label: 'Active', value: stats?.active_valves || 0, icon: '✅', color: '#22c55e' },
    { label: 'Wells', value: stats?.total_wells || 0, icon: '💧', color: '#06b6d4' },
    { label: 'Usage', value: `${stats?.total_water_used || 0}L`, icon: '📊', color: '#a855f7' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AgriGita</Text>
        <Text style={styles.subtitle}>Karnataka Field Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((card, i) => (
          <View key={i} style={[styles.statCard, { borderLeftColor: card.color }]}>
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.weatherCard}>
        <Text style={styles.sectionTitle}>🌦️ Local Weather</Text>
        <View style={styles.weatherInfo}>
          <Text style={styles.temp}>28°C</Text>
          <View>
            <Text style={styles.weatherDesc}>Sunny</Text>
            <Text style={styles.weatherLocation}>Bangalore, Karnataka</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.aiButton}
        onPress={() => navigation.navigate('AI')}
      >
        <Text style={styles.aiButtonText}>🌱 Open AgriGita AI Assistant</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { marginBottom: 24, marginTop: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardIcon: { fontSize: 20, marginBottom: 8 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#f1f5f9' },
  cardLabel: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  weatherCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#f8fafc', marginBottom: 12 },
  weatherInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  temp: { fontSize: 32, fontWeight: '800', color: '#f1f5f9' },
  weatherDesc: { fontSize: 16, color: '#f1f5f9', fontWeight: '500' },
  weatherLocation: { fontSize: 12, color: '#94a3b8' },
  aiButton: {
    backgroundColor: '#166534',
    padding: 18,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  aiButtonText: { color: '#f0fdf4', fontWeight: '700', fontSize: 15 },
});

export default DashboardScreen;
