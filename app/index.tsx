import { useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useAuthStore } from "../stores/auth.store"

export default function SplashScreen() {
  const { session, profile } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session && profile?.onboarding_complete) {
        router.replace("/(tabs)/home")
      } else if (session) {
        router.replace("/(onboarding)/complete-profile")
      } else {
        router.replace("/(onboarding)/welcome")
      }
    }, 1500)
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
  container: { flex: 1, backgroundColor: "#F5F3EF", alignItems: "center", justifyContent: "center" },
  logo: { fontSize: 52, fontWeight: "800", color: "#0F0E17", letterSpacing: 6 },
  logoHub: { fontSize: 52, fontWeight: "800", color: "#E8573A", letterSpacing: 6, marginTop: -10 },
  tagline: { fontSize: 16, color: "#8C8A84", marginTop: 20 },
})