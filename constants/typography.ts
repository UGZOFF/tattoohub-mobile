import { StyleSheet } from 'react-native'
import { Colors } from './colors'

export const Typography = StyleSheet.create({
  h1: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: Colors.ink, lineHeight: 40 },
  h2: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Colors.ink, lineHeight: 32 },
  h3: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 20, color: Colors.ink, lineHeight: 28 },
  body: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.ink, lineHeight: 24 },
  bodyMuted: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.muted, lineHeight: 24 },
  label: { fontFamily: 'Syne_500Medium', fontSize: 14, color: Colors.ink, lineHeight: 20 },
  small: { fontFamily: 'Syne_400Regular', fontSize: 12, color: Colors.muted, lineHeight: 16 },
  button: { fontFamily: 'Syne_600SemiBold', fontSize: 16, color: Colors.white, lineHeight: 24 },
  pill: { fontFamily: 'Syne_500Medium', fontSize: 12, color: Colors.ink, lineHeight: 16 },
})

export const TATTOO_STYLES = [
  'Réaliste', 'Old School', 'Géométrique', 'Blackwork',
  'Japonais', 'Minimaliste', 'Aquarelle', 'Tribal', 'Neo-Traditionnel', 'Fine Line'
]

export const BODY_ZONES = [
  'Avant-bras', 'Bras entier', 'Épaule', 'Dos', 'Torse',
  'Mollet', 'Cuisse', 'Cheville', 'Nuque', 'Côtes', 'Main', 'Pied'
]
