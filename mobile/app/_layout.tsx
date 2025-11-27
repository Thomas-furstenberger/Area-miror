/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** _layout
*/

import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      
      <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
      
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      
      <Stack.Screen name="create_area" options={{ presentation: 'card' }} />
    </Stack>
  );
}