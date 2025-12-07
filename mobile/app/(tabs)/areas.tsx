/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** areas
*/

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Area {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  actionService: string;
  actionType: string;
  reactionService: string;
  reactionType: string;
  createdAt: string;
}

export default function AreasScreen() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [actionService, setActionService] = useState('gmail');
  const [actionType, setActionType] = useState('email_received');
  const [reactionService, setReactionService] = useState('discord');
  const [reactionType, setReactionType] = useState('send_message');
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    loadAreas();
  }, []);

  const getApiUrl = async () => {
    const ip = await AsyncStorage.getItem('server_ip');
    const port = await AsyncStorage.getItem('server_port');
    return `http://${ip}:${port}`;
  };

  const getToken = async () => {
    return await AsyncStorage.getItem('user_token');
  };

  const loadAreas = async () => {
    try {
      const apiUrl = await getApiUrl();
      const token = await getToken();

      const response = await fetch(`${apiUrl}/api/areas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createArea = async () => {
    try {
      const apiUrl = await getApiUrl();
      const token = await getToken();

      const response = await fetch(`${apiUrl}/api/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          actionService,
          actionType,
          reactionService,
          reactionType,
          reactionConfig: { webhookUrl },
        }),
      });

      if (response.ok) {
        setModalVisible(false);
        setName('');
        setWebhookUrl('');
        loadAreas();
        Alert.alert('Succès', 'AREA créée avec succès !');
      } else {
        Alert.alert('Erreur', 'Impossible de créer l\'AREA');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la création');
    }
  };

  const toggleArea = async (id: string) => {
    try {
      const apiUrl = await getApiUrl();
      const token = await getToken();

      const response = await fetch(`${apiUrl}/api/areas/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadAreas();
      }
    } catch (error) {
      console.error('Error toggling area:', error);
    }
  };

  const deleteArea = async (id: string) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette AREA ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const apiUrl = await getApiUrl();
              const token = await getToken();

              const response = await fetch(`${apiUrl}/api/areas/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                loadAreas();
              }
            } catch (error) {
              console.error('Error deleting area:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.link} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>Mes Automations</Text>
          <Text style={styles.titleText}>AREAs</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={COLORS.link} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {areas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cube-outline" size={48} color={COLORS.link} />
            </View>
            <Text style={styles.emptyTitle}>Aucune AREA</Text>
            <Text style={styles.emptyText}>
              Créez votre première automation{'\n'}en appuyant sur le bouton +
            </Text>
          </View>
        ) : (
          areas.map((area) => (
            <View key={area.id} style={styles.areaCard}>
              <View style={styles.areaHeader}>
                <Text style={styles.areaName}>{area.name}</Text>
                <TouchableOpacity onPress={() => toggleArea(area.id)}>
                  <Ionicons
                    name={area.active ? 'toggle' : 'toggle-outline'}
                    size={32}
                    color={area.active ? COLORS.link : '#CCC'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.areaFlow}>
                <View style={styles.flowItem}>
                  <Text style={styles.flowLabel}>IF</Text>
                  <Text style={styles.flowText}>{area.actionService}</Text>
                  <Text style={styles.flowSubtext}>{area.actionType}</Text>
                </View>

                <Ionicons name="arrow-forward" size={24} color={COLORS.link} />

                <View style={styles.flowItem}>
                  <Text style={styles.flowLabel}>THEN</Text>
                  <Text style={styles.flowText}>{area.reactionService}</Text>
                  <Text style={styles.flowSubtext}>{area.reactionType}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteArea(area.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.deleteText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create AREA Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle AREA</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.h1} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mon automation"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Action</Text>
                <TextInput
                  style={styles.input}
                  value={actionService}
                  onChangeText={setActionService}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type Action</Text>
                <TextInput
                  style={styles.input}
                  value={actionType}
                  onChangeText={setActionType}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Réaction</Text>
                <TextInput
                  style={styles.input}
                  value={reactionService}
                  onChangeText={setReactionService}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type Réaction</Text>
                <TextInput
                  style={styles.input}
                  value={reactionType}
                  onChangeText={setReactionType}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Webhook URL (Discord)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://discord.com/api/webhooks/..."
                  value={webhookUrl}
                  onChangeText={setWebhookUrl}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.createButton} onPress={createArea}>
                <Text style={styles.createButtonText}>Créer</Text>
              </TouchableOpacity>
            </ScrollView>
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
  areaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  areaName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: COLORS.h1,
    flex: 1,
  },
  areaFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flowItem: {
    flex: 1,
    alignItems: 'center',
  },
  flowLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: COLORS.link,
    marginBottom: 4,
  },
  flowText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.h1,
  },
  flowSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.text,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deleteText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: COLORS.h1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: COLORS.link,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
