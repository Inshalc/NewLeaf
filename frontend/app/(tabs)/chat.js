import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const backendURL = 'http://192.168.2.97:3000';

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

    const userMessage = message;
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setMessage("");
    setIsThinking(true);

    try {
      const res = await fetch(`${backendURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
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
    } finally {
      setIsThinking(false);
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.leafLogo}>🌿</Text>
        <Text style={styles.title}>NewLeaf Chat</Text>
        <Text style={styles.subtitle}>Your AI companion for growth and transformation</Text>
      </View>

      {/* Chat Messages - Reduced height to make space for input */}
      <View style={styles.chatFrame}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          style={styles.flatList}
        />
        {/* Thinking indicator */}
        {isThinking && (
          <View style={[styles.bubble, styles.botBubble, styles.thinkingBubble]}>
            <Text style={styles.botText}>Thinking...</Text>
          </View>
        )}
      </View>

      {/* Input Container - Moved much higher up */}
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
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 60,
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
  // Chat Frame - Reduced height
  chatFrame: {
    flex: 1,
    margin: 15,
    marginBottom: 180, // Reduced to make space for higher input
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  flatList: {
    flex: 1,
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
  thinkingBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f5e9",
    borderColor: "#4CAF50",
  },
  userText: { color: "white", fontSize: 16 },
  botText: { color: "#333", fontSize: 16 },
  // Input Container - Moved much higher up (closer to middle of screen)
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    position: "absolute",
    bottom: 90, // Moved up from bottom
    left: 0,
    right: 0,
    marginHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fdfdfd",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "white", fontSize: 16, fontWeight: "bold" },
});