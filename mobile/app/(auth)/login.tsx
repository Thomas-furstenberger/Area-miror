/*
 ** EPITECH PROJECT, 2025
 ** Area-miror
 ** File description:
 ** login
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { login } from '@/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showSettings, setShowSettings] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('8080');

  useEffect(() => {
    const loadNetworkSettings = async () => {
      const savedIp = await AsyncStorage.getItem('server_ip');
      const savedPort = await AsyncStorage.getItem('server_port');
      if (savedIp) setIpAddress(savedIp);
      if (savedPort) setPort(savedPort);
    };
    loadNetworkSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!ipAddress) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse IP valide');
      return;
    }
    await AsyncStorage.setItem('server_ip', ipAddress.trim());
    await AsyncStorage.setItem('server_port', port.trim() || '8080');
    setShowSettings(false);
    Alert.alert('Succès', 'Configuration réseau mise à jour !');
  };

  const handleLogin = async () => {
    const currentIp = await AsyncStorage.getItem('server_ip');
    if (!currentIp) {
      Alert.alert(
        'Configuration requise',
        "Veuillez configurer l'IP du serveur via la roue crantée en haut à droite."
      );
      setShowSettings(true);
      return;
    }

    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      await AsyncStorage.setItem('user_token', result.data.sessionToken);
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erreur', result.error || 'Identifiants incorrects');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color={COLORS.h1} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.titleText}>Bienvenue !</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.h2} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.h2} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerText}>Créer un compte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configuration Réseau</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Adresse IP du Serveur</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="globe-outline" size={20} color={COLORS.h2} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="ex: 192.168.1.50"
                value={ipAddress}
                onChangeText={setIpAddress}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.modalLabel}>Port</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="server-outline" size={20} color={COLORS.h2} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="ex: 8080"
                value={port}
                onChangeText={setPort}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 40,
  },
  welcomeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: COLORS.h2,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: COLORS.h1,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 73, 115, 0.1)',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  loginButton: {
    backgroundColor: COLORS.link,
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.link,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  registerButton: {
    alignItems: 'center',
    padding: 16,
  },
  registerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.link,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: COLORS.h1,
  },
  modalLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.h2,
    marginBottom: 8,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: COLORS.link,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
