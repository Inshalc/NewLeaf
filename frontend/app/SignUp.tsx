// app/signup.tsx - Updated with login functionality
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // Toggle between login/signup

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill all fields');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      alert('Password should be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // Save user information
      await AsyncStorage.setItem('userToken', 'user-authenticated');
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userInitial', name.charAt(0).toUpperCase()); // Save first letter for avatar
      
      console.log('✅ User signed up:', { name, email });
      
      // Navigate to onboarding
      router.replace('/onboarding');
    } catch (error) {
      console.error('❌ Signup error:', error);
      alert('Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      // For demo purposes, we'll simulate login with any credentials
      // In a real app, you'd verify against your backend
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedName = await AsyncStorage.getItem('userName');
      
      if (savedEmail === email) {
        // User exists - log them in
        await AsyncStorage.setItem('userToken', 'user-authenticated');
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userName', savedName || 'User');
        await AsyncStorage.setItem('userInitial', (savedName || 'U').charAt(0).toUpperCase());
        
        console.log('✅ User logged in:', { email });
        
        // Navigate to home screen directly
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          "Account Not Found",
          "No account found with this email. Would you like to create a new account?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Sign Up",
              onPress: () => setIsLogin(false)
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Error logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🌿 {isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to your NewLeaf account' : 'Join the NewLeaf community'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            secureTextEntry
          />
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#999"
              secureTextEntry
            />
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleLink}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Demo note for testing */}
          <View style={styles.demoNote}>
            <Text style={styles.demoText}>
              💡 Demo: {isLogin ? 'Use any email/password to test login' : 'Create an account to get started'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#2e7d32', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#388e3c', 
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: { 
    height: 56, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 16, 
    backgroundColor: '#f8f9fa',
    fontSize: 16,
  },
  button: { 
    backgroundColor: '#2e7d32', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8,
  },
  buttonDisabled: { 
    opacity: 0.7 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  toggleLink: { 
    marginTop: 16,
    padding: 12,
  },
  toggleText: { 
    textAlign: 'center', 
    color: '#2e7d32', 
    fontWeight: '600', 
    fontSize: 16 
  },
  demoNote: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  demoText: {
    fontSize: 12,
    color: '#2e7d32',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});