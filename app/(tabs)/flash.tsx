import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"

const STYLES_LIST = ["Tous", "Réaliste", "Old School", "Géométrique", "Blackwork", "Japonais", "Minimaliste", "Fine Line", "Aquarelle"]
const SIZES = ["XS", "S", "M", "L", "XL"]

export default function FlashScreen() {
  const [activeStyle, setActiveStyle] = useState("Tous")
  const [activeSize, setActiveSize] = useState<string | null>(null)

  const { data: flashes, isLoading } = useQuery({
    queryKey: ["flash", activeStyle, activeSize],
    queryFn: async () => {
      let req = supabase.from("flash_events").select("*, artists(stage_name, city)").eq("is_active", true)
      if (activeStyle !== "Tous") req = req.eq("style", activeStyle)
      if (activeSize) req = req.eq("size", activeSize)
      const { data } = await req.order("created_at", { ascending: false })
      return data || []
    },
  })

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Flash Tattoo ⚡</Text>
        <Text style={styles.subtitle}>Designs uniques — dispo immédiate</Text>
      </View>

      {/* FILTRES STYLES */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {STYLES_LIST.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.pill, activeStyle === s && styles.pillActive]}
            onPress={() => setActiveStyle(s)}
          >
            <Text style={[styles.pillText, activeStyle === s && styles.pillTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FILTRES TAILLES */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={{ marginBottom: 8 }}
      >
        {SIZES.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sizePill, activeSize === s && styles.sizePillActive]}
            onPress={() => setActiveSize(activeSize === s ? null : s)}
          >
            <Text style={[styles.sizePillText, activeSize === s && styles.sizePillTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#E8573A" size="large" />
        </View>
      ) : (
        <FlatList
          data={flashes || []}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/booking/${item.artist_id}`)} activeOpacity={0.85}>
              <View style={styles.cardImg}>
                <Text style={{ fontSize: 36 }}>🎨</Text>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{item.size}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardArtist} numberOfLines={1}>{item.artists?.stage_name}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.cardStylePill}>
                    <Text style={styles.cardStyleText}>{item.style}</Text>
                  </View>
                  <Text style={styles.cardPrice}>{item.price}€</Text>
                </View>
                <Text style={styles.cardSlots}>
                  {item.available_slots - item.booked_slots} place{item.available_slots - item.booked_slots > 1 ? "s" : ""} dispo
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>⚡</Text>
              <Text style={styles.emptyTitle}>Aucun flash dispo</Text>
              <Text style={styles.emptyText}>Les artistes publient leurs flash tattoos ici. Reviens bientôt !</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: "800", color: "#0F0E17" },
  subtitle: { fontSize: 14, color: "#8C8A84", marginTop: 4 },
  filterScroll: { marginBottom: 8 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 4, gap: 8, flexDirection: "row" },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FDFAF5", borderWidth: 1.5, borderColor: "#E5E3DF" },
  pillActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#0F0E17" },
  pillTextActive: { color: "#fff" },
  sizePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#FDFAF5", borderWidth: 1.5, borderColor: "#E5E3DF" },
  sizePillActive: { backgroundColor: "#0F0E17", borderColor: "#0F0E17" },
  sizePillText: { fontSize: 12, fontWeight: "700", color: "#0F0E17" },
  sizePillTextActive: { color: "#fff" },
  grid: { paddingHorizontal: 16, paddingBottom: 120 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: "#FDFAF5", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardImg: { width: "100%", aspectRatio: 1, backgroundColor: "#F0EDE8", alignItems: "center", justifyContent: "center", position: "relative" },
  cardBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "#0F0E17", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  cardBody: { padding: 10, gap: 4 },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#0F0E17", lineHeight: 18 },
  cardArtist: { fontSize: 11, color: "#8C8A84" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  cardStylePill: { backgroundColor: "#F5F3EF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  cardStyleText: { fontSize: 10, fontWeight: "600", color: "#0F0E17" },
  cardPrice: { fontSize: 15, fontWeight: "800", color: "#E8573A" },
  cardSlots: { fontSize: 10, color: "#22C55E", fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#0F0E17" },
  emptyText: { fontSize: 14, color: "#8C8A84", textAlign: "center", lineHeight: 22 },
})