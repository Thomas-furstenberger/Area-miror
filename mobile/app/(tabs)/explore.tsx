/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** explore
*/

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { fetchAbout } from '@/services/api';

const getIconName = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('google')) return 'logo-google';
  if (name.includes('github')) return 'logo-github';
  if (name.includes('discord')) return 'logo-discord';
  if (name.includes('spotify')) return 'musical-notes';
  if (name.includes('twitter') || name.includes('x')) return 'logo-twitter';
  if (name.includes('weather')) return 'cloud';
  if (name.includes('timer')) return 'time';
  return 'cube';
};

export default function ServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      const result = await fetchAbout();
      if (result.success && result.data.server && result.data.server.services) {
        setServices(result.data.server.services);
      }
      setLoading(false);
    };
    loadServices();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Explorer</Text>
        <Text style={styles.subtitleText}>Connectez vos applications</Text>
      </View>

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={COLORS.link} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {services.map((service, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push({ 
                pathname: "/create_area", 
                params: { serviceData: JSON.stringify(service) } 
              })}
            >
              <View style={styles.iconWrapper}>
                <Ionicons name={getIconName(service.name) as any} size={32} color={COLORS.h1} />
              </View>
              
              <Text style={styles.serviceName}>
                {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
              </Text>
              
              <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.statusText, { color: '#2E7D32' }]}>Disponible</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {services.length === 0 && (
             <Text style={{textAlign: 'center', width: '100%', color: COLORS.text}}>
               Aucun service trouvé sur le serveur.
             </Text>
          )}
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8,
  },
  titleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    color: COLORS.h1,
  },
  subtitleText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: COLORS.h2,
    marginTop: 4,
  },
  grid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: COLORS.h1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
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
  serviceName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
});