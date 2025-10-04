// app/onboarding.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const commonCountries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada',
  'China', 'Colombia', 'Egypt', 'France', 'Germany', 'India', 'Indonesia', 'Iran', 'Italy', 'Japan',
  'Kenya', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'Nigeria', 'Pakistan', 'Philippines', 'Poland', 'Russia',
  'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 'United States'
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [showOriginPicker, setShowOriginPicker] = useState(false);

  useEffect(() => {
    const checkDestination = async () => {
      const savedDestination = await AsyncStorage.getItem('destinationCountry');
      if (savedDestination) {
        router.replace('/country'); // skip onboarding if already set
      }
    };
    checkDestination();
  }, [router]);

  const handleContinue = async () => {
    if (!originCountry || !destinationCountry) {
      alert('Please select both origin and destination countries');
      return;
    }
    try {
      await AsyncStorage.setItem('originCountry', originCountry);
      await AsyncStorage.setItem('destinationCountry', destinationCountry);
      router.replace('/country'); // go to country checklist page
    } catch (error) {
      console.log('Error saving countries:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿 Welcome to NewLeaf</Text>
      <Text style={styles.subtitle}>Select your origin and destination countries</Text>

      <Text style={styles.label}>Origin Country</Text>
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setShowOriginPicker(true)}
      >
        <Text>{originCountry || 'Choose your origin country'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Destination</Text>
      <View style={styles.destinationOptions}>
        {['Canada', 'USA', 'UK'].map((country) => (
          <TouchableOpacity
            key={country}
            style={[
              styles.destinationButton,
              destinationCountry === country && styles.selectedDestination
            ]}
            onPress={() => setDestinationCountry(country)}
          >
            <Text
              style={[
                styles.destinationText,
                destinationCountry === country && styles.selectedDestinationText
              ]}
            >
              {country}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!originCountry || !destinationCountry) && { opacity: 0.5 }
        ]}
        onPress={handleContinue}
        disabled={!originCountry || !destinationCountry}
      >
        <Text style={styles.continueText}>Continue ➡️</Text>
      </TouchableOpacity>

      {/* Origin Picker Modal */}
      <Modal visible={showOriginPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Country</Text>
            <ScrollView>
              {commonCountries.map((country) => (
                <TouchableOpacity
                  key={country}
                  style={styles.countryItem}
                  onPress={() => {
                    setOriginCountry(country);
                    setShowOriginPicker(false);
                  }}
                >
                  <Text>{country}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowOriginPicker(false)}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f0fdf4' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#2e7d32' },
  dropdownBox: { borderWidth: 1, borderColor: '#a3b18a', borderRadius: 8, padding: 12, marginBottom: 16 },
  destinationOptions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  destinationButton: { backgroundColor: '#e8f5e9', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  selectedDestination: { backgroundColor: '#2e7d32' },
  destinationText: { color: '#1b5e20', fontWeight: '600' },
  selectedDestinationText: { color: 'white', fontWeight: 'bold' },
  continueButton: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center' },
  continueText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '80%', maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  countryItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeButton: { backgroundColor: '#2e7d32', padding: 10, marginTop: 10, borderRadius: 8 }
});
