import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Success() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  useEffect(() => {
    const saveTokenAndRedirect = async () => {
      if (token) {
        try {
          const tokenValue = typeof token === 'string' ? token : token[0];

          await AsyncStorage.setItem('user_token', tokenValue);
          console.log('Token sauvegardé avec succès');

          setTimeout(() => {
            router.replace('/(tabs)');
          }, 100);
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du token:', error);
        }
      } else {
        console.warn('Aucun token trouvé dans les paramètres URL');
      }
    };

    saveTokenAndRedirect();
  }, [token, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Connexion réussie, redirection en cours...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
