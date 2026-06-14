import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import COLORS from '../constants/colors';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Loading Binge...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    marginTop: 15,
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5
  }
});

export default LoadingScreen;
