import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/theme';

export default function ServerConfigScreen() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('8080');
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const savedIp = await AsyncStorage.getItem('server_ip');
      const savedPort = await AsyncStorage.getItem('server_port');

      if (savedIp) setIp(savedIp);
      if (savedPort) setPort(savedPort);

      const token = await AsyncStorage.getItem('user_token');

      if (token && savedIp) {
        console.log('Token trouvé, connexion automatique...');
        router.replace('/(tabs)');
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  const handleSave = async () => {
    if (!ip || !port) return;
    await AsyncStorage.setItem('server_ip', ip.trim());
    await AsyncStorage.setItem('server_port', port.trim());
    router.replace('/(auth)/login');
  };

  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.link} />
        <Text style={{ marginTop: 20, color: COLORS.h1, fontFamily: 'Inter_600SemiBold' }}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.h1}>AREA</Text>
            <Text style={styles.subtitle}>Configuration Serveur</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse IP / Domaine</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 192.168.1.15 ou mon-ngrok.app"
                placeholderTextColor="#9CA3AF"
                value={ip}
                onChangeText={setIp}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Port (Optionnel si Ngrok)</Text>
              <TextInput
                style={styles.input}
                placeholder="8080"
                placeholderTextColor="#9CA3AF"
                value={port}
                onChangeText={setPort}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Connexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: COLORS.h1,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: COLORS.h2,
    marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.h1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(71, 73, 115, 0.1)',
  },
  button: {
    backgroundColor: COLORS.link,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.link,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
