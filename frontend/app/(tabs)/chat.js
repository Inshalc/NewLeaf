import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Replace with your laptop's IP
  const backendURL =
    Platform.OS === "android"
      ? "http://10.0.2.2:3000" // Android Emulator
      : "http://localhost:3000"; // iOS Simulator
    
  useEffect(() => {
    setMessages([
      { text: "👋 Welcome to the NewLeaf Chatbot!", sender: "bot" },
      { text: "Ask me anything, or try these:", sender: "bot" },
      {
        text: "• What services does NewLeaf offer?\n• How do I upload a document?\n• Tell me about the community section.",
        sender: "bot",
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { text: message, sender: "user" }]);
    setMessage("");

    try {
      const res = await fetch(`${backendURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { text: data.reply || "⚠️ No reply from bot", sender: "bot" },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Error connecting to chatbot.", sender: "bot" },
      ]);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.sender === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={item.sender === "user" ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header - Same as Upload Page */}
      <View style={styles.header}>
        <Text style={styles.leafLogo}>🌿</Text>
        <Text style={styles.title}>NewLeaf Chat</Text>
        <Text style={styles.subtitle}>Your AI companion for growth and transformation</Text>
      </View>

      {/* Rest of your original chat code remains the same */}
      <View style={styles.chatFrame}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f0f9f0" 
  },
  // Header - Same as Upload Page
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
    paddingVertical: 20,
  },
  leafLogo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5a3d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5a8c6d',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  // Your original chat styles remain the same
  chatFrame: {
    flex: 1,
    margin: 15,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 80,
  },
  bubble: {
    padding: 12,
    marginVertical: 6,
    maxWidth: "75%",
    borderRadius: 20,
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#4CAF50" },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userText: { color: "white", fontSize: 16 },
  botText: { color: "#333", fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fdfdfd",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "white", fontSize: 18, fontWeight: "bold" },
});