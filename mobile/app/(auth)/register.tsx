import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { COLORS, FONTS } from '@/constants/theme';
import { register } from '@/services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);

    if (result.success) {
      Alert.alert('Succès', 'Compte créé ! Connectez-vous maintenant.');
      router.replace('/(auth)/login');
    } else {
      Alert.alert('Erreur', result.error || "L'inscription a échoué");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Nouveau ?</Text>
      <Text style={styles.h2}>Inscription</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'CHARGEMENT...' : 'CRÉER MON COMPTE'}</Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Déjà inscrit ? Connexion</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
  },
  h1: { ...FONTS.h1, color: COLORS.h1, textAlign: 'left' },
  h2: { ...FONTS.h2, color: COLORS.h2, textAlign: 'left', marginBottom: 50 },
  form: { gap: 20 },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.link,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 16 },
  linkButton: { alignItems: 'center', marginTop: 20 },
  linkText: { ...FONTS.link, color: COLORS.link, textDecorationLine: 'underline' },
});
