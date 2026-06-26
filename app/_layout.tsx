import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { View, ActivityIndicator } from "react-native"
import { useAuthStore } from "../stores/auth.store"
import { ToastContainer } from "../components/ui/Toast"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function RootLayout() {
  const { loadProfile, isLoading } = useAuthStore()

  useEffect(() => {
    loadProfile()
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F3EF", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#E8573A" size="large" />
      </View>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="artist/[id]" />
        <Stack.Screen name="booking/[artistId]" />
        <Stack.Screen name="chat/[bookingId]" />
      </Stack>
      <ToastContainer />
      <StatusBar style="dark" />
    </QueryClientProvider>
  )
}
