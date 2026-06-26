import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { useAuthStore } from "../../stores/auth.store"

export default function MessagesScreen() {
  const { session } = useAuthStore()
  const { data: conversations } = useQuery({
    queryKey: ["conversations", session?.user.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings")
        .select("*, artists(stage_name, avatar_url)")
        .eq("client_id", session!.user.id)
        .in("status", ["confirmed", "deposit_paid", "in_progress", "completed"])
        .order("created_at", { ascending: false })
      return data || []
    },
    enabled: !!session,
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations || []}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/chat/${item.id}`)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{item.artists?.stage_name?.[0] ?? "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.artists?.stage_name}</Text>
              <Text style={styles.preview}>Réservation confirmée 📅</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Text style={{ fontSize: 40 }}>💬</Text>
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptyDesc}>Tes conversations apparaîtront ici après une réservation.</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  title: { fontSize: 28, fontWeight: "800", color: "#0F0E17", padding: 24, paddingTop: 60 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#FDFAF5", borderRadius: 14, padding: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#E8573A20", alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 20, fontWeight: "800", color: "#E8573A" },
  name: { fontWeight: "700", fontSize: 15, color: "#0F0E17" },
  preview: { fontSize: 13, color: "#8C8A84", marginTop: 2 },
  emptyTitle: { fontWeight: "700", fontSize: 18, color: "#0F0E17", marginTop: 12 },
  emptyDesc: { fontSize: 14, color: "#8C8A84", textAlign: "center", paddingHorizontal: 40, lineHeight: 22, marginTop: 8 },
})