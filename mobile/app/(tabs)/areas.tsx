import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getUserAreas, deleteArea } from '@/services/api';

const getIconName = (serviceName: string) => {
  const name = serviceName?.toLowerCase() || '';
  if (name.includes('google') || name.includes('gmail')) return 'logo-google';
  if (name.includes('github')) return 'logo-github';
  if (name.includes('discord')) return 'logo-discord';
  if (name.includes('time') || name.includes('timer')) return 'time';
  return 'cube';
};

export default function AreasScreen() {
  const router = useRouter();
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAreas = async () => {
    try {
      const result = await getUserAreas();
      if (result.success && Array.isArray(result.data.areas)) {
        setAreas(result.data.areas);
      } else if (result.success && Array.isArray(result.data)) {
        setAreas(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAreas();
    }, [])
  );

  const handleDelete = async (id: string, name: string) => {
    console.log(`[UI] Tentative de suppression de l'AREA : ${name} (ID: ${id})`);

    if (!id) {
      Alert.alert('Erreur', "ID de l'automation introuvable.");
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert('Supprimer', `Voulez-vous arrêter "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteArea(id);

            if (result.success) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadAreas();
            } else {
              Alert.alert('Erreur', `Échec suppression : ${result.error || 'Erreur inconnue'}`);
            }
          } catch (err: any) {
            Alert.alert('Erreur Critique', err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mes Automations</Text>
          <Text style={styles.headerSubtitle}>
            {areas.length} active{areas.length > 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.selectionAsync();
            router.push('/create_area');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              Haptics.selectionAsync();
              setRefreshing(true);
              loadAreas();
            }}
            tintColor={COLORS.link}
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.link} style={{ marginTop: 50 }} />
        ) : areas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cube-outline" size={40} color={COLORS.h2} />
            </View>
            <Text style={styles.emptyText}>Aucune automation active</Text>
            <Text style={styles.emptySubtext}>Cliquez sur + pour créer votre première AREA</Text>
          </View>
        ) : (
          areas.map((area, index) => (
            <View key={area.id || index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.serviceRow}>
                  <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons
                      name={getIconName(area.actionService) as any}
                      size={20}
                      color={COLORS.h1}
                    />
                  </View>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#B0B0B0"
                    style={{ marginHorizontal: 8 }}
                  />
                  <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
                    <Ionicons
                      name={getIconName(area.reactionService) as any}
                      size={20}
                      color={COLORS.h1}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(area.id, area.name)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>{area.name || 'Automation sans nom'}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.triggerText}>Si {area.actionType?.replace(/_/g, ' ')}</Text>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 28, color: COLORS.h1 },
  headerSubtitle: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.h2, marginTop: 4 },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.link,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.link,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  scrollContent: { padding: 24, paddingBottom: 100 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: { padding: 4, opacity: 0.8 },

  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: COLORS.text, marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  triggerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#888',
    textTransform: 'capitalize',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 6 },
  activeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#2E7D32' },

  emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.6 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: COLORS.text },
  emptySubtext: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#888', marginTop: 8 },
});
