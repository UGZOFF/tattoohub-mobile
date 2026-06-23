import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'
import { Colors } from '../../constants/colors'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.coral} size="small" />
        : <Text style={[styles.label, variant !== 'primary' && styles.labelDark]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary:   { backgroundColor: Colors.coral },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.coral },
  ghost:     { backgroundColor: 'transparent' },
  disabled:  { opacity: 0.5 },
  label:     { fontFamily: 'Syne_600SemiBold', fontSize: 16, color: Colors.white },
  labelDark: { color: Colors.coral },
})
