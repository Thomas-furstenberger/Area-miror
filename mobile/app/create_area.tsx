import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/theme';
import { fetchAbout, createArea } from '@/services/api';

type Service = { name: string; actions: Action[]; reactions: Reaction[] };
type Action = { name: string; description: string };
type Reaction = { name: string; description: string };

const getIconName = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('google')) return 'logo-google';
  if (n.includes('github')) return 'logo-github';
  if (n.includes('discord')) return 'logo-discord';
  if (n.includes('time')) return 'time';
  return 'cube';
};

export default function CreateAreaScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  const [selectedActionService, setSelectedActionService] = useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionParams, setActionParams] = useState<any>({});

  const [selectedReactionService, setSelectedReactionService] = useState<Service | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);
  const [reactionParams, setReactionParams] = useState<any>({});

  useEffect(() => {
    fetchAbout().then((res) => {
      if (res.success && res.data?.server?.services) {
        setServices(res.data.server.services);
      }
      setLoading(false);
    });
  }, []);

  const goNext = () => {
    Haptics.selectionAsync();
    setStep(step + 1);
  };

  const goBack = () => {
    Haptics.selectionAsync();
    if (step === 0) router.back();
    else setStep(step - 1);
  };

  const handleCreate = async () => {
    if (!selectedActionService || !selectedAction || !selectedReactionService || !selectedReaction)
      return;

    setLoading(true);
    const finalParams = { ...actionParams, ...reactionParams };

    const result = await createArea(
      selectedActionService.name,
      selectedAction.name,
      selectedReactionService.name,
      selectedReaction.name,
      finalParams
    );

    setLoading(false);
    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Votre AREA a été créée !', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/areas') },
      ]);
    } else {
      Alert.alert('Erreur', "Impossible de créer l'AREA.");
    }
  };

  const renderServiceGrid = (isReaction: boolean) => (
    <View style={styles.grid}>
      {services
        .filter((s) => (isReaction ? s.reactions?.length > 0 : s.actions?.length > 0))
        .map((service, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => {
              if (isReaction) setSelectedReactionService(service);
              else setSelectedActionService(service);
              goNext();
            }}
          >
            <View style={styles.iconBox}>
              <Ionicons name={getIconName(service.name) as any} size={28} color={COLORS.h1} />
            </View>
            <Text style={styles.cardText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
    </View>
  );

  const renderList = (items: any[], isReaction: boolean) => (
    <View>
      {items.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.listItem}
          onPress={() => {
            if (isReaction) setSelectedReaction(item);
            else setSelectedAction(item);
            goNext();
          }}
        >
          <Text style={styles.listTitle}>{item.name.replace(/_/g, ' ')}</Text>
          <Text style={styles.listDesc}>{item.description}</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActionConfig = () => {
    const isTimer = selectedActionService?.name.toLowerCase().includes('time');

    if (isTimer) {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Configuration du Timer</Text>
          <Text style={styles.subLabel}>Entrez l'heure au format HH:mm (ex: 14:30)</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: 08:00"
            placeholderTextColor="#999"
            keyboardType="numbers-and-punctuation"
            onChangeText={(text) =>
              setActionParams({
                ...actionParams,
                time: text,
                hour: parseInt(text.split(':')[0]),
                minute: parseInt(text.split(':')[1]),
              })
            }
          />

          {selectedAction?.name === 'date_reached' && (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#999"
              onChangeText={(text) => setActionParams({ ...actionParams, date: text })}
            />
          )}

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextButtonText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerMsg}>
        <Text style={styles.msgText}>Aucune configuration requise pour cette action.</Text>
        <TouchableOpacity style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextButtonText}>Suivant</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReactionConfig = () => {
    const isDiscord = selectedReactionService?.name.toLowerCase().includes('discord');
    const isGmail =
      selectedReactionService?.name.toLowerCase().includes('google') ||
      selectedReactionService?.name.toLowerCase().includes('gmail');

    return (
      <View style={styles.formContainer}>
        {isDiscord && (
          <>
            <Text style={styles.label}>Webhook Discord</Text>
            <TextInput
              style={styles.input}
              placeholder="https://discord.com/api/webhooks/..."
              onChangeText={(t) => setReactionParams({ ...reactionParams, webhookUrl: t })}
            />
            <Text style={[styles.label, { marginTop: 10 }]}>Message (Optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Hello world!"
              onChangeText={(t) => setReactionParams({ ...reactionParams, message: t })}
            />
          </>
        )}

        {isGmail && (
          <>
            <Text style={styles.label}>Destinataire</Text>
            <TextInput
              style={styles.input}
              placeholder="ami@example.com"
              keyboardType="email-address"
              onChangeText={(t) => setReactionParams({ ...reactionParams, to: t })}
            />
            <Text style={[styles.label, { marginTop: 10 }]}>Sujet</Text>
            <TextInput
              style={styles.input}
              placeholder="Sujet du mail"
              onChangeText={(t) => setReactionParams({ ...reactionParams, subject: t })}
            />
            <Text style={[styles.label, { marginTop: 10 }]}>Corps du message</Text>
            <TextInput
              style={styles.input}
              placeholder="Contenu..."
              onChangeText={(t) => setReactionParams({ ...reactionParams, body: t })}
            />
          </>
        )}

        {!isDiscord && !isGmail && (
          <Text style={styles.msgText}>Aucune configuration spécifique détectée.</Text>
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: '#4CAF50' }]}
          onPress={handleCreate}
        >
          <Text style={styles.nextButtonText}>Créer l'AREA</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return 'Choisissez le déclencheur';
      case 1:
        return `Quoi dans ${selectedActionService?.name}?`;
      case 2:
        return 'Configurer le déclencheur';
      case 3:
        return 'Choisissez la réaction';
      case 4:
        return `Quoi dans ${selectedReactionService?.name}?`;
      case 5:
        return 'Configurer la réaction';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.h1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle AREA</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${((step + 1) / 6) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stepTitle}>{getStepTitle()}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.link} style={{ marginTop: 40 }} />
        ) : (
          <>
            {step === 0 && renderServiceGrid(false)}
            {step === 1 && renderList(selectedActionService?.actions || [], false)}
            {step === 2 && renderActionConfig()}
            {step === 3 && renderServiceGrid(true)}
            {step === 4 && renderList(selectedReactionService?.reactions || [], true)}
            {step === 5 && renderReactionConfig()}
          </>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.h1 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#FFF' },
  progressContainer: { height: 4, backgroundColor: '#E0E0E0', width: '100%' },
  progressBar: { height: '100%', backgroundColor: COLORS.link },
  content: { padding: 24, paddingBottom: 50 },
  stepTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: COLORS.h1, marginBottom: 24 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },

  listItem: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  listTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  listDesc: {
    fontSize: 12,
    color: '#888',
    position: 'absolute',
    bottom: 18,
    left: 20,
    maxWidth: '80%',
  },

  formContainer: { backgroundColor: '#FFF', padding: 24, borderRadius: 20 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.h1, marginBottom: 8 },
  subLabel: { fontSize: 12, color: '#666', marginBottom: 12 },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: COLORS.link,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  nextButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },

  centerMsg: { alignItems: 'center', marginTop: 20 },
  msgText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
});
