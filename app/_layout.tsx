import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display'
import { Syne_400Regular, Syne_500Medium, Syne_600SemiBold } from '@expo-google-fonts/syne'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../stores/auth.store'
import { ToastContainer } from '../components/ui/Toast'
import { Colors } from '../constants/colors'

export default function RootLayout() {
  const { loadProfile, isLoading } = useAuthStore()

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Syne_400Regular,
    Syne_500Medium,
    Syne_600SemiBold,
  })

  useEffect(() => {
    loadProfile()
  }, [])

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.beige, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.coral} size="large" />
      </View>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="artist/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="booking/[artistId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="chat/[bookingId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="admin/index" />
      </Stack>
      <ToastContainer />
      <StatusBar style="dark" />
    </>
  )
}
