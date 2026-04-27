import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { aiAPI } from '../api/services';

const AIScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your AgriGita Assistant. How can I help your fields today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI thinking
    setTimeout(() => {
      let response = "I'm analyzing your request. All sensors in Karnataka look stable.";
      if (input.toLowerCase().includes('valve')) response = "I suggest checking Valve B; it shows slightly lower flow.";
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'ai' }]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AgriGita AI Assistant</Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatContainer}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.msgText, msg.sender === 'user' ? styles.userText : styles.aiText]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your field..."
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { fontSize: 20, fontWeight: '700', color: '#f8fafc', textAlign: 'center' },
  chatContainer: { padding: 16, paddingBottom: 20 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  aiBubble: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  userBubble: { backgroundColor: '#166534', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  msgText: { fontSize: 15 },
  aiText: { color: '#f1f5f9' },
  userText: { color: '#f0fdf4' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#1e293b', alignItems: 'center' },
  input: { flex: 1, height: 45, backgroundColor: '#0f172a', borderRadius: 20, paddingHorizontal: 16, color: '#f8fafc' },
  sendBtn: { marginLeft: 12, width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' }
});

export default AIScreen;
