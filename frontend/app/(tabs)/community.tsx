import AsyncStorage from '@react-native-async-storage/async-storage';
// Define your API_URL constant here or import from a local config file
const API_URL = 'http://localhost:3000'; // remove this

import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
type EventType = 'Legal' | 'Language' | 'Social' | 'Jobs';
type EventItem = { id: string; title: string; city: string; provinceOrState: string; type: EventType };
type UserProfile = { id: string; name: string; city: string; interests: string[]; fromCountry?: string };

// Sample events for each country
const sampleEvents: { [country: string]: EventItem[] } = {
  Canada: [
    { id: 'ca1', title: 'ESL Conversation Circle', city: 'Toronto', provinceOrState: 'ON', type: 'Language' },
    { id: 'ca2', title: 'Free Legal Aid Workshop', city: 'Vancouver', provinceOrState: 'BC', type: 'Legal' },
    { id: 'ca3', title: 'Job Networking Fair', city: 'Calgary', provinceOrState: 'AB', type: 'Jobs' },
    { id: 'ca4', title: 'Newcomer Social Meetup', city: 'Montreal', provinceOrState: 'QC', type: 'Social' },
    { id: 'ca5', title: 'Cultural Integration Workshop', city: 'Winnipeg', provinceOrState: 'MB', type: 'Social' },
    { id: 'ca6', title: 'Language Café', city: 'Ottawa', provinceOrState: 'ON', type: 'Language' },
    { id: 'ca7', title: 'Job Interview Skills Session', city: 'Toronto', provinceOrState: 'ON', type: 'Jobs' },
    { id: 'ca8', title: 'Legal Rights for Newcomers', city: 'Vancouver', provinceOrState: 'BC', type: 'Legal' },
    { id: 'ca9', title: 'Cultural Exchange Evening', city: 'Montreal', provinceOrState: 'QC', type: 'Social' },
    { id: 'ca10', title: 'Resume Workshop', city: 'Calgary', provinceOrState: 'AB', type: 'Jobs' },
  ],
  USA: [
    { id: 'us1', title: 'Immigrant Job Fair', city: 'New York', provinceOrState: 'NY', type: 'Jobs' },
    { id: 'us2', title: 'ESL Language Meetup', city: 'Los Angeles', provinceOrState: 'CA', type: 'Language' },
    { id: 'us3', title: 'Free Legal Aid Workshop', city: 'Houston', provinceOrState: 'TX', type: 'Legal' },
    { id: 'us4', title: 'Social Networking Night', city: 'Miami', provinceOrState: 'FL', type: 'Social' },
    { id: 'us5', title: 'Cultural Orientation Session', city: 'Chicago', provinceOrState: 'IL', type: 'Social' },
    { id: 'us6', title: 'Language Café', city: 'San Francisco', provinceOrState: 'CA', type: 'Language' },
    { id: 'us7', title: 'Job Interview Workshop', city: 'New York', provinceOrState: 'NY', type: 'Jobs' },
    { id: 'us8', title: 'Legal Rights for Immigrants', city: 'Los Angeles', provinceOrState: 'CA', type: 'Legal' },
    { id: 'us9', title: 'Social Meetup for Newcomers', city: 'Houston', provinceOrState: 'TX', type: 'Social' },
    { id: 'us10', title: 'Resume Building Session', city: 'Miami', provinceOrState: 'FL', type: 'Jobs' },
  ],
  UK: [
    { id: 'uk1', title: 'Language Café', city: 'London', provinceOrState: '', type: 'Language' },
    { id: 'uk2', title: 'Newcomer Networking', city: 'Manchester', provinceOrState: '', type: 'Social' },
    { id: 'uk3', title: 'Legal Aid Advice Session', city: 'Birmingham', provinceOrState: '', type: 'Legal' },
    { id: 'uk4', title: 'Job Skills Workshop', city: 'Leeds', provinceOrState: '', type: 'Jobs' },
    { id: 'uk5', title: 'Cultural Orientation Meetup', city: 'Glasgow', provinceOrState: '', type: 'Social' },
    { id: 'uk6', title: 'ESL Language Meetup', city: 'London', provinceOrState: '', type: 'Language' },
    { id: 'uk7', title: 'Resume Workshop', city: 'Manchester', provinceOrState: '', type: 'Jobs' },
    { id: 'uk8', title: 'Legal Rights for Newcomers', city: 'Birmingham', provinceOrState: '', type: 'Legal' },
    { id: 'uk9', title: 'Social Evening for Newcomers', city: 'Leeds', provinceOrState: '', type: 'Social' },
    { id: 'uk10', title: 'Job Interview Skills', city: 'Glasgow', provinceOrState: '', type: 'Jobs' },
  ],
};

export default function CommunityConnect() {
  const [country, setCountry] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventType | 'All'>('All');
  const [streaks, setStreaks] = useState<{ [key: string]: number }>({});
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [buddies, setBuddies] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const normalize = (raw?: string | null) => {
    if (!raw) return null;
    const lower = raw.trim().toLowerCase();
    if (lower.includes('canada')) return 'Canada';
    if (lower.includes('united states') || lower === 'usa' || lower.includes('united states of america')) return 'USA';
    if (lower.includes('uk') || lower.includes('united kingdom')) return 'UK';
    return null;
  };

  const initializeCountry = async () => {
    try {
      const stored = await AsyncStorage.getItem('destinationCountry');
      setCountry(normalize(stored) || 'Canada');
    } catch {
      setCountry('Canada');
    }
  };

  // --- THIS IS WHERE THE FETCHBUDDIES FUNCTION GOES ---
  const fetchBuddies = async () => {
    try {
      const userStr = await AsyncStorage.getItem('userProfile');
      if (!userStr) return;

      const user: UserProfile = JSON.parse(userStr);
      setCurrentUser(user);

      const res = await fetch(`${API_URL}/api/find-buddy/${user.id}`);
      if (!res.ok) {
        console.error('Failed to fetch buddies:', res.status);
        return;
      }

      const data: UserProfile[] = await res.json();

      // Sort buddies by shared interests
      const sorted = data.sort((a, b) => {
        const sharedA = a.interests.filter(i => user.interests.includes(i)).length;
        const sharedB = b.interests.filter(i => user.interests.includes(i)).length;
        return sharedB - sharedA;
      });

      setBuddies(sorted);
    } catch (error) {
      console.error('Error fetching buddies:', error);
    }
  };

  const loadData = async (currentCountry: string) => {
    if (!currentCountry) return;

    const streakData: { [key: string]: number } = {};
    for (const evt of sampleEvents[currentCountry]) {
      const s = await AsyncStorage.getItem(`streak_${evt.id}`);
      streakData[evt.id] = s ? Number(s) : 0;
    }
    setStreaks(streakData);

    const unreadStr = await AsyncStorage.getItem('unreadCounts');
    setUnreadCounts(unreadStr ? JSON.parse(unreadStr) : {});
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await initializeCountry();
        await fetchBuddies();
      };
      init();
    }, [])
  );

  useEffect(() => {
    if (!country) return;
    loadData(country);
    const interval = setInterval(() => loadData(country), 2000);
    return () => clearInterval(interval);
  }, [country]);

  const onRefresh = async () => {
    if (!country) return;
    setRefreshing(true);
    await loadData(country);
    await fetchBuddies();
    setRefreshing(false);
  };

  const events = country ? sampleEvents[country].filter(e => filter === 'All' || e.type === filter) : [];

  if (!country) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No country selected</Text>
        <TouchableOpacity style={styles.changeBtn} onPress={() => router.replace('/onboarding')}>
          <Text style={styles.changeBtnText}>Select Country</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>🌿 Community Connect - {country}</Text>

      {/* Buddy System */}
      {buddies.length > 0 && currentUser && (
        <View style={styles.buddySection}>
          <Text style={styles.subtitle}>🤝 Your Buddies in {currentUser.city}:</Text>
          {buddies.map(b => (
            <Text key={b.id} style={styles.buddyText}>
              • {b.name} ({b.interests.join(', ')}) – Shared Interests: {b.interests.filter(i => currentUser.interests.includes(i)).length}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.filterContainer}>
        {['All', 'Legal', 'Language', 'Social', 'Jobs'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f as EventType | 'All')}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f} {f !== 'All' && `(${events.filter(e => e.type === f).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {events.map(event => (
        <TouchableOpacity
          key={event.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: '/eventChat',
              params: { eventId: String(event.id), eventTitle: String(event.title) },
            })
          }
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.streakText}>🔥 {streaks[event.id] || 0}</Text>
          </View>
          <Text style={styles.eventLocation}>
            {event.city}
            {event.provinceOrState ? `, ${event.provinceOrState}` : ''}
          </Text>
          {unreadCounts[event.id] > 0 && <Text style={styles.unreadText}>💌 {unreadCounts[event.id]} unread</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  buddySection: { marginBottom: 16, padding: 12, backgroundColor: '#e0f2f1', borderRadius: 8 },
  buddyText: { fontSize: 14, marginBottom: 4 },
  filterContainer: { flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#888', marginRight: 8, marginBottom: 8 },
  filterButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filterText: { color: '#000' },
  filterTextActive: { color: '#fff' },
  card: { padding: 12, marginBottom: 12, borderRadius: 8, backgroundColor: '#f0f0f0' },
  eventTitle: { fontSize: 16, fontWeight: '600' },
  eventLocation: { fontSize: 14, color: '#555', marginTop: 4 },
  streakText: { fontSize: 14 },
  unreadText: { fontSize: 12, color: '#d32f2f', marginTop: 2 },
  changeBtn: { marginTop: 12, padding: 12, backgroundColor: '#2196F3', borderRadius: 8 },
  changeBtnText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});