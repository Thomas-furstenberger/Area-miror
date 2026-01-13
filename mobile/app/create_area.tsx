/*
 ** EPITECH PROJECT, 2026
 ** Area-miror
 ** File description:
 ** create_area
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { createArea, fetchAbout } from '@/services/api';

interface ConfigField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

interface Action {
  name: string;
  description: string;
  configFields?: ConfigField[];
}

interface Reaction {
  name: string;
  description: string;
  configFields?: ConfigField[];
}

interface Service {
  name: string;
  actions: Action[];
  reactions: Reaction[];
}

const getServiceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('github')) return 'logo-github';
  if (n.includes('google') || n.includes('gmail')) return 'logo-google';
  if (n.includes('youtube')) return 'logo-youtube';
  if (n.includes('discord')) return 'logo-discord';
  if (n.includes('spotify')) return 'musical-notes';
  if (n.includes('weather')) return 'partly-sunny';
  if (n.includes('chuck')) return 'happy';
  if (n.includes('time')) return 'time';
  return 'cube';
};

const getServiceColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('github')) return '#333';
  if (n.includes('google') || n.includes('gmail')) return '#DB4437';
  if (n.includes('youtube')) return '#FF0000';
  if (n.includes('discord')) return '#5865F2';
  if (n.includes('spotify')) return '#1DB954';
  if (n.includes('weather')) return '#F59E0B';
  if (n.includes('chuck')) return '#F97316';
  if (n.includes('time')) return '#4B5563';
  return COLORS.link;
};

export default function CreateAreaScreen() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [actionService, setActionService] = useState<Service | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [actionConfig, setActionConfig] = useState<any>({});

  const [reactionService, setReactionService] = useState<Service | null>(null);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [reactionConfig, setReactionConfig] = useState<any>({});

  const [areaName, setAreaName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetchAbout();
      if (res.success && res.data?.server?.services) {
        setServices(res.data.server.services);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les services depuis le serveur.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const validateConfig = (fields: ConfigField[] | undefined, values: any) => {
    if (!fields) return true;
    for (const field of fields) {
      if (field.required) {
        const val = values[field.name];
        if (val === undefined || val === '' || val === null) {
          Alert.alert('Manquant', `Le champ "${field.label}" est requis.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 3) {
      if (!validateConfig(action?.configFields, actionConfig)) return;
    }
    if (step === 6) {
      if (!validateConfig(reaction?.configFields, reactionConfig)) return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const formatParams = (provider: string, config: any) => {
    const p = provider.toLowerCase();
    const newConfig = { ...config };

    if (p.includes('timer')) {
      if (config.time) {
        let h = 0,
          m = 0;

        if (
          typeof config.time === 'string' &&
          config.time.includes(':') &&
          !config.time.includes('T')
        ) {
          const parts = config.time.split(':');
          h = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
        } else {
          const date = new Date(config.time);
          if (!isNaN(date.getTime())) {
            h = date.getHours();
            m = date.getMinutes();
          }
        }

        newConfig.hour = h;
        newConfig.minute = m;
      }

      if (config.date) {
        const date = new Date(config.date);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          newConfig.date = `${year}-${month}-${day}`;
        } else if (typeof config.date === 'string') {
          newConfig.date = config.date;
        }
      }

      if (config.day) {
        newConfig.dayOfWeek = parseInt(config.day, 10);
      }
    }

    return newConfig;
  };

  const handleCreate = async () => {
    if (!areaName.trim()) {
      Alert.alert('Erreur', "Donnez un nom à l'automation.");
      return;
    }
    setSubmitting(true);
    try {
      const cleanActionConfig = formatParams(actionService!.name, actionConfig);
      const cleanReactionConfig = formatParams(reactionService!.name, reactionConfig);

      const payload = {
        name: areaName,
        action_provider: actionService!.name,
        action_id: action!.name,
        action_params: cleanActionConfig,
        reaction_provider: reactionService!.name,
        reaction_id: reaction!.name,
        reaction_params: cleanReactionConfig,
      };

      const res = await createArea(payload);

      if (res.success) {
        Alert.alert('Succès', 'Automation créée avec succès !');
        router.replace('/(tabs)/areas');
      } else {
        Alert.alert('Erreur', res.error || 'Erreur inconnue lors de la création.');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Erreur réseau critique.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormFields = (fields: ConfigField[] | undefined, values: any, setValues: any) => {
    if (!fields || fields.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.link} />
          <Text style={styles.emptyText}>Aucune configuration requise.</Text>
        </View>
      );
    }

    return fields.map((f) => {
      if (f.type === 'select') {
        return (
          <View key={f.name} style={styles.inputContainer}>
            <Text style={styles.label}>
              {f.label} {f.required && '*'}
            </Text>
            <View style={styles.selectRow}>
              {f.options?.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionChip,
                    values[f.name] === opt.value && styles.optionChipSelected,
                  ]}
                  onPress={() => setValues({ ...values, [f.name]: opt.value })}
                >
                  <Text
                    style={[styles.optionText, values[f.name] === opt.value && { color: '#FFF' }]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      }

      if (f.type === 'textarea') {
        return (
          <View key={f.name} style={styles.inputContainer}>
            <Text style={styles.label}>
              {f.label} {f.required && '*'}
            </Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              placeholder={f.placeholder}
              value={values[f.name]}
              onChangeText={(t) => setValues({ ...values, [f.name]: t })}
            />
          </View>
        );
      }

      let placeholder = f.placeholder;
      let keyboardType: any = 'default';

      if (f.type === 'time') {
        placeholder = 'Ex: 14:30';
      } else if (f.type === 'date') {
        placeholder = 'Ex: 2025-12-31';
      } else if (f.type === 'number') {
        keyboardType = 'numeric';
      }

      return (
        <View key={f.name} style={styles.inputContainer}>
          <Text style={styles.label}>
            {f.label} {f.required && <Text style={{ color: 'red' }}>*</Text>}
          </Text>
          {f.description && <Text style={styles.helperText}>{f.description}</Text>}

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize="none"
            value={values[f.name]}
            onChangeText={(t) => setValues({ ...values, [f.name]: t })}
          />
        </View>
      );
    });
  };

  const renderServiceCard = (s: Service, onPress: () => void) => (
    <TouchableOpacity key={s.name} style={styles.card} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: getServiceColor(s.name) + '20' }]}>
        <Ionicons name={getServiceIcon(s.name) as any} size={28} color={getServiceColor(s.name)} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.cardTitle}>{s.name.charAt(0).toUpperCase() + s.name.slice(1)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const renderItemCard = (key: string, title: string, desc: string, onPress: () => void) => (
    <TouchableOpacity key={key} style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.headerTitle}>Qui déclenche l'action ?</Text>
            {services
              .filter((s) => s.actions.length > 0)
              .map((s) =>
                renderServiceCard(s, () => {
                  setActionService(s);
                  handleNext();
                })
              )}
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.headerTitle}>Quel événement ?</Text>
            <View style={styles.selectedBadge}>
              <Ionicons name={getServiceIcon(actionService!.name) as any} size={16} color="#555" />
              <Text style={styles.badgeText}>{actionService?.name}</Text>
            </View>
            {actionService?.actions.map((a) =>
              renderItemCard(a.name, a.name, a.description, () => {
                setAction(a);
                handleNext();
              })
            )}
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.headerTitle}>Configuration de l'Action</Text>
            <Text style={styles.subHeader}>Paramétrez : {action?.description}</Text>
            <View style={styles.formBox}>
              {renderFormFields(action?.configFields, actionConfig, setActionConfig)}
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Valider et Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.headerTitle}>Quel service réagit ?</Text>
            {services
              .filter((s) => s.reactions.length > 0)
              .map((s) =>
                renderServiceCard(s, () => {
                  setReactionService(s);
                  handleNext();
                })
              )}
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.headerTitle}>Quelle réaction ?</Text>
            <View style={styles.selectedBadge}>
              <Ionicons
                name={getServiceIcon(reactionService!.name) as any}
                size={16}
                color="#555"
              />
              <Text style={styles.badgeText}>{reactionService?.name}</Text>
            </View>
            {reactionService?.reactions.map((r) =>
              renderItemCard(r.name, r.name, r.description, () => {
                setReaction(r);
                handleNext();
              })
            )}
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={styles.headerTitle}>Configuration de la Réaction</Text>
            <Text style={styles.subHeader}>Paramétrez : {reaction?.description}</Text>
            <View style={styles.formBox}>
              {renderFormFields(reaction?.configFields, reactionConfig, setReactionConfig)}
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Valider et Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        );

      case 7:
        return (
          <View>
            <Text style={styles.headerTitle}>Résumé et Nommage</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.ifText}>SI</Text>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryService}>{actionService?.name}</Text>
                  <Text style={styles.summaryDesc}>{action?.description}</Text>
                </View>
              </View>
              <View style={styles.connectorLine} />
              <View style={styles.summaryRow}>
                <Text style={styles.thenText}>ALORS</Text>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryService}>{reactionService?.name}</Text>
                  <Text style={styles.summaryDesc}>{reaction?.description}</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom de l'automation</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Alerte Météo vers Discord"
                value={areaName}
                onChangeText={setAreaName}
              />
            </View>

            <TouchableOpacity
              style={[styles.createButton, submitting && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.createButtonText}>Lancer l'Automation</Text>
              )}
            </TouchableOpacity>
          </View>
        );
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.link} />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>
            Étape {step} sur {totalSteps}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>{renderContent()}</ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  backBtn: { marginRight: 15 },
  stepIndicator: { fontSize: 16, fontWeight: '600', color: '#666' },
  progressContainer: { height: 4, backgroundColor: '#E0E0E0', width: '100%' },
  progressBar: { height: '100%', backgroundColor: COLORS.link },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  cardSub: { fontSize: 13, color: '#888', marginTop: 4, textTransform: 'uppercase' },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  badgeText: { marginLeft: 8, fontWeight: '600', color: '#555', textTransform: 'uppercase' },
  formBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  helperText: { fontSize: 12, color: '#888', marginBottom: 8, fontStyle: 'italic' },
  input: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.link,
    padding: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.link,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  createButton: {
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 10, color: '#888' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionChipSelected: { backgroundColor: COLORS.link, borderColor: COLORS.link },
  optionText: { color: '#555', fontWeight: '500' },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start' },
  ifText: { fontSize: 14, fontWeight: '900', color: '#6366F1', width: 60, marginTop: 2 },
  thenText: { fontSize: 14, fontWeight: '900', color: '#10B981', width: 60, marginTop: 2 },
  summaryContent: { flex: 1 },
  summaryService: { fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: '700' },
  summaryDesc: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 2 },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#DDD',
    marginLeft: 22,
    marginVertical: 10,
  },
});
