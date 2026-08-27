import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 88,
          paddingTop: 10,
          paddingBottom: 12,
        },

        tabBarBackground: () => (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#E9DDC8',
            }}
          >
            <Image
              source={require('../../assets/images/torn-paper-edge.png')}
              style={{
                position: 'absolute',
                top: -18,
                left: 0,
                width: '100%',
                height: 24,
              }}
              resizeMode="stretch"
            />
          </View>
        ),

        tabBarActiveTintColor: '#5A4435',
        tabBarInactiveTintColor: '#8C8377',

        tabBarLabelStyle: {
          fontSize: 12,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/home-icon.png')}
              style={{
                width: 42,
                height: 42,
                opacity: focused ? 1 : 0.55,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/archive-icon.png')}
              style={{
                width: 42,
                height: 42,
                opacity: focused ? 1 : 0.55,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
  name="saved"
  options={{
    title: 'Saved',
    tabBarIcon: ({ focused }) => (
      <Image
        source={require('../../assets/images/saved-icon.png')}
        style={{
          width: 42,
          height: 42,
          opacity: focused ? 1 : 0.55,
        }}
        resizeMode="contain"
      />
    ),
  }}
/>

      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/about-icon.png')}
              style={{
                width: 42,
                height: 42,
                opacity: focused ? 1 : 0.55,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}