import { useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../stores/auth.store'
import { Colors } from '../constants/colors'

export default function SplashScreen() {
  const { session, profile } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session && profile?.onboarding_complete) {
        router.replace('/(tabs)/home')
      } else if (session && !profile?.onboarding_complete) {
        router.replace('/(onboarding)/complete-profile')
      } else {
        router.replace('/(onboarding)/welcome')
      }
    }, 1800)
    return () => clearTimeout(timer)
  }, [session, profile])

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TATTOO</Text>
      <Text style={styles.logoHub}>HUB</Text>
      <Text style={styles.tagline}>L'art sur ta peau, simplifié.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige, alignItems: 'center', justifyContent: 'center' },
  logo: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 52, color: Colors.ink, letterSpacing: 6 },
  logoHub: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 52, color: Colors.coral, letterSpacing: 6, marginTop: -16 },
  tagline: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.muted, marginTop: 20, letterSpacing: 1 },
})
