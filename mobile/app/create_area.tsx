import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { createArea, fetchAbout } from '@/services/api';

interface ConfigField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}
interface ServiceItem {
  name: string;
  description: string;
  configFields?: ConfigField[];
}
interface Service {
  name: string;
  actions: ServiceItem[];
  reactions: ServiceItem[];
}

const getIconName = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('google') || name.includes('gmail')) return 'logo-google';
  if (name.includes('github')) return 'logo-github';
  if (name.includes('discord')) return 'logo-discord';
  if (name.includes('time')) return 'time';
  return 'cube';
};

export default function CreateAreaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  const [actionService, setActionService] = useState<Service | null>(null);
  const [selectedAction, setSelectedAction] = useState<ServiceItem | null>(null);

  const [reactionService, setReactionService] = useState<Service | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<ServiceItem | null>(null);

  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchAbout();
        if (res.success && res.data.server?.services) {
          setServices(res.data.server.services);
          if (params.serviceData) {
            const preSelected = JSON.parse(params.serviceData as string);
            const found = res.data.server.services.find(
              (s: Service) => s.name === preSelected.name
            );
            if (found) {
              setActionService(found);
              setStep(2);
            }
          }
        }
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de charger les services');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleConfigChange = (key: string, value: string) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 3 && selectedAction?.configFields) {
      for (const field of selectedAction.configFields) {
        if (field.required && !configValues[field.name]) {
          Alert.alert('Manquant', `Le champ ${field.label} est requis.`);
          return;
        }
      }
    }
    if (step === 6 && selectedReaction?.configFields) {
      for (const field of selectedReaction.configFields) {
        if (field.required && !configValues[field.name]) {
          Alert.alert('Manquant', `Le champ ${field.label} est requis.`);
          return;
        }
      }
    }
    setStep(step + 1);
  };

  const handleCreate = async () => {
    if (!selectedAction || !selectedReaction || !actionService || !reactionService) return;

    setLoading(true);

    const finalParams = { ...configValues };

    if (reactionService.name === 'discord' && !finalParams.username) {
      finalParams.username = 'Area Bot';
    }

    const result = await createArea(
      actionService.name.toLowerCase(),
      selectedAction.name,
      reactionService.name.toLowerCase(),
      selectedReaction.name,
      finalParams
    );
    setLoading(false);

    if (result.success) {
      Alert.alert('Succès', 'Automation créée avec succès !');
      router.replace('/(tabs)/areas');
    } else {
      Alert.alert('Erreur', 'Échec de la création. Vérifiez les paramètres.');
    }
  };

  const renderConfigFields = (fields: ConfigField[]) => (
    <View>
      {fields.map((field) => (
        <View key={field.name} style={styles.inputGroup}>
          <Text style={styles.label}>
            {field.label} {field.required && '*'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={field.placeholder || 'Entrez une valeur...'}
            placeholderTextColor="#CCC"
            value={configValues[field.name] || ''}
            onChangeText={(text) => handleConfigChange(field.name, text)}
            autoCapitalize="none"
          />
        </View>
      ))}
    </View>
  );

  const renderGrid = (items: Service[], onSelect: (s: Service) => void) => (
    <View style={styles.grid}>
      {items.map((srv) => (
        <TouchableOpacity key={srv.name} style={styles.card} onPress={() => onSelect(srv)}>
          <View style={styles.iconWrapper}>
            <Ionicons name={getIconName(srv.name) as any} size={32} color={COLORS.h1} />
          </View>
          <Text style={styles.cardTitle}>{srv.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderList = (items: ServiceItem[], onSelect: (i: ServiceItem) => void) => (
    <View>
      {items.map((item) => (
        <TouchableOpacity key={item.name} style={styles.rowItem} onPress={() => onSelect(item)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{item.name.replace(/_/g, ' ')}</Text>
            <Text style={styles.rowDesc}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.link} />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.stepTitle}>
          {step === 1 && 'Service Déclencheur'}
          {step === 2 && "Choisir l'Action"}
          {step === 3 && "Configurer l'Action"}
          {step === 4 && 'Service Réaction'}
          {step === 5 && 'Choisir la Réaction'}
          {step === 6 && 'Configurer la Réaction'}
          {step === 7 && 'Résumé'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {step === 1 &&
            renderGrid(services, (s) => {
              setActionService(s);
              setStep(2);
            })}

          {step === 2 &&
            actionService &&
            renderList(actionService.actions, (a) => {
              setSelectedAction(a);
              setStep(a.configFields && a.configFields.length > 0 ? 3 : 4);
            })}

          {step === 3 && selectedAction?.configFields && (
            <View>
              <Text style={styles.sectionTitle}>Paramètres pour {selectedAction.name}</Text>
              {renderConfigFields(selectedAction.configFields)}
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.btnText}>Suivant</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 4 &&
            renderGrid(services, (s) => {
              setReactionService(s);
              setStep(5);
            })}

          {step === 5 &&
            reactionService &&
            renderList(reactionService.reactions, (r) => {
              setSelectedReaction(r);
              setStep(r.configFields && r.configFields.length > 0 ? 6 : 7);
            })}

          {step === 6 && selectedReaction?.configFields && (
            <View>
              <Text style={styles.sectionTitle}>Paramètres pour {selectedReaction.name}</Text>
              {renderConfigFields(selectedReaction.configFields)}
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.btnText}>Suivant</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 7 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Ionicons
                  name={getIconName(actionService?.name || '') as any}
                  size={28}
                  color={COLORS.h1}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.summaryTitle}>{actionService?.name}</Text>
                  <Text style={styles.summarySub}>{selectedAction?.description}</Text>
                </View>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={24} color={COLORS.link} />
              </View>

              <View style={styles.summaryRow}>
                <Ionicons
                  name={getIconName(reactionService?.name || '') as any}
                  size={28}
                  color={COLORS.h1}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.summaryTitle}>{reactionService?.name}</Text>
                  <Text style={styles.summarySub}>{selectedReaction?.description}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.btnText}>Activer l'Automation</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: { marginRight: 15 },
  stepTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: COLORS.text },
  content: { padding: 20, paddingBottom: 50 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconWrapper: { marginBottom: 10 },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: COLORS.h1,
    textTransform: 'capitalize',
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  rowTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  rowDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#888' },

  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: COLORS.h1, marginBottom: 20 },

  nextBtn: {
    backgroundColor: COLORS.link,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  createBtn: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 16 },

  summaryCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: COLORS.h1,
    textTransform: 'capitalize',
  },
  summarySub: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#888', marginTop: 2 },
  arrowContainer: { alignItems: 'center', paddingVertical: 20 },
});
