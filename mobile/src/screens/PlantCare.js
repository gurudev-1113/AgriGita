import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const PlantCareScreen = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { lang, t } = useLanguage();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResults(null); 
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    const cleanUri = Platform.OS === 'android' ? image : image.replace('file://', '');
    
    formData.append('image', {
      uri: cleanUri,
      name: 'scan.jpg',
      type: 'image/jpeg',
    });
    formData.append('lang', lang);

    try {
      console.log("DEBUG: Uploading to YOLOv8 Engine...");
      const response = await axios.post('http://192.168.156.220:5000/api/detection/analyze', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 20000 
      });
      setResults(response.data);
    } catch (error) {
      console.log("DEBUG ERROR:", error.message);
      Alert.alert("Analysis Failed", t('no_disease'));
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (product) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('gps_required'), 'Explanation...');
        return;
      }

      setLoading(true);
      let location = await Location.getCurrentPositionAsync({});
      
      const response = await axios.post('http://192.168.156.220:5000/api/orders/place', {
        product: product.product,
        price: product.price,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }, {
        headers: { 'Authorization': 'Bearer placeholder' }
      });

      if (response.data.success) {
        Alert.alert(t('confirm_order'), `${product.product}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Order Error", "Error...");
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('plant_health')}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.themeToggle} onPress={() => navigation.navigate('OrdersHistory')}>
            <Text style={styles.themeToggleText}>📦 {t('my_orders')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.scanCard}>
        <Text style={styles.sectionTitle}>📸 {t('plant_health')}</Text>
        <Text style={styles.subtitle}>{t('ai_suggestions')}</Text>
        
        <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <Text style={styles.placeholderText}>{t('run_diagnostic')}</Text>
          )}
        </TouchableOpacity>

        {image && !results && (
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.disabledButton]} 
            onPress={analyzeImage}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('run_diagnostic')}</Text>}
          </TouchableOpacity>
        )}
      </View>

      {results && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{t('plant_health')}</Text>
          {results.detections.length > 0 ? (
            results.detections.map((det, i) => (
              <View key={i} style={styles.detectionItem}>
                <View style={styles.detHeader}>
                  <Text style={styles.detClass}>{det.class.toUpperCase()}</Text>
                  <Text style={styles.detConf}>{(det.confidence * 100).toFixed(0)}% Match</Text>
                </View>
                <Text style={styles.detAdvice}>💡 {det.advice}</Text>
                
                {det.product && (
                  <View style={styles.orderSection}>
                    <Text style={styles.recommendLabel}>{t('buy_treatment')}:</Text>
                    <View style={styles.productRow}>
                       <Text style={styles.productName}>{det.product}</Text>
                       <Text style={styles.productPrice}>${det.price}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.orderBtn} 
                      onPress={() => handleOrder(det)}
                    >
                      <Text style={styles.orderBtnText}>🛒 {t('buy_treatment')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDisease}>{t('no_disease')} 🌱</Text>
          )}
          <TouchableOpacity style={styles.resetBtn} onPress={() => {setImage(null); setResults(null);}}>
            <Text style={styles.resetBtnText}>{t('run_diagnostic')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { marginTop: 40, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  themeToggle: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  themeToggleText: { fontSize: 12, color: colors.text, fontWeight: '600' },
  scanCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  imagePlaceholder: { height: 200, backgroundColor: colors.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderStyle: 'dashed', borderWidth: 2, borderColor: colors.border },
  previewImage: { width: '100%', height: '100%' },
  placeholderText: { color: colors.textSecondary, fontWeight: '500' },
  actionButton: { backgroundColor: colors.primary, marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabledButton: { opacity: 0.6 },
  resultCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 40, borderLeftWidth: 5, borderLeftColor: colors.accent },
  resultTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  detectionItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  detHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detClass: { fontSize: 16, fontWeight: '800', color: '#ef4444' },
  detConf: { fontSize: 12, color: colors.textSecondary },
  detAdvice: { fontSize: 14, color: colors.text, fontStyle: 'italic', marginTop: 4 },
  noDisease: { color: colors.primary, fontWeight: '600', textAlign: 'center' },
  orderSection: { marginTop: 12, padding: 12, backgroundColor: colors.background, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: colors.primary },
  recommendLabel: { fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  productName: { fontSize: 15, fontWeight: '700', color: colors.text },
  productPrice: { fontSize: 15, fontWeight: '800', color: colors.primary },
  orderBtn: { backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  resetBtn: { marginTop: 10, alignItems: 'center' },
  resetBtnText: { color: colors.accent, fontWeight: '700' },
});

export default PlantCareScreen;
