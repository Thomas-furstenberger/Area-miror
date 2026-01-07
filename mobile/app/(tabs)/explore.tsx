/*
 ** EPITECH PROJECT, 2026
 ** Area-miror
 ** File description:
 ** explore
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
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/theme';
import { logoutUser, getConnectedAccounts, getAuthUrl, fetchAbout, apiCall } from '@/services/api';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

const getServiceConfig = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('google') || n.includes('gmail'))
    return { icon: 'logo-google', color: '#DB4437', bg: '#FEF2F2' };
  if (n.includes('github')) return { icon: 'logo-github', color: '#24292e', bg: '#F3F4F6' };
  if (n.includes('discord')) return { icon: 'logo-discord', color: '#5865F2', bg: '#EEF2FF' };
  if (n.includes('spotify')) return { icon: 'musical-notes', color: '#1DB954', bg: '#ECFDF5' };
  if (n.includes('twitch')) return { icon: 'logo-twitch', color: '#9146FF', bg: '#F5F3FF' };
  if (n.includes('twitter') || n.includes('x'))
    return { icon: 'logo-twitter', color: '#1DA1F2', bg: '#EFF6FF' };
  if (n.includes('time') || n.includes('timer'))
    return { icon: 'time', color: '#4B5563', bg: '#F3F4F6' };
  if (n.includes('weather')) return { icon: 'partly-sunny', color: '#F59E0B', bg: '#FFFBEB' };
  return { icon: 'flash', color: COLORS.link, bg: '#F0F0F0' };
};

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
        console.log('[Explore] Providers actifs :', providers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const checkIsConnected = (serviceName: string) => {
    const n = serviceName.toLowerCase();

    if (n.includes('timer') || n.includes('weather')) return true;

    if (connectedAccounts.includes(n)) return true;

    if (n === 'gmail' && connectedAccounts.includes('google')) return true;
    if (n === 'google' && connectedAccounts.includes('gmail')) return true;

    return false;
  };

  const handleServicePress = (serviceName: string) => {
    const name = serviceName.toLowerCase();

    if (name.includes('timer') || name.includes('weather')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Service Natif', 'Ce service est toujours actif.');
      return;
    }

    const isConnected = checkIsConnected(serviceName);

    if (isConnected) {
      Alert.alert('Déconnexion', `Voulez-vous déconnecter ${serviceName} ?`, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => disconnectService(name),
        },
      ]);
    } else {
      connectService(name);
    }
  };

  const disconnectService = async (providerId: string) => {
    setProcessing(providerId);
    try {
      let target = providerId;
      if (target === 'gmail') target = 'google';

      const res = await apiCall(`/api/user/oauth/${target}`, 'DELETE');

      if (res.success) {
        setConnectedAccounts((prev) => prev.filter((p) => p !== target && p !== providerId));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        loadData();
      } else {
        Alert.alert('Erreur', 'Impossible de déconnecter le service.');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau.');
    } finally {
      setProcessing(null);
    }
  };

  const connectService = async (providerId: string) => {
    setProcessing(providerId);
    try {
      const authUrl = await getAuthUrl(providerId);
      const result = await WebBrowser.openAuthSessionAsync(authUrl);
      if (result.type === 'success' || result.type === 'dismiss') {
        setTimeout(loadData, 1500);
      }
    } catch {
      Alert.alert('Erreur', 'Connexion impossible');
    } finally {
      setProcessing(null);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', "Voulez-vous quitter l'application ?", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explorer</Text>
          <Text style={styles.headerSubtitle}>Gérez vos connexions</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.link} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {services.map((service) => {
              const name = service.name;
              const config = getServiceConfig(name);
              const isNative =
                name.toLowerCase().includes('timer') || name.toLowerCase().includes('weather');
              const isConnected = checkIsConnected(name);
              const isProcessing = processing === name.toLowerCase();

              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.card,
                    isConnected ? styles.cardConnected : styles.cardDisconnected,
                  ]}
                  onPress={() => !isProcessing && handleServicePress(name)}
                  activeOpacity={0.7}
                  disabled={isProcessing}
                >
                  {isProcessing && (
                    <View style={styles.loaderOverlay}>
                      <ActivityIndicator color={COLORS.link} />
                    </View>
                  )}

                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: isConnected ? '#FFF' : '#F9FAFB' },
                    ]}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={32}
                      color={isConnected ? config.color : '#9CA3AF'}
                    />
                  </View>

                  <Text style={[styles.serviceName, !isConnected && { color: '#9CA3AF' }]}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      isConnected
                        ? isNative
                          ? styles.badgeNative
                          : styles.badgeConnected
                        : styles.badgeDisconnected,
                    ]}
                  >
                    {isConnected ? (
                      <>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: isNative ? '#6B7280' : '#10B981' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.badgeText,
                            isNative ? { color: '#374151' } : { color: '#047857' },
                          ]}
                        >
                          {isNative ? 'Natif' : 'Connecté'}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="add" size={12} color="#6B7280" />
                        <Text style={styles.badgeText}>Relier</Text>
                      </>
                    )}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#111827',
  },
  headerSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
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
    paddingTop: 10,
    paddingBottom: 100,
  },
  center: {
    marginTop: 100,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#9CA3AF',
    fontFamily: 'Inter_500Medium',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisconnected: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    opacity: 0.8,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#4B5563',
    marginLeft: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
