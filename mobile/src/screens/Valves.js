import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { valveAPI } from '../api/services';

const ValvesScreen = () => {
  const [valves, setValves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchValves = async () => {
    try {
      const res = await valveAPI.getAll();
      setValves(res.data.valves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValves();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      // Optimistic Update
      setValves(prev => prev.map(v => v.id === id ? { ...v, status: !currentStatus } : v));
      await valveAPI.toggle(id);
    } catch (err) {
      Alert.alert("Error", "Could not toggle valve.");
      // Rollback
      setValves(prev => prev.map(v => v.id === id ? { ...v, status: currentStatus } : v));
    }
  };

  const renderValve = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.valveName}>{item.name}</Text>
        <Text style={[styles.healthBadge, item.health === 'healthy' ? styles.healthy : styles.damaged]}>
          {item.health.toUpperCase()}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <View style={[styles.dot, item.status ? styles.dotOn : styles.dotOff]} />
          <Text style={styles.statusText}>{item.status ? 'Open' : 'Closed'}</Text>
        </View>
        <Switch
          trackColor={{ false: '#334155', true: '#14532d' }}
          thumbColor={item.status ? '#22c55e' : '#94a3b8'}
          onValueChange={() => handleToggle(item.id, item.status)}
          value={item.status}
        />
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>FLOW RATE</Text>
          <Text style={[styles.infoValue, item.status && styles.activeValue]}>
            {item.flow_rate} L/min
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>LOCATION</Text>
          <Text style={styles.infoValue}>{item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#22c55e" size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Valve Management</Text>
      <FlatList
        data={valves}
        renderItem={renderValve}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#f8fafc', marginTop: 40, marginBottom: 20 },
  centered: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  valveName: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  healthBadge: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  healthy: { backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  damaged: { backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 12 },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: '#22c55e' },
  dotOff: { backgroundColor: '#ef4444' },
  statusText: { color: '#f8fafc', fontWeight: '500' },
  infoGrid: { flexDirection: 'row', marginTop: 16, gap: 12 },
  infoBox: { flex: 1, backgroundColor: '#33415555', padding: 12, borderRadius: 8 },
  infoLabel: { fontSize: 10, color: '#94a3b8', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#cbd5e1' },
  activeValue: { color: '#06b6d4' }
});

export default ValvesScreen;
