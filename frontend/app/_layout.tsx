// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialScreen, setInitialScreen] = useState('(tabs)');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Clear for testing (remove in production)
      // await AsyncStorage.clear();
      
      const userToken = await AsyncStorage.getItem('userToken');
      const destinationCountry = await AsyncStorage.getItem('destinationCountry');
      
      console.log('🔐 Auth Status:', { 
        hasToken: !!userToken, 
        hasDestination: !!destinationCountry 
      });

      if (!userToken) {
        console.log('🚀 Going to SignUp');
        setInitialScreen('signup');
      } else if (!destinationCountry) {
        console.log('🎯 Going to Onboarding');
        setInitialScreen('onboarding');
      } else {
        console.log('🏠 Going to Homepage');
        setInitialScreen('(tabs)');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setInitialScreen('signup');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{ marginTop: 16, color: '#2e7d32' }}>Loading NewLeaf...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signup" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="SettlementDashboard" />
      <Stack.Screen name="emergency" />
    </Stack>
  );
}