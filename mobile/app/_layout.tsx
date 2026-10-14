import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { Colors } from '../src/constants/theme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootNavigation() {
  const { user, token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      // Redirect to welcome screen if not authenticated
      router.replace('/(auth)/welcome');
    } else if (token && inAuthGroup) {
      // Redirect to dashboard tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [token, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Sign In', headerBackTitle: 'Back' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Create Account', headerBackTitle: 'Back' }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ title: 'Reset Password', headerBackTitle: 'Back' }} />
        <Stack.Screen name="mentor/[id]" options={{ title: 'Mentor Profile', headerBackTitle: 'Explore' }} />
        <Stack.Screen name="booking/new" options={{ title: 'Book Session', presentation: 'card' }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Session Details' }} />
        <Stack.Screen name="booking/review" options={{ title: 'Leave Review', presentation: 'modal' }} />
        <Stack.Screen name="recommendations" options={{ title: 'AI Recommendations' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="profile/skills" options={{ title: 'Skills & Interests' }} />
        <Stack.Screen name="admin/index" options={{ title: 'Admin Suite' }} />
        <Stack.Screen name="admin/users" options={{ title: 'Manage Users' }} />
        <Stack.Screen name="admin/sessions" options={{ title: 'Manage Sessions' }} />
        <Stack.Screen name="admin/skills" options={{ title: 'Manage Skills' }} />
        <Stack.Screen name="admin/reports" options={{ title: 'Reports & Moderation' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RootNavigation />
      </NotificationProvider>
    </AuthProvider>
  );
}
