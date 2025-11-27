/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** create_area
*/

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ACTIONS = [
  { id: 'act_1', name: 'Nouveau mail reçu', service: 'Gmail', icon: 'mail' },
  { id: 'act_2', name: 'Nouveau commit', service: 'GitHub', icon: 'git-commit' },
  { id: 'act_3', name: 'Météo change', service: 'Weather', icon: 'cloud' },
];

const REACTIONS = [
  { id: 'reac_1', name: 'Envoyer un message', service: 'Discord', icon: 'chatbubbles' },
  { id: 'reac_2', name: 'Créer un fichier', service: 'Drive', icon: 'document' },
  { id: 'reac_3', name: 'Envoyer un tweet', service: 'Twitter', icon: 'logo-twitter' },
];

export default function CreateAreaScreen() {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleCreate = () => {
    Alert.alert('Succès', 'Automation créée avec succès !');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.navigate('/(tabs)/explore')} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Automation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.stepTitle}>01. SI CECI ARRIVE</Text>
          {ACTIONS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.optionCard, selectedAction === item.id && styles.optionSelected]}
              onPress={() => setSelectedAction(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, selectedAction === item.id && styles.iconBoxSelected]}>
                <Ionicons name={item.icon as any} size={24} color={selectedAction === item.id ? '#FFF' : COLORS.h1} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.serviceText, selectedAction === item.id && styles.textSelected]}>{item.service}</Text>
                <Text style={[styles.nameText, selectedAction === item.id && styles.textSelected]}>{item.name}</Text>
              </View>
              {selectedAction === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.link} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.stepTitle}>02. ALORS FAIRE CELA</Text>
          {REACTIONS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.optionCard, selectedReaction === item.id && styles.optionSelected]}
              onPress={() => setSelectedReaction(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, selectedReaction === item.id && styles.iconBoxSelected]}>
                <Ionicons name={item.icon as any} size={24} color={selectedReaction === item.id ? '#FFF' : COLORS.h1} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.serviceText, selectedReaction === item.id && styles.textSelected]}>{item.service}</Text>
                <Text style={[styles.nameText, selectedReaction === item.id && styles.textSelected]}>{item.name}</Text>
              </View>
              {selectedReaction === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.link} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.createButton, (!selectedAction || !selectedReaction) && styles.createButtonDisabled]} 
          onPress={handleCreate}
          disabled={!selectedAction || !selectedReaction}
        >
          <Text style={styles.createButtonText}>Confirmer la création</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: COLORS.h1,
    marginLeft: 16,
  },
  scroll: {
    padding: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  stepTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: COLORS.h2,
    marginBottom: 16,
    letterSpacing: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: COLORS.h1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionSelected: {
    borderColor: COLORS.link,
    backgroundColor: '#FFFFFF',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconBoxSelected: {
    backgroundColor: COLORS.link,
  },
  textContainer: {
    flex: 1,
  },
  serviceText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: COLORS.h2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nameText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.link,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  createButton: {
    backgroundColor: COLORS.link,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.link,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#A69CAC',
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});