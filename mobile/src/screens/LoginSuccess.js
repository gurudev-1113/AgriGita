import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginSuccess = ({ navigation }) => {
  const stemHeight = useRef(new Animated.Value(0)).current;
  const leaf1Scale = useRef(new Animated.Value(0)).current;
  const leaf2Scale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequential Animation
    Animated.sequence([
      Animated.timing(stemHeight, { toValue: 120, duration: 800, useNativeDriver: false }),
      Animated.parallel([
        Animated.spring(leaf1Scale, { toValue: 1, friction: 3, useNativeDriver: true }),
        Animated.spring(leaf2Scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.animationArea}>
        {/* Ground */}
        <View style={styles.ground} />
        
        {/* Animated Stem */}
        <Animated.View style={[styles.stem, { height: stemHeight }]} />

        {/* Animated Leaves */}
        <Animated.View style={[styles.leaf, styles.leafLeft, { transform: [{ scale: leaf1Scale }, { rotate: '-30deg' }] }]} />
        <Animated.View style={[styles.leaf, styles.leafRight, { transform: [{ scale: leaf2Scale }, { rotate: '30deg' }] }]} />
      </View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.title}>AgriGita Success 🌾</Text>
        <Text style={styles.subtitle}>Mobile journey empowered by AI</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  animationArea: { height: 200, width: 200, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 40 },
  ground: { width: 100, height: 4, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 2 },
  stem: { width: 8, backgroundColor: '#166534', borderRadius: 4, position: 'absolute', bottom: 0 },
  leaf: { width: 40, height: 25, backgroundColor: '#22c55e', borderRadius: 20, position: 'absolute' },
  leafLeft: { bottom: 60, left: 60 },
  leafRight: { bottom: 90, right: 60 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 8 }
});

export default LoginSuccess;
