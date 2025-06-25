import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LearnScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="school" size={80} color="#D1D5DB" />
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.subtitle}>Islamic Education Hub</Text>
        <Text style={styles.description}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default LearnScreen;