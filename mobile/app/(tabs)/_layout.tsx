/*
** EPITECH PROJECT, 2025
** Area-miror
** File description:
** _layout
*/

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.inputBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.link,
        tabBarInactiveTintColor: '#A69CAC',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <Ionicons name="apps-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}