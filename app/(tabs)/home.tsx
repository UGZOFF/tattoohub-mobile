import { useState, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { useAuthStore } from "../../stores/auth.store"

const STYLES = ["Réaliste", "Old School", "Géométrique", "Blackwork", "Japonais", "Minimaliste", "Aquarelle", "Tribal"]

async function fetchArtists(query: string, styles: string[]) {
  let req = supabase.from("artists").select("*").eq("is_active", true)
  if (query) req = req.ilike("stage_name", `%${query}%`)
  if (styles.length) req = req.contains("styles", styles)
  const { data, error } = await req.order("rating", { ascending: false }).limit(30)
  if (error) throw error
  return data || []
}

function ArtistCard({ artist, onPress }: { artist: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarLetter}>{artist.stage_name?.[0] ?? "?"}</Text>
      </View>
      <View style={styles.cardInfo}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.cardName}>{artist.stage_name}</Text>
          {artist.is_verified && <Text style={styles.verified}>✓</Text>}
          {artist.early_adopter && <Text style={styles.early}>🔥</Text>}
        </View>
        <Text style={styles.cardCity}>{artist.city}</Text>
        <View style={styles.styleRow}>
          {(artist.styles || []).slice(0, 3).map((s: string) => (
            <View key={s} style={styles.stylePill}><Text style={styles.styleText}>{s}</Text></View>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={styles.rating}>{artist.rating > 0 ? `★ ${Number(artist.rating).toFixed(1)}` : "Nouveau"}</Text>
          {artist.hourly_rate && <Text style={styles.price}>{artist.hourly_rate}€/h</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { profile } = useAuthStore()
  const [search, setSearch] = useState("")
  const [activeStyles, setActiveStyles] = useState<string[]>([])
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const { data: artists, isLoading, refetch } = useQuery({
    queryKey: ["artists", debouncedSearch, activeStyles],
    queryFn: () => fetchArtists(debouncedSearch, activeStyles),
  })

  let timeout: any
  const handleSearch = (text: string) => {
    setSearch(text)
    clearTimeout(timeout)
    timeout = setTimeout(() => setDebouncedSearch(text), 300)
  }

  const toggleStyle = (s: string) => setActiveStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋</Text>
        <Text style={styles.title}>Trouve ton artiste</Text>
      </View>
      <TextInput style={styles.search} value={search} onChangeText={handleSearch} placeholder="Rechercher..." placeholderTextColor="#8C8A84" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {STYLES.map(s => (
          <TouchableOpacity key={s} style={[styles.filterPill, activeStyles.includes(s) && styles.filterPillActive]} onPress={() => toggleStyle(s)}>
            <Text style={[styles.filterText, activeStyles.includes(s) && styles.filterTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#E8573A" size="large" />
        </View>
      ) : (
        <FlatList
          data={artists || []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ArtistCard artist={item} onPress={() => router.push(`/artist/${item.id}`)} />}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#E8573A" />}
          ListEmptyComponent={<Text style={styles.empty}>Aucun artiste trouvé.{"\n"}Sois le premier à rejoindre ! 🎨</Text>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  greeting: { fontSize: 14, color: "#8C8A84" },
  title: { fontSize: 28, fontWeight: "800", color: "#0F0E17", marginTop: 4 },
  search: { marginHorizontal: 20, height: 48, backgroundColor: "#FDFAF5", borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: "#0F0E17", borderWidth: 1, borderColor: "#E5E3DF" },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FDFAF5", borderWidth: 1, borderColor: "#E5E3DF" },
  filterPillActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  filterText: { fontSize: 13, fontWeight: "500", color: "#0F0E17" },
  filterTextActive: { color: "#fff" },
  card: { backgroundColor: "#FDFAF5", borderRadius: 16, padding: 16, flexDirection: "row", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardAvatar: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#E8573A20", alignItems: "center", justifyContent: "center" },
  cardAvatarLetter: { fontSize: 28, fontWeight: "800", color: "#E8573A" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: "700", color: "#0F0E17" },
  verified: { color: "#E8573A", fontWeight: "700" },
  early: { fontSize: 14 },
  cardCity: { fontSize: 13, color: "#8C8A84", marginTop: 2 },
  styleRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  stylePill: { backgroundColor: "#F5F3EF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  styleText: { fontSize: 11, fontWeight: "500", color: "#0F0E17" },
  rating: { fontSize: 13, fontWeight: "600", color: "#0F0E17" },
  price: { fontSize: 14, fontWeight: "700", color: "#E8573A" },
  empty: { fontSize: 15, color: "#8C8A84", textAlign: "center", marginTop: 60, lineHeight: 26 },
})