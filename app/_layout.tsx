import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
<Stack.Screen
  name="devotional/[id]"
  options={{
    title: '',
    headerBackTitle: 'Archive',
    headerTintColor: '#35322D',
    headerStyle: {
      backgroundColor: '#F4EFE6',
    },
    headerShadowVisible: false,
  }}
/>
  <Stack.Screen
    name="modal"
    options={{ presentation: 'modal', title: 'Modal' }}
  />
</Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
