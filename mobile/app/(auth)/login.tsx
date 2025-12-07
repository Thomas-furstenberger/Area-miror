/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** login
*/

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
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

  const handleLogin = async () => {
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

  const handleOAuthLogin = async (provider: 'gmail' | 'github' | 'discord') => {
    try {
      const ip = await AsyncStorage.getItem('server_ip');
      const port = await AsyncStorage.getItem('server_port');
      const url = `http://${ip}:${port}/api/auth/${provider}`;

      // Open OAuth in browser
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le navigateur');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la connexion OAuth');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
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

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.oauthButton, { backgroundColor: '#4285f4' }]}
            onPress={() => handleOAuthLogin('gmail')}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={20} color="#FFF" />
            <Text style={styles.oauthButtonText}>Continuer avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, { backgroundColor: '#24292e' }]}
            onPress={() => handleOAuthLogin('github')}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-github" size={20} color="#FFF" />
            <Text style={styles.oauthButtonText}>Continuer avec GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, { backgroundColor: '#5865f2' }]}
            onPress={() => handleOAuthLogin('discord')}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-discord" size={20} color="#FFF" />
            <Text style={styles.oauthButtonText}>Continuer avec Discord</Text>
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerText}>Créer un compte</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </KeyboardAvoidingView>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: COLORS.h2,
    marginHorizontal: 16,
  },
  oauthButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  oauthButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
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
});