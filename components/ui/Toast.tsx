import React from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useUIStore } from '../../stores/ui.store'
import { Colors } from '../../constants/colors'

export function ToastContainer() {
  const { toasts } = useUIStore()

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map(toast => (
        <View key={toast.id} style={[styles.toast, styles[toast.type]]}>
          <Text style={styles.text}>{toast.message}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    padding: 14,
    borderRadius: 12,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: Colors.white,
    fontFamily: 'Syne_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  info:    { backgroundColor: Colors.ink },
  success: { backgroundColor: Colors.success },
  error:   { backgroundColor: Colors.error },
})
