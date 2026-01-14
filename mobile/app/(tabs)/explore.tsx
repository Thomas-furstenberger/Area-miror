/*
 ** EPITECH PROJECT, 2026
 ** Area-miror
 ** File description:
 ** explore.tsx
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from '@/constants/theme';
import { logoutUser, getConnectedAccounts, getAuthUrl, fetchAbout, apiCall } from '@/services/api';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

export default function ExploreScreen() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const aboutRes = await fetchAbout();
      if (aboutRes.success && aboutRes.data?.server?.services) {
        setServices(aboutRes.data.server.services);
      }
      const accountsRes = await getConnectedAccounts();
      if (accountsRes.success && Array.isArray(accountsRes.data.accounts)) {
        const providers = accountsRes.data.accounts.map((acc: any) => acc.provider.toLowerCase());
        setConnectedAccounts(providers);
      }
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getServiceConfig = (technicalName: string) => {
    const n = technicalName.toLowerCase();

    if (n === 'gmail') {
      return {
        label: 'Google',
        icon: 'logo-google',
        color: '#DB4437',
        bg: '#FEF2F2',
      };
    }

    if (n.includes('github'))
      return { label: 'GitHub', icon: 'logo-github', color: '#24292e', bg: '#F3F4F6' };
    if (n.includes('discord'))
      return { label: 'Discord', icon: 'logo-discord', color: '#5865F2', bg: '#EEF2FF' };
    if (n.includes('spotify'))
      return { label: 'Spotify', icon: 'musical-notes', color: '#1DB954', bg: '#ECFDF5' };
    if (n.includes('time'))
      return { label: 'Timer', icon: 'time', color: '#4B5563', bg: '#F3F4F6' };
    if (n.includes('weather'))
      return { label: 'Météo', icon: 'partly-sunny', color: '#F59E0B', bg: '#FFFBEB' };
    if (n.includes('chuck'))
      return { label: 'Blagues', icon: 'happy', color: '#F97316', bg: '#FFF7ED' };

    return { label: technicalName, icon: 'flash', color: COLORS.link, bg: '#F0F0F0' };
  };

  const isConnected = (serviceName: string) => {
    const n = serviceName.toLowerCase();

    if (['timer', 'weather', 'chuck'].includes(n)) return true;
    if (n === 'gmail' && connectedAccounts.includes('google')) return true;

    return connectedAccounts.includes(n);
  };

  const handleServicePress = async (serviceName: string) => {
    if (['timer', 'weather', 'chuck'].includes(serviceName)) return;

    let targetProvider = serviceName;
    let disconnectProvider = serviceName;
    if (serviceName === 'gmail') disconnectProvider = 'google';

    if (isConnected(serviceName)) {
      Alert.alert('Déconnexion', `Voulez-vous déconnecter ce service ?`, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            setProcessing(serviceName);
            await apiCall(`/api/user/oauth/${disconnectProvider}`, 'DELETE');
            setConnectedAccounts((prev) => prev.filter((p) => p !== 'google' && p !== serviceName));
            setProcessing(null);
          },
        },
      ]);
    } else {
      setProcessing(serviceName);
      try {
        const authUrl = await getAuthUrl(targetProvider);
        const result = await WebBrowser.openAuthSessionAsync(authUrl);
        if (result.type === 'success' || result.type === 'dismiss') {
          setTimeout(loadData, 1500);
        }
      } catch {
        Alert.alert('Erreur', 'Connexion impossible');
      } finally {
        setProcessing(null);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Services</Text>
          <Text style={styles.headerSubtitle}>Connectez vos comptes</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logoutUser();
            router.replace('/(auth)/login');
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.link} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.grid}>
            {services.map((service) => {
              const technicalName = service.name.toLowerCase();

              if (technicalName === 'youtube') return null;

              const config = getServiceConfig(technicalName);
              const active = isConnected(technicalName);
              const isProcessing = processing === technicalName;
              const isNative = ['timer', 'weather', 'chuck'].includes(technicalName);

              return (
                <TouchableOpacity
                  key={service.name}
                  style={[styles.card, active ? styles.cardConnected : styles.cardDisconnected]}
                  onPress={() => !isProcessing && handleServicePress(technicalName)}
                  disabled={isProcessing}
                  activeOpacity={isNative ? 1 : 0.7}
                >
                  {isProcessing && <ActivityIndicator color={config.color} style={styles.loader} />}

                  <View
                    style={[styles.iconContainer, { backgroundColor: active ? '#FFF' : '#F9FAFB' }]}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={32}
                      color={active ? config.color : '#9CA3AF'}
                    />
                  </View>

                  <Text style={[styles.serviceName, !active && { color: '#9CA3AF' }]}>
                    {config.label}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      active
                        ? isNative
                          ? styles.badgeNative
                          : styles.badgeConnected
                        : styles.badgeDisconnected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        active
                          ? isNative
                            ? { color: '#4B5563' }
                            : { color: '#047857' }
                          : { color: '#6B7280' },
                      ]}
                    >
                      {active ? (isNative ? 'Natif' : 'Connecté') : 'Relier'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card: {
    width: ITEM_WIDTH,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: GAP,
    borderWidth: 1,
  },
  cardConnected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  cardDisconnected: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  serviceName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeConnected: {
    backgroundColor: '#ECFDF5',
  },
  badgeNative: {
    backgroundColor: '#F3F4F6',
  },
  badgeDisconnected: {
    backgroundColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loader: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
