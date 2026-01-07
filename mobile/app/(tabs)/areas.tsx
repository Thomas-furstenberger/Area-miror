/*
 ** EPITECH PROJECT, 2026
 ** Area-miror
 ** File description:
 ** areas
 */

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
  StatusBar,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getUserAreas, deleteArea } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';

const getIconName = (serviceName: string): keyof typeof Ionicons.glyphMap => {
  const name = serviceName?.toLowerCase() || '';
  if (name.includes('google') || name.includes('gmail')) return 'logo-google';
  if (name.includes('github')) return 'logo-github';
  if (name.includes('discord')) return 'logo-discord';
  if (name.includes('spotify')) return 'musical-notes';
  if (name.includes('twitch')) return 'logo-twitch';
  if (name.includes('time') || name.includes('timer') || name.includes('date')) return 'time';
  if (name.includes('weather') || name.includes('meteo')) return 'partly-sunny';
  return 'flash';
};

const { width } = Dimensions.get('window');

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
    if (!id) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      "Arrêter l'automation ?",
      `Êtes-vous sûr de vouloir supprimer "${name}" ? Cette action est irréversible.`,
      [
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
                Alert.alert('Oups', 'Impossible de supprimer pour le moment.');
              }
            } catch (err: any) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const renderAreaCard = (area: any, index: number) => {
    const actionIcon = getIconName(area.actionService);
    const reactionIcon = getIconName(area.reactionService);

    return (
      <View key={area.id || index} style={styles.cardContainer}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {area.name || 'Automation sans nom'}
              </Text>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleDelete(area.id, area.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.flowContainer}>
            <View style={styles.flowStep}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.link + '15' }]}>
                <Ionicons name={actionIcon} size={22} color={COLORS.link} />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>SI</Text>
                <Text style={styles.stepValue} numberOfLines={1}>
                  {area.actionService || 'Service'}
                </Text>
                <Text style={styles.stepSubValue} numberOfLines={1}>
                  {area.actionType?.replace(/_/g, ' ').toLowerCase()}
                </Text>
              </View>
            </View>

            <View style={styles.connector}>
              <Ionicons name="arrow-down-circle" size={24} color="#E0E0E0" />
            </View>

            <View style={styles.flowStep}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.h1 + '15' }]}>
                <Ionicons name={reactionIcon} size={22} color={COLORS.h1} />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>ALORS</Text>
                <Text style={styles.stepValue} numberOfLines={1}>
                  {area.reactionService || 'Service'}
                </Text>
                <Text style={styles.stepSubValue} numberOfLines={1}>
                  {area.reactionType?.replace(/_/g, ' ').toLowerCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Mes Automations</Text>
          <Text style={styles.headerSubtitle}>Gérez vos flux actifs</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.selectionAsync();
            router.push('/create_area');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRefreshing(true);
              loadAreas();
            }}
            colors={[COLORS.link]}
            tintColor={COLORS.link}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.link} />
            <Text style={styles.loadingText}>Synchronisation...</Text>
          </View>
        ) : areas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="git-network-outline"
                size={60}
                color={COLORS.h2}
                style={{ opacity: 0.5 }}
              />
            </View>
            <Text style={styles.emptyTitle}>C'est calme par ici</Text>
            <Text style={styles.emptyDesc}>
              Vous n'avez pas encore d'automation active. Créez votre première dès maintenant.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/create_area')}
            >
              <Text style={styles.emptyButtonText}>Créer une automation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingBottom: 20 }}>
            {areas.map((area, index) => renderAreaCard(area, index))}
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
    zIndex: 10,
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: COLORS.h1,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.h2,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.link,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.link,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  loadingContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.h2,
    fontSize: 14,
  },

  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 6,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  activeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#2E7D32',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },

  flowContainer: {
    position: 'relative',
    paddingLeft: 4,
  },
  connector: {
    position: 'absolute',
    left: 21,
    top: 38,
    bottom: 38,
    width: 2,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  stepTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: COLORS.h2,
    opacity: 0.6,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  stepValue: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.h1,
    textTransform: 'capitalize',
  },
  stepSubValue: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#888',
    marginTop: 2,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: COLORS.h1,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.h2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: COLORS.link,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: COLORS.link,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonText: {
    color: '#FFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});
