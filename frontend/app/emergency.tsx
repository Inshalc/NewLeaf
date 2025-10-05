import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';

export default function EmergencyScreen() {
  const router = useRouter();

  const emergencyContacts = [
    {
      id: '1',
      title: 'Emergency Services',
      number: '911',
      description: 'Police, Fire, Ambulance',
      color: '#ff4444',
      
    },
    {
      id: '2',
      title: 'Suicide Prevention',
      number: '988',
      description: '24/7 Crisis Support',
      color: '#ff6b6b',
      icon: '💙'
    },
    {
      id: '3',
      title: 'Poison Control',
      number: '1-800-222-1222',
      description: '24/7 Poison Help',
      color: '#ffa726',
      icon: '⚠️'
    },
    {
      id: '4',
      title: 'Mental Health Crisis',
      number: '1-800-273-8255',
      description: 'National Helpline',
      color: '#42a5f5',
      icon: '🧠'
    },
    {
      id: '5',
      title: 'Domestic Violence',
      number: '1-800-799-7233',
      description: '24/7 Support Hotline',
      color: '#ab47bc',
      icon: '🛡️'
    },
    {
      id: '6',
      title: 'Child Abuse Hotline',
      number: '1-800-422-4453',
      description: 'Childhelp National',
      color: '#26a69a',
      icon: '👶'
    }
  ];

  const quickResources = [
    {
      id: '1',
      title: 'Nearest Hospital',
      description: 'Find closest emergency room',
      action: () => Linking.openURL('https://maps.google.com/?q=hospital'),
      icon: '🏥',
      color: '#ef5350'
    },
    {
      id: '2',
      title: 'Urgent Care',
      description: 'Locate urgent care facilities',
      action: () => Linking.openURL('https://maps.google.com/?q=urgent+care'),
      icon: '🚑',
      color: '#ff7043'
    },
    {
      id: '3',
      title: 'Police Station',
      description: 'Find local police department',
      action: () => Linking.openURL('https://maps.google.com/?q=police+station'),
      icon: '👮',
      color: '#42a5f5'
    },
    {
      id: '4',
      title: 'Pharmacy',
      description: '24-hour pharmacy locations',
      action: () => Linking.openURL('https://maps.google.com/?q=24+hour+pharmacy'),
      icon: '💊',
      color: '#66bb6a'
    }
  ];

  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(err => 
      console.error('Error opening phone app:', err)
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Emergency Quick Access</Text>
        <Text style={styles.subtitle}>Immediate help and support resources</Text>
      </View>

      {/* Emergency Contacts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
        <Text style={styles.sectionDescription}>
          Tap any number to call immediately. All services are available 24/7.
        </Text>
        
        <View style={styles.cardContainer}>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity 
              key={contact.id} 
              style={[styles.emergencyCard, { borderLeftColor: contact.color }]}
              onPress={() => callNumber(contact.number)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{contact.icon}</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{contact.title}</Text>
                  <Text style={styles.cardDescription}>{contact.description}</Text>
                </View>
              </View>
              <View style={styles.phoneSection}>
                <Text style={[styles.phoneNumber, { color: contact.color }]}>
                  {contact.number}
                </Text>
                <Text style={styles.callButton}>📞 Call</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Resources Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Resources</Text>
        <Text style={styles.sectionDescription}>
          Find nearby emergency services and facilities
        </Text>
        
        <View style={styles.resourcesGrid}>
          {quickResources.map((resource) => (
            <TouchableOpacity 
              key={resource.id} 
              style={[styles.resourceCard, { borderLeftColor: resource.color }]}
              onPress={resource.action}
            >
              <Text style={styles.resourceIcon}>{resource.icon}</Text>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
              <Text style={styles.resourceAction}>📍 Find Nearby</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Important Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important Information</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚨 In Case of Emergency</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Stay calm and assess the situation</Text>
            <Text style={styles.infoItem}>• Call 911 for life-threatening emergencies</Text>
            <Text style={styles.infoItem}>• Provide clear location and situation details</Text>
            <Text style={styles.infoItem}>• Follow operator instructions carefully</Text>
            <Text style={styles.infoItem}>• Do not hang up until told to do so</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Emergency Preparedness</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Keep important documents accessible</Text>
            <Text style={styles.infoItem}>• Have emergency contacts saved</Text>
            <Text style={styles.infoItem}>• Know your location and address</Text>
            <Text style={styles.infoItem}>• Keep medications list handy</Text>
            <Text style={styles.infoItem}>• Program emergency numbers in phone</Text>
          </View>
        </View>
      </View>

      {/* Safety Reminder */}
      <View style={styles.safetyReminder}>
        <Text style={styles.safetyTitle}>Your Safety Matters</Text>
        <Text style={styles.safetyText}>
          If you are in immediate danger, call 911 first. This app provides 
          supplementary resources but is not a replacement for emergency services.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f8f9fa',
  },
  backButton: { 
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backText: { 
    color: '#4CAF50', 
    fontSize: 16, 
    fontWeight: '600',
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#2e7d32', 
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardContainer: {
    marginBottom: 10,
  },
  emergencyCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  phoneSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  callButton: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  resourceTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  resourceAction: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 8,
  },
  infoList: {
    marginLeft: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  safetyReminder: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  safetyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#856404',
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});