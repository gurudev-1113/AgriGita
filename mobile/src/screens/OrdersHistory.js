import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const OrdersHistoryScreen = () => {
  const { colors } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://192.168.156.220:5000/api/orders/history', {
          headers: { 'Authorization': 'Bearer placeholder' }
        });
        setOrders(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const styles = createStyles(colors);

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.row}>
        <Text style={styles.productName}>{item.product}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.orderId}>ID: {item.id.substring(0, 8)}</Text>
      
      <View style={styles.detailsRow}>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.gps}>📍 {item.location.lat.toFixed(3)}, {item.location.lng.toFixed(3)}</Text>
      </View>
      <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dispatch History</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No treatment orders found. Scan a crop to start!</Text>
          }
        />
      )}
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 40, marginBottom: 20 },
  orderCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: '700', color: colors.text },
  statusBadge: { backgroundColor: colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
  orderId: { fontSize: 10, color: colors.textSecondary, marginTop: 4 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
  price: { fontSize: 18, fontWeight: '800', color: colors.primary },
  gps: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  time: { fontSize: 11, color: colors.textSecondary, marginTop: 8 },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 50 },
});

export default OrdersHistoryScreen;
