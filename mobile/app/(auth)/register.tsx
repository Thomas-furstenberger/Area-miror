/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** register
*/

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { COLORS, FONTS } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Nouveau ?</Text>
      <Text style={styles.h2}>Inscription</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#999"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer mot de passe"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>CRÉER MON COMPTE</Text>
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