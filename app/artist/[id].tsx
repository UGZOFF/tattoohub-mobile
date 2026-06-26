import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { useAuthStore } from "../../stores/auth.store"

export default function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuthStore()
  const [bioExpanded, setBioExpanded] = useState(false)

  const { data: artist, isLoading } = useQuery({
    queryKey: ["artist", id],
    queryFn: async () => {
      const { data } = await supabase.from("artists").select("*").eq("id", id).single()
      return data
    },
  })

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").eq("artist_id", id).order("created_at", { ascending: false }).limit(5)
      return data || []
    },
  })

  if (isLoading || !artist) {
    return <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}><ActivityIndicator color="#E8573A" size="large" /></View>
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroLetter}>{artist.stage_name?.[0]}</Text>
          </View>
          <Text style={styles.heroName}>{artist.stage_name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {artist.is_verified && <View style={styles.badge}><Text style={styles.badgeText}>✓ Vérifié</Text></View>}
            {artist.early_adopter && <View style={[styles.badge, { backgroundColor: "#FFF3CD" }]}><Text style={[styles.badgeText, { color: "#856404" }]}>🔥 Early</Text></View>}
          </View>
          <Text style={styles.heroCity}>{artist.city}</Text>
        </View>

        <View style={styles.stats}>
          {[
            { val: artist.rating > 0 ? `${Number(artist.rating).toFixed(1)}★` : "Nouveau", label: "Note" },
            { val: artist.review_count || 0, label: "Avis" },
            { val: artist.total_bookings || 0, label: "Séances" },
            { val: artist.hourly_rate ? `${artist.hourly_rate}€` : "–", label: "/heure" },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {artist.styles?.length > 0 && (
          <View style={styles.section}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {artist.styles.map((s: string) => (
                <View key={s} style={styles.pill}><Text style={styles.pillText}>{s}</Text></View>
              ))}
            </View>
          </View>
        )}

        {artist.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text numberOfLines={bioExpanded ? undefined : 3} style={styles.bio}>{artist.bio}</Text>
            {artist.bio.length > 140 && (
              <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
                <Text style={{ color: "#E8573A", marginTop: 6, fontWeight: "600" }}>{bioExpanded ? "Voir moins" : "Voir plus →"}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            {reviews.map((r: any) => (
              <View key={r.id} style={styles.reviewCard}>
                <Text style={{ color: "#F59E0B" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Text>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.cta}>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push(`/booking/${artist.id}`)}>
          <Text style={styles.ctaBtnText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  hero: { backgroundColor: "#0F0E17", padding: 24, paddingTop: 60, alignItems: "center", gap: 8 },
  back: { position: "absolute", top: 54, left: 20, backgroundColor: "rgba(255,255,255,0.9)", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 20, color: "#0F0E17" },
  heroAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#E8573A30", alignItems: "center", justifyContent: "center" },
  heroLetter: { fontSize: 40, fontWeight: "800", color: "#E8573A" },
  heroName: { fontSize: 28, fontWeight: "800", color: "#fff", marginTop: 8 },
  badge: { backgroundColor: "#E8573A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  heroCity: { fontSize: 15, color: "rgba(255,255,255,0.7)" },
  stats: { flexDirection: "row", backgroundColor: "#FDFAF5", margin: 20, borderRadius: 16, padding: 16 },
  stat: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 20, fontWeight: "800", color: "#0F0E17" },
  statLabel: { fontSize: 12, color: "#8C8A84", marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F0E17", marginBottom: 12 },
  pill: { backgroundColor: "#FDFAF5", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#E5E3DF" },
  pillText: { fontSize: 13, fontWeight: "500", color: "#0F0E17" },
  bio: { fontSize: 15, color: "#0F0E17", lineHeight: 24 },
  reviewCard: { backgroundColor: "#FDFAF5", borderRadius: 12, padding: 14, marginBottom: 10 },
  reviewComment: { fontSize: 14, color: "#0F0E17", lineHeight: 22, marginTop: 6 },
  cta: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: "#F5F3EF", borderTopWidth: 1, borderTopColor: "#E5E3DF" },
  ctaBtn: { height: 54, backgroundColor: "#E8573A", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  ctaBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})