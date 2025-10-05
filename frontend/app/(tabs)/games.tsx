import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import CanadaGames from '../CanadaGames';  // Changed from './CanadaGames'
import UKGames from '../UKGames';          // Changed from './UKGames'
import USAGames from '../USAGames';        // Changed from './USAGames'

export default function GamesScreen() {
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountry();
  }, []);

  const loadCountry = async () => {
    try {
      const destinationCountry = await AsyncStorage.getItem('destinationCountry');
      setCountry(destinationCountry);
    } catch (error) {
      console.error('Error loading country:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>
    );
  }

  const renderGames = () => {
    if (!country) {
      return (
        <View style={styles.noCountryContainer}>
          <Text style={styles.noCountryText}>No country selected</Text>
          <Text style={styles.noCountrySubtext}>Please complete onboarding first</Text>
        </View>
      );
    }

    const countryLower = country.toLowerCase();
    
    if (countryLower.includes('canada')) {
      return <CanadaGames />;
    } else if (countryLower.includes('usa') || countryLower.includes('united states')) {
      return <USAGames />;
    } else if (countryLower.includes('uk') || countryLower.includes('united kingdom')) {
      return <UKGames />;
    } else {
      return (
        <View style={styles.noGamesContainer}>
          <Text style={styles.noGamesText}>Games for {country}</Text>
          <Text style={styles.noGamesSubtext}>Coming soon! For now, try our Canada, USA, or UK games.</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Learning Games</Text>
      <Text style={styles.subtitle}>
        {country ? `Games for ${country}` : 'Select a country to play games'}
      </Text>
      {renderGames()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginTop: 20, marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#388e3c', textAlign: 'center', marginBottom: 20 },
  loadingText: { fontSize: 16, color: '#388e3c', textAlign: 'center', marginTop: 10 },
  noCountryContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noCountryText: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  noCountrySubtext: { fontSize: 16, color: '#388e3c', textAlign: 'center' },
  noGamesContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noGamesText: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  noGamesSubtext: { fontSize: 16, color: '#388e3c', textAlign: 'center' },
});