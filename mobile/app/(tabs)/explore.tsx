/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** explore
*/

import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SERVICES = [
  { id: '1', name: 'Google', icon: 'logo-google', connected: false },
  { id: '2', name: 'GitHub', icon: 'logo-github', connected: true },
  { id: '3', name: 'Discord', icon: 'logo-discord', connected: false },
  { id: '4', name: 'Spotify', icon: 'musical-notes', connected: false },
];

export default function ServicesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Explorer</Text>
        <Text style={styles.subtitleText}>Connectez vos applications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {SERVICES.map((service) => (
          <TouchableOpacity 
            key={service.id} 
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: "/create_area", params: { serviceId: service.id } })}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={service.icon as any} size={32} color={COLORS.h1} />
            </View>
            
            <Text style={styles.serviceName}>{service.name}</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: service.connected ? '#E8F5E9' : '#F3F4F6' }]}>
              <View style={[styles.statusDot, { backgroundColor: service.connected ? '#4CAF50' : COLORS.h2 }]} />
              <Text style={[styles.statusText, { color: service.connected ? '#2E7D32' : COLORS.h2 }]}>
                {service.connected ? 'Actif' : 'Déconnecté'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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