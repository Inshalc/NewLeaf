// app/eventChat.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Message = { id: string; text: string; sender: 'user' | 'mentor'; timestamp: number };

export default function EventChat() {
  const router = useRouter();

  // Using useLocalSearchParams for type-safe URL params
  const params = useLocalSearchParams<{ eventId: string; eventTitle: string }>();
  const eventId = params.eventId;
  const eventTitle = params.eventTitle;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mentorTyping, setMentorTyping] = useState(false);
  const [streak, setStreak] = useState(0);

  // Load messages and streak for this event
  const loadData = async () => {
    if (!eventId) return;
    const stored = await AsyncStorage.getItem(`messages_${eventId}`);
    setMessages(stored ? JSON.parse(stored) : []);

    const s = await AsyncStorage.getItem(`streak_${eventId}`);
    setStreak(s ? Number(s) : 0);

    // Reset unread count for this event
    const countsStr = await AsyncStorage.getItem('unreadCounts');
    const counts = countsStr ? JSON.parse(countsStr) : {};
    counts[eventId] = 0;
    await AsyncStorage.setItem('unreadCounts', JSON.stringify(counts));
  };

  useEffect(() => { loadData(); }, [eventId]);

  const sendMessage = async () => {
    if (!input.trim() || !eventId) return;

    const newMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: Date.now() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput('');
    await AsyncStorage.setItem(`messages_${eventId}`, JSON.stringify(updated));

    // Update streak
    const today = new Date().toDateString();
    const lastMsgDateStr = await AsyncStorage.getItem(`lastMessageDate_${eventId}`);
    if (lastMsgDateStr !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      await AsyncStorage.setItem(`streak_${eventId}`, newStreak.toString());
      await AsyncStorage.setItem(`lastMessageDate_${eventId}`, today);
    }

    // Simulate mentor reply
    setMentorTyping(true);
    setTimeout(async () => {
      const mentorMsg: Message = {
        id: Date.now().toString() + Math.random().toString(36),
        text: "I’m here to help 😊",
        sender: 'mentor',
        timestamp: Date.now(),
      };
      const newMessages = [...updated, mentorMsg];
      setMessages(newMessages);
      await AsyncStorage.setItem(`messages_${eventId}`, JSON.stringify(newMessages));

      // Update unread count
      const countsStr = await AsyncStorage.getItem('unreadCounts');
      const counts = countsStr ? JSON.parse(countsStr) : {};
      counts[eventId] = counts[eventId] ? counts[eventId] + 1 : 1;
      await AsyncStorage.setItem('unreadCounts', JSON.stringify(counts));

      setMentorTyping(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>{eventTitle || "Event"} 🔥 Streak: {streak}</Text>

        <FlatList
          data={messages.slice().reverse()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.mentorBubble]}>
              <Text style={{ color: item.sender === 'user' ? '#fff' : '#000' }}>{item.text}</Text>
            </View>
          )}
          inverted
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        />

        {mentorTyping && <Text style={styles.typingIndicator}>Mentor is typing...</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#e8f5e9' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#2e7d32' },
  messageBubble: { padding: 10, borderRadius: 10, marginVertical: 4, maxWidth: '80%' },
  userBubble: { backgroundColor: '#2e7d32', alignSelf: 'flex-end' },
  mentorBubble: { backgroundColor: '#c8e6c9', alignSelf: 'flex-start' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  sendButton: { backgroundColor: '#81c784', padding: 10, borderRadius: 20, marginLeft: 8 },
  sendText: { color: '#fff', fontWeight: 'bold' },
  typingIndicator: { fontStyle: 'italic', color: '#555', marginVertical: 4, textAlign: 'center' },
});