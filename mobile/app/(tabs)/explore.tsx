import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { fetchAbout, getConnectedAccounts, getAuthUrl, logoutUser } from '@/services/api';

const getIconName = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('google')) return 'logo-google';
  if (name.includes('github')) return 'logo-github';
  if (name.includes('discord')) return 'logo-discord';
  if (name.includes('spotify')) return 'musical-notes';
  if (name.includes('twitter') || name.includes('x')) return 'logo-twitter';
  if (name.includes('time') || name.includes('timer')) return 'time';
  return 'cube';
};

export default function ServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      let data = Linking.parse(event.url);
      if (data.queryParams?.token) {
        const token = data.queryParams.token as string;
        await AsyncStorage.setItem('user_token', token);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Succès', 'Connexion réussie !');
        loadData();
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const aboutRes = await fetchAbout();
      if (aboutRes.success && aboutRes.data.server?.services) {
        setServices(aboutRes.data.server.services);
      }
      const accountsRes = await getConnectedAccounts();
      if (accountsRes.success && Array.isArray(accountsRes.data.accounts)) {
        const providers = accountsRes.data.accounts.map((acc: any) => {
          const providerName = acc.provider.toLowerCase();
          return providerName === 'google' ? 'gmail' : providerName;
        });
        setConnectedProviders(providers);
      }
    } catch (e) {
      console.error('Erreur chargement', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleServiceClick = async (service: any) => {
    await Haptics.selectionAsync();
    const serviceName = service.name.toLowerCase();

    if (serviceName === 'timer' || serviceName === 'time') {
      Alert.alert('Information', 'Le service Timer est natif et toujours actif.');
      return;
    }

    const isConnected = connectedProviders.includes(serviceName);

    if (isConnected) {
      Alert.alert(
        'Compte connecté',
        `Le service ${service.name} est déjà lié à votre compte AREA.`,
        [{ text: 'OK' }]
      );
    } else {
      try {
        const authUrl = await getAuthUrl(serviceName);
        const supported = await Linking.canOpenURL(authUrl);
        if (supported) {
          await Linking.openURL(authUrl);
        } else {
          Alert.alert('Erreur', "Impossible d'ouvrir le navigateur");
        }
      } catch (err) {
        Alert.alert('Erreur', 'Problème de connexion au serveur.');
      }
    }
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
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
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.titleText}>Explorer</Text>
          <Text style={styles.subtitleText}>Gérez vos connexions</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.link} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {services.map((service, index) => {
            const sName = service.name.toLowerCase();
            const isTimer = sName.includes('timer') || sName.includes('time');
            const isConnected = connectedProviders.includes(sName) || isTimer;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.card, isConnected ? styles.cardConnected : styles.cardDisconnected]}
                activeOpacity={0.7}
                onPress={() => handleServiceClick(service)}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name={getIconName(service.name) as any} size={32} color={COLORS.h1} />
                </View>
                <Text style={styles.serviceName}>
                  {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isConnected ? '#E8F5E9' : '#FFF3E0' },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isConnected ? '#4CAF50' : '#FF9800' },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: isConnected ? '#2E7D32' : '#EF6C00' }]}>
                    {isConnected ? (isTimer ? 'Actif' : 'Connecté') : 'Se connecter'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8,
  },
  titleText: { fontFamily: 'Inter_700Bold', fontSize: 34, color: COLORS.h1 },
  subtitleText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: COLORS.h2, marginTop: 4 },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: COLORS.h1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 2,
  },
  cardConnected: { backgroundColor: '#FFFFFF', borderColor: 'transparent' },
  cardDisconnected: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: COLORS.inputBorder,
    borderStyle: 'dashed',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceName: { fontFamily: 'Inter_700Bold', fontSize: 16, color: COLORS.text, marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
});
