/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** index
*/

import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>Tableau de bord</Text>
          <Text style={styles.titleText}>Vos Automations</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person" size={20} color={COLORS.link} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.link} />
          </View>
          <Text style={styles.emptyTitle}>Tout est calme</Text>
          <Text style={styles.emptyText}>
            Vous n'avez aucune automation active.{'\n'}Explorez les services pour commencer.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  dateText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.h2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: COLORS.h1,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 73, 115, 0.1)',
  },
  scrollContent: {
    padding: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.h1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: COLORS.h1,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.link,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.link,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});