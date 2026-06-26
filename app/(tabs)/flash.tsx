import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native"
import { router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"

const STYLES = ["Réaliste", "Old School", "Géométrique", "Blackwork", "Japonais", "Minimaliste"]

export default function FlashScreen() {
  const [activeStyle, setActiveStyle] = require("react").useState<string | null>(null)
  const { data: flashes } = useQuery({
    queryKey: ["flash", activeStyle],
    queryFn: async () => {
      let req = supabase.from("flash_events").select("*, artists(stage_name)").eq("is_active", true)
      if (activeStyle) req = req.eq("style", activeStyle)
      const { data } = await req.order("created_at", { ascending: false })
      return data || []
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flash Tattoo</Text>
        <Text style={styles.subtitle}>Designs uniques, dispo immédiate</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        <TouchableOpacity style={[styles.pill, !activeStyle && styles.pillActive]} onPress={() => setActiveStyle(null)}>
          <Text style={[styles.pillText, !activeStyle && styles.pillTextActive]}>Tous</Text>
        </TouchableOpacity>
        {STYLES.map(s => (
          <TouchableOpacity key={s} style={[styles.pill, activeStyle === s && styles.pillActive]} onPress={() => setActiveStyle(activeStyle === s ? null : s)}>
            <Text style={[styles.pillText, activeStyle === s && styles.pillTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={flashes || []}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/booking/${item.artist_id}`)}>
            <View style={styles.cardImg}><Text style={{ fontSize: 40 }}>🎨</Text></View>
            <View style={{ padding: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardPrice}>{item.price}€</Text>
              </View>
              <Text style={styles.cardArtist}>{item.artists?.stage_name}</Text>
              <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                <Text style={styles.tag}>{item.size}</Text>
                <Text style={styles.tag}>{item.style}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun flash disponible pour le moment.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#0F0E17" },
  subtitle: { fontSize: 14, color: "#8C8A84", marginTop: 4 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FDFAF5", borderWidth: 1, borderColor: "#E5E3DF" },
  pillActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  pillText: { fontSize: 13, fontWeight: "500", color: "#0F0E17" },
  pillTextActive: { color: "#fff" },
  card: { flex: 1, backgroundColor: "#FDFAF5", borderRadius: 14, overflow: "hidden" },
  cardImg: { width: "100%", aspectRatio: 1, backgroundColor: "#F5F3EF", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#0F0E17", flex: 1 },
  cardPrice: { fontSize: 16, fontWeight: "800", color: "#E8573A" },
  cardArtist: { fontSize: 12, color: "#8C8A84", marginTop: 2 },
  tag: { backgroundColor: "#F5F3EF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: "600" },
  empty: { fontSize: 15, color: "#8C8A84", textAlign: "center", marginTop: 40 },
})