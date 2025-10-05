// app/(tabs)/index.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple type definitions without complex types
interface HealthTask {
  id: string;
  type: string;
  description: string;
  date: string;
  reminder?: boolean;
}

interface RoadmapStep {
  id: string;
  text: string;
}

// Roadmap steps per country
const roadmapSteps: Record<string, RoadmapStep[]> = {
  Canada: [
    { id: "sin", text: "Get SIN (Social Insurance Number)" },
    { id: "healthCard", text: "Apply for Health Card" },
    { id: "bank", text: "Open a Bank Account" },
    { id: "housing", text: "Find Housing" },
    { id: "school", text: "Enroll Kids in School" },
    { id: "license", text: "Get Driver's License / Transit Card" },
    { id: "services", text: "Explore Newcomer Services" },
  ],
  USA: [
    { id: "ssn", text: "Apply for SSN" },
    { id: "health", text: "Get Health Insurance" },
    { id: "bank", text: "Open a Bank Account" },
    { id: "stateID", text: "Apply for State ID / Driver's License" },
    { id: "school", text: "Enroll Kids in School" },
    { id: "housing", text: "Set Up Housing" },
    { id: "services", text: "Know Key Services" },
  ],
  UK: [
    { id: "ni", text: "Apply for National Insurance Number" },
    { id: "gp", text: "Register with GP" },
    { id: "bank", text: "Open a Bank Account" },
    { id: "housing", text: "Get Housing / Council Registration" },
    { id: "school", text: "Enroll Kids in School" },
    { id: "sim", text: "Apply for UK SIM Card & Transport" },
    { id: "services", text: "Know Newcomer Services" },
  ],
};

export default function HomeScreen() {
  const router = useRouter();
  const [healthTasks, setHealthTasks] = useState<HealthTask[]>([]);
  const [country, setCountry] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [userInfo, setUserInfo] = useState({ name: '', email: '', initial: '' });

  useEffect(() => {
    loadHealthTasks();
    loadChecklist();
    loadUserInfo();
    
    const interval = setInterval(() => {
      loadHealthTasks();
      loadChecklist();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadHealthTasks = async () => {
    try {
      const allHealthTasks = await AsyncStorage.getItem('all_health_tasks');
      if (allHealthTasks) {
        const tasks: HealthTask[] = JSON.parse(allHealthTasks);
        const upcomingTasks = tasks
          .filter((task) => new Date(task.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setHealthTasks(upcomingTasks);
      } else {
        setHealthTasks([]);
      }
    } catch (error) {
      console.error('Error loading health tasks:', error);
      setHealthTasks([]);
    }
  };

  const loadChecklist = async () => {
    try {
      const savedCountry = await AsyncStorage.getItem('destinationCountry');
      setCountry(savedCountry);

      if (savedCountry) {
        const savedChecklist = await AsyncStorage.getItem(`checklist-${savedCountry}`);
        if (savedChecklist) {
          const checklistData: Record<string, boolean> = JSON.parse(savedChecklist);
          setChecked(checklistData);
        }
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const name = (await AsyncStorage.getItem('userName')) || '';
      const email = (await AsyncStorage.getItem('userEmail')) || '';
      const initial = (await AsyncStorage.getItem('userInitial')) || name.charAt(0).toUpperCase() || 'U';
      
      setUserInfo({ name, email, initial });
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const toggleStep = async (id: string) => {
    if (!country) return;
    const newChecked = { ...checked, [id]: !checked[id] };
    setChecked(newChecked);
    await AsyncStorage.setItem(`checklist-${country}`, JSON.stringify(newChecked));
  };

  const handleSignOut = () => {
    console.log('Sign out button pressed');
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Starting sign out process...');
              // Clear all user data from AsyncStorage
              await AsyncStorage.multiRemove([
                'userToken',
                'userName',
                'userEmail',
                'userInitial',
                'destinationCountry',
                'userLoggedIn',
                'all_health_tasks',
                'checklist-Canada',
                'checklist-USA', 
                'checklist-UK'
              ]);
              
              console.log('User data cleared, navigating to signup...');
              // Navigate back to signup screen
              router.replace('/SignUp');
            } catch (error) {
              console.error('Error during sign out:', error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const steps = country ? roadmapSteps[country] : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Profile Header */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInfo.initial}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userInfo.name || 'New User'}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={handleSignOut}
        >
          <Text style={styles.profileButtonText}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>🌱 Welcome to NewLeaf</Text>
        <Text style={styles.subtitle}>Your settlement journey starts here</Text>
      </View>

      {/* Health Appointments Section */}
      {healthTasks.length > 0 && (
        <View style={styles.healthSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🩺 Upcoming Health Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/SettlementDashboard')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.healthScroll}
            contentContainerStyle={styles.healthScrollContent}
          >
            {healthTasks.map((task) => (
              <View key={task.id} style={styles.healthCard}>
                <Text style={styles.healthType}>{task.type}</Text>
                <Text style={styles.healthDescription}>{task.description}</Text>
                <Text style={styles.healthDate}>{formatDate(task.date)}</Text>
                {task.reminder && <Text style={styles.reminderText}>🔔 Reminder Set</Text>}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Checklist Section */}
      {country && (
        <View style={styles.checklistSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 {country} Settlement Checklist</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setChecked({});
                AsyncStorage.removeItem(`checklist-${country}`);
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.checklistContainer}>
            {steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.checklistItem,
                  checked[step.id] && styles.checklistItemDone,
                  index === steps.length - 1 && styles.lastChecklistItem
                ]}
                onPress={() => toggleStep(step.id)}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    checked[step.id] && styles.checkboxChecked
                  ]}>
                    {checked[step.id] && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
                <Text style={[
                  styles.checklistText,
                  checked[step.id] && styles.checklistTextDone
                ]}>
                  {step.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Quick Access Grid */}
      <View style={styles.grid}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/SettlementDashboard')}>
            <Text style={styles.cardIcon}>💰</Text>
            <Text style={styles.cardTitle}>Expense Tracker</Text>
            <Text style={styles.cardDescription}>Track expenses and health tasks</Text>
            {healthTasks.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{healthTasks.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/community')}>
            <Text style={styles.cardIcon}>🪷</Text>
            <Text style={styles.cardTitle}>Community</Text>
            <Text style={styles.cardDescription}>Connect with buddies and events</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/upload')}>
            <Text style={styles.cardIcon}>📂</Text>
            <Text style={styles.cardTitle}>Upload</Text>
            <Text style={styles.cardDescription}>Upload documents and files</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/games')}>
            <Text style={styles.cardIcon}>🎬</Text>
            <Text style={styles.cardTitle}>Learning Games</Text>
            <Text style={styles.cardDescription}>Learn through interactive games</Text>
          </TouchableOpacity>
        </View>

        {/* Row 3 */}
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/chat')}>
            <Text style={styles.cardIcon}>꩜</Text>
            <Text style={styles.cardTitle}>AI Chatbot</Text>
            <Text style={styles.cardDescription}>Get instant help and answers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.emergencyCard]} onPress={() => router.push('/emergency')}>
            <Text style={styles.cardIcon}>🚨</Text>
            <Text style={styles.cardTitle}>Emergency</Text>
            <Text style={styles.cardDescription}>Hotlines and urgent support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0fdf4' 
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
  },
  profileButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileButtonText: {
    fontSize: 22,
  },
  headerContainer: {
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#2e7d32', 
    marginBottom: 12, 
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 18, 
    color: '#388e3c', 
    marginBottom: 8, 
    textAlign: 'center',
    lineHeight: 26,
  },
  healthSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 4,
  },
  checklistSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    flex: 1,
  },
  seeAllText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  checklistContainer: {
    marginTop: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastChecklistItem: {
    borderBottomWidth: 0,
  },
  checklistItemDone: {
    backgroundColor: '#f8f9fa',
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checklistText: {
    fontSize: 17,
    color: '#333',
    lineHeight: 24,
    flex: 1,
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  healthScroll: {
    marginHorizontal: -8,
  },
  healthScrollContent: {
    paddingHorizontal: 4,
  },
  healthCard: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 16,
    marginRight: 16,
    width: 240,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  healthType: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 8,
  },
  healthDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  healthDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  grid: {
    marginHorizontal: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: { 
    width: '48%', 
    backgroundColor: 'white', 
    padding: 24, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    marginHorizontal: 2,
  },
  emergencyCard: {
    borderColor: '#ff4444',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
  cardIcon: { 
    fontSize: 40, 
    textAlign: 'center', 
    marginBottom: 16,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#2e7d32',
    marginBottom: 8,
  },
  cardDescription: { 
    fontSize: 14, 
    textAlign: 'center', 
    color: '#666', 
    lineHeight: 20,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
});