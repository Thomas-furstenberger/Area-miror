/*
 ** EPITECH PROJECT, 2026
 ** Area-miror
 ** File description:
 ** create_area.tsx
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
  Keyboard,
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

interface ActionReaction {
  name: string;
  description: string;
  configFields?: ConfigField[];
}

interface Service {
  name: string;
  actions: ActionReaction[];
  reactions: ActionReaction[];
}

const getServiceIcon = (name: string): keyof typeof Ionicons.glyphMap => {
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

const getServiceColor = (name: string): string => {
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
  const [action, setAction] = useState<ActionReaction | null>(null);
  const [actionConfig, setActionConfig] = useState<Record<string, any>>({});

  const [reactionService, setReactionService] = useState<Service | null>(null);
  const [reaction, setReaction] = useState<ActionReaction | null>(null);
  const [reactionConfig, setReactionConfig] = useState<Record<string, any>>({});

  const [areaName, setAreaName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetchAbout();
      if (res.success && res.data?.server?.services) {
        const rawServices: Service[] = res.data.server.services;

        const processedServices: Service[] = [];

        rawServices.forEach((service) => {
          if (service.name === 'Google') {
            processedServices.push({
              name: 'Gmail',
              actions: service.actions.filter((a) => a.name === 'email_received'),
              reactions: service.reactions.filter((r) =>
                ['send_email', 'mark_as_read'].includes(r.name)
              ),
            });

            processedServices.push({
              name: 'YouTube',
              actions: service.actions.filter((a) => a.name === 'new_video'),
              reactions: service.reactions.filter((r) =>
                ['add_to_playlist', 'like_video', 'post_comment'].includes(r.name)
              ),
            });
          } else {
            processedServices.push(service);
          }
        });

        setServices(processedServices);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les services.');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const validateConfig = (fields: ConfigField[] | undefined, values: any) => {
    Keyboard.dismiss();
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
    if (step === 3 && !validateConfig(action?.configFields, actionConfig)) return;
    if (step === 6 && !validateConfig(reaction?.configFields, reactionConfig)) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const formatParams = (provider: string, config: any) => {
    const p = provider.toLowerCase();

    const newConfig: Record<string, any> = {};
    Object.keys(config).forEach((key) => {
      const val = config[key];
      if (typeof val === 'string') {
        newConfig[key] = val.trim();
      } else {
        newConfig[key] = val;
      }
    });

    if (p.includes('timer')) {
      if (newConfig.time) {
        let h = 0,
          m = 0;
        if (typeof newConfig.time === 'string' && newConfig.time.includes(':')) {
          const parts = newConfig.time.split(':');
          h = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
        } else {
          const date = new Date(newConfig.time);
          if (!isNaN(date.getTime())) {
            h = date.getHours();
            m = date.getMinutes();
          }
        }
        newConfig.hour = h;
        newConfig.minute = m;
      }
      if (newConfig.date) {
        newConfig.date =
          typeof newConfig.date === 'string'
            ? newConfig.date
            : new Date(newConfig.date).toISOString().split('T')[0];
      }
      if (newConfig.day) {
        newConfig.dayOfWeek = parseInt(newConfig.day, 10);
      }
    }

    if (p.includes('weather') && newConfig.temperature) {
      newConfig.temperature = Number(newConfig.temperature);
    }

    if (p.includes('github') && newConfig.issue_number) {
      newConfig.issue_number = parseInt(newConfig.issue_number, 10);
    }

    if (p.includes('youtube') && newConfig.video_url && !newConfig.video_id) {
      newConfig.video_id = newConfig.video_url;
    }

    return newConfig;
  };

  const getBackendServiceName = (serviceName: string) => {
    const s = serviceName.toLowerCase();
    if (s === 'gmail' || s === 'youtube') {
      return 'Google';
    }
    return serviceName;
  };

  const handleCreate = async () => {
    if (!areaName.trim()) {
      Alert.alert('Erreur', "Donnez un nom à l'automation.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: areaName.trim(),
        action_provider: getBackendServiceName(actionService!.name),
        action_id: action!.name,
        action_params: formatParams(actionService!.name, actionConfig),
        reaction_provider: getBackendServiceName(reactionService!.name),
        reaction_id: reaction!.name,
        reaction_params: formatParams(reactionService!.name, reactionConfig),
      };

      const res = await createArea(payload);

      if (res.success) {
        Alert.alert('Succès', 'Automation créée avec succès !', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/areas') },
        ]);
      } else {
        Alert.alert('Erreur', res.error || 'Erreur lors de la création.');
      }
    } catch {
      Alert.alert('Erreur', 'Erreur réseau critique.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderConfigField = (field: ConfigField, values: any, setValues: any) => {
    if (field.type === 'select') {
      return (
        <View key={field.name} style={styles.inputContainer}>
          <Text style={styles.label}>
            {field.label} {field.required && <Text style={styles.requiredStar}>*</Text>}
          </Text>
          <View style={styles.selectRow}>
            {field.options?.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  values[field.name] === opt.value && styles.optionChipSelected,
                ]}
                onPress={() => setValues({ ...values, [field.name]: opt.value })}
              >
                <Text
                  style={[
                    styles.optionText,
                    values[field.name] === opt.value && styles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    let placeholder = field.placeholder;
    let keyboardType: 'default' | 'numeric' = 'default';

    if (field.type === 'time') placeholder = 'Ex: 14:30';
    if (field.type === 'date') placeholder = 'Ex: 2025-12-31';
    if (field.type === 'number') keyboardType = 'numeric';

    return (
      <View key={field.name} style={styles.inputContainer}>
        <Text style={styles.label}>
          {field.label} {field.required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        {field.description && <Text style={styles.helperText}>{field.description}</Text>}
        <TextInput
          style={[styles.input, field.type === 'textarea' && styles.textArea]}
          multiline={field.type === 'textarea'}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize="none"
          value={values[field.name] ? String(values[field.name]) : ''}
          onChangeText={(t) => setValues({ ...values, [field.name]: t })}
        />
      </View>
    );
  };

  const renderServiceCard = (s: Service, onPress: () => void) => (
    <TouchableOpacity key={s.name} style={styles.card} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: getServiceColor(s.name) + '20' }]}>
        <Ionicons name={getServiceIcon(s.name)} size={28} color={getServiceColor(s.name)} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{s.name.charAt(0).toUpperCase() + s.name.slice(1)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const renderItemCard = (item: ActionReaction, onPress: () => void) => (
    <TouchableOpacity key={item.name} style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.description}</Text>
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
            {actionService?.actions.map((a) =>
              renderItemCard(a, () => {
                setAction(a);
                handleNext();
              })
            )}
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.headerTitle}>Configuration Action</Text>
            <View style={styles.formBox}>
              {action?.configFields?.map((f) =>
                renderConfigField(f, actionConfig, setActionConfig)
              )}
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Valider</Text>
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
            {reactionService?.reactions.map((r) =>
              renderItemCard(r, () => {
                setReaction(r);
                handleNext();
              })
            )}
          </View>
        );
      case 6:
        return (
          <View>
            <Text style={styles.headerTitle}>Configuration Réaction</Text>
            <View style={styles.formBox}>
              {reaction?.configFields?.map((f) =>
                renderConfigField(f, reactionConfig, setReactionConfig)
              )}
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Valider</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        );
      case 7:
        return (
          <View>
            <Text style={styles.headerTitle}>Résumé</Text>
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
                placeholder="Ex: Sync GitHub vers Discord"
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
                <Text style={styles.createButtonText}>Lancer</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.link} />
      </View>
    );
  }

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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  backBtn: {
    marginRight: 15,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.link,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
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
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  cardSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  formBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  requiredStar: {
    color: 'red',
  },
  input: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  createButton: {
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionChipSelected: {
    backgroundColor: COLORS.link,
    borderColor: COLORS.link,
  },
  optionText: {
    color: '#555',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ifText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.link,
    width: 60,
    marginTop: 2,
  },
  thenText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#8E44AD',
    width: 60,
    marginTop: 2,
  },
  summaryContent: {
    flex: 1,
  },
  summaryService: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  summaryDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 20,
    marginVertical: 10,
  },
});
