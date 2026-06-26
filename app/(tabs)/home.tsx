import { useState, useRef } from "react"
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator, Modal, Animated, Pressable
} from "react-native"
import { router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { useAuthStore } from "../../stores/auth.store"

const STYLES = ["Réaliste", "Old School", "Géométrique", "Blackwork", "Japonais", "Minimaliste", "Aquarelle", "Tribal", "Fine Line"]
const SEARCH_SUGGESTIONS = ["Réaliste", "Old School", "Blackwork", "Flash tattoo", "Minimaliste", "Japonais", "Géométrique"]

async function fetchArtists(query: string, styles: string[]) {
  let req = supabase.from("artists").select("*").eq("is_active", true)
  if (query) req = req.ilike("stage_name", `%${query}%`)
  if (styles.length) req = req.contains("styles", styles)
  const { data } = await req.order("rating", { ascending: false }).limit(30)
  return data || []
}

function ArtistCard({ artist, onPress, size = "normal" }: { artist: any; onPress: () => void; size?: "normal" | "small" }) {
  if (size === "small") {
    return (
      <TouchableOpacity style={styles.artistSmall} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.artistSmallAvatar}>
          <Text style={styles.artistSmallLetter}>{artist.stage_name?.[0] ?? "?"}</Text>
        </View>
        <Text style={styles.artistSmallName} numberOfLines={1}>{artist.stage_name}</Text>
        <Text style={styles.artistSmallStyle} numberOfLines={1}>{artist.styles?.[0] ?? ""}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarLetter}>{artist.stage_name?.[0] ?? "?"}</Text>
        {artist.is_verified && <View style={styles.verifiedDot}><Text style={{ fontSize: 8, color: "#fff" }}>✓</Text></View>}
      </View>
      <View style={styles.cardInfo}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.cardName} numberOfLines={1}>{artist.stage_name}</Text>
          {artist.early_adopter && <Text style={{ fontSize: 12 }}>🔥</Text>}
        </View>
        <Text style={styles.cardCity}>{artist.city || "Paris"}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {(artist.styles || []).slice(0, 4).map((s: string) => (
              <View key={s} style={styles.stylePill}>
                <Text style={styles.styleText}>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
          <Text style={styles.rating}>{artist.rating > 0 ? `★ ${Number(artist.rating).toFixed(1)}` : "★ Nouveau"}</Text>
          {artist.hourly_rate && <Text style={styles.price}>{artist.hourly_rate}€/h</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { profile } = useAuthStore()
  const [search, setSearch] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeStyles, setActiveStyles] = useState<string[]>([])
  const [showPlus, setShowPlus] = useState(false)
  let timeout: any

  const { data: artists, isLoading, refetch } = useQuery({
    queryKey: ["artists", debouncedSearch, activeStyles],
    queryFn: () => fetchArtists(debouncedSearch, activeStyles),
  })

  const handleSearch = (text: string) => {
    setSearch(text)
    clearTimeout(timeout)
    timeout = setTimeout(() => setDebouncedSearch(text), 300)
  }

  const toggleStyle = (s: string) => setActiveStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const topArtists = (artists || []).slice(0, 6)
  const featuredArtists = (artists || []).slice(6, 12)
  const inkLovers = (artists || []).filter((a: any) => a.rating >= 4.5).slice(0, 6)
  const searching = debouncedSearch || activeStyles.length > 0

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#E8573A" />}>

        {/* HEADER sticky */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Bonjour{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋</Text>
              <Text style={styles.headerTitle}>TattooHub</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity style={styles.headerIcon} onPress={() => router.push("/(onboarding)/auth")}>
                <Text style={{ fontSize: 18 }}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <Text style={{ fontSize: 18 }}>📸</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon} onPress={() => router.push("/(tabs)/profile")}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH */}
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Rechercher un artiste, un style..."
              placeholderTextColor="#8C8A84"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(""); setDebouncedSearch("") }}>
                <Text style={{ color: "#8C8A84", fontSize: 16, paddingRight: 4 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SUGGESTIONS quand focusé */}
          {searchFocused && !search && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionTitle}>Recherches populaires</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {SEARCH_SUGGESTIONS.map(s => (
                  <TouchableOpacity key={s} style={styles.suggestionPill} onPress={() => { handleSearch(s); setSearchFocused(false) }}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* FILTRES STYLES */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {STYLES.map(s => (
              <TouchableOpacity key={s} style={[styles.filterPill, activeStyles.includes(s) && styles.filterPillActive]} onPress={() => toggleStyle(s)}>
                <Text style={[styles.filterText, activeStyles.includes(s) && { color: "#fff" }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LOADING */}
        {isLoading && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <ActivityIndicator color="#E8573A" size="large" />
          </View>
        )}

        {/* RESULTATS DE RECHERCHE */}
        {searching && !isLoading && (
          <View style={{ padding: 20, gap: 12 }}>
            <Text style={styles.sectionTitle}>
              {(artists || []).length} artiste{(artists || []).length !== 1 ? "s" : ""} trouvé{(artists || []).length !== 1 ? "s" : ""}
            </Text>
            {(artists || []).map((a: any) => (
              <ArtistCard key={a.id} artist={a} onPress={() => router.push(`/artist/${a.id}`)} />
            ))}
            {(artists || []).length === 0 && (
              <Text style={styles.empty}>Aucun artiste trouvé.{"\n"}Essaie un autre style ou nom. 🎨</Text>
            )}
          </View>
        )}

        {/* HOME CONTENT - sans recherche */}
        {!searching && !isLoading && (
          <View style={{ gap: 32, paddingBottom: 120 }}>

            {/* PRÈS DE TOI */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📍 Près de toi</Text>
                <TouchableOpacity><Text style={styles.sectionLink}>Voir tout →</Text></TouchableOpacity>
              </View>
              {topArtists.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                  {topArtists.map((a: any) => (
                    <ArtistCard key={a.id} artist={a} onPress={() => router.push(`/artist/${a.id}`)} size="small" />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>Les artistes arrivent bientôt ! 🎨</Text>
                </View>
              )}
            </View>

            {/* POUR TOI - Sélection de la semaine */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Sélection de la semaine</Text>
              </View>
              {featuredArtists.length > 0 ? (
                <View style={{ paddingHorizontal: 20, gap: 12 }}>
                  {featuredArtists.slice(0, 3).map((a: any) => (
                    <ArtistCard key={a.id} artist={a} onPress={() => router.push(`/artist/${a.id}`)} />
                  ))}
                </View>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>Reviens bientôt pour nos coups de cœur ✨</Text>
                </View>
              )}
            </View>

            {/* INK LOVER */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🖤 Ink Lover</Text>
                <TouchableOpacity><Text style={styles.sectionLink}>Voir tout →</Text></TouchableOpacity>
              </View>
              <View style={styles.inkLoverBanner}>
                <Text style={styles.inkLoverTitle}>Les artistes les mieux notés</Text>
                <Text style={styles.inkLoverSub}>Sélectionnés par la communauté TattooHub</Text>
              </View>
              {inkLovers.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingTop: 12 }}>
                  {inkLovers.map((a: any) => (
                    <ArtistCard key={a.id} artist={a} onPress={() => router.push(`/artist/${a.id}`)} size="small" />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>Les top artistes arrivent bientôt 🏆</Text>
                </View>
              )}
            </View>

            {/* ARTISTES À PARIS */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🗼 Artistes à Paris</Text>
                <TouchableOpacity><Text style={styles.sectionLink}>Voir tout →</Text></TouchableOpacity>
              </View>
              {(artists || []).length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                  {(artists || []).map((a: any) => (
                    <ArtistCard key={a.id} artist={a} onPress={() => router.push(`/artist/${a.id}`)} size="small" />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>Les premiers artistes parisiens arrivent ! 🗼</Text>
                </View>
              )}
            </View>

          </View>
        )}
      </ScrollView>

      {/* BOUTON + FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowPlus(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* MODAL MENU + */}
      <Modal visible={showPlus} transparent animationType="slide" onRequestClose={() => setShowPlus(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPlus(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Que veux-tu faire ?</Text>
            {[
              { icon: "🔍", label: "Trouver un artiste", action: () => { setShowPlus(false) } },
              { icon: "⚡", label: "Voir les flash tattoos", action: () => { setShowPlus(false); router.push("/(tabs)/flash") } },
              { icon: "📅", label: "Réserver une séance", action: () => { setShowPlus(false) } },
              { icon: "💬", label: "Mes messages", action: () => { setShowPlus(false); router.push("/(tabs)/messages") } },
              { icon: "🎨", label: "Publier un flash (artiste)", action: () => { setShowPlus(false) } },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.modalItem} onPress={item.action}>
                <Text style={styles.modalItemIcon}>{item.icon}</Text>
                <Text style={styles.modalItemLabel}>{item.label}</Text>
                <Text style={styles.modalItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPlus(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },

  // HEADER
  header: { backgroundColor: "#F5F3EF", paddingBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  headerGreeting: { fontSize: 13, color: "#8C8A84" },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#0F0E17", marginTop: 2 },
  headerIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FDFAF5", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E3DF" },

  // SEARCH
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, backgroundColor: "#FDFAF5", borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E3DF", paddingHorizontal: 14, height: 50, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: "#0F0E17" },

  // SUGGESTIONS
  suggestions: { marginHorizontal: 20, marginTop: 8, backgroundColor: "#FDFAF5", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E5E3DF" },
  suggestionTitle: { fontSize: 12, fontWeight: "700", color: "#8C8A84", textTransform: "uppercase", letterSpacing: 0.5 },
  suggestionPill: { backgroundColor: "#F5F3EF", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "#E5E3DF" },
  suggestionText: { fontSize: 13, fontWeight: "500", color: "#0F0E17" },

  // FILTRES
  filterScroll: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FDFAF5", borderWidth: 1.5, borderColor: "#E5E3DF" },
  filterPillActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#0F0E17" },

  // SECTIONS
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#0F0E17" },
  sectionLink: { fontSize: 13, color: "#E8573A", fontWeight: "600" },

  // INK LOVER banner
  inkLoverBanner: { marginHorizontal: 20, backgroundColor: "#0F0E17", borderRadius: 16, padding: 16 },
  inkLoverTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
  inkLoverSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 },

  // EMPTY
  emptySection: { marginHorizontal: 20, backgroundColor: "#FDFAF5", borderRadius: 14, padding: 20, alignItems: "center" },
  emptySectionText: { fontSize: 14, color: "#8C8A84", textAlign: "center" },
  empty: { fontSize: 15, color: "#8C8A84", textAlign: "center", marginTop: 40, lineHeight: 26 },

  // ARTIST CARD normal
  card: { marginHorizontal: 20, backgroundColor: "#FDFAF5", borderRadius: 16, padding: 14, flexDirection: "row", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardAvatar: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#E8573A20", alignItems: "center", justifyContent: "center", position: "relative" },
  cardAvatarLetter: { fontSize: 28, fontWeight: "800", color: "#E8573A" },
  verifiedDot: { position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: "#E8573A", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FDFAF5" },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#0F0E17" },
  cardCity: { fontSize: 12, color: "#8C8A84", marginTop: 2 },
  stylePill: { backgroundColor: "#F5F3EF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "#E5E3DF" },
  styleText: { fontSize: 11, fontWeight: "600", color: "#0F0E17" },
  rating: { fontSize: 13, fontWeight: "700", color: "#0F0E17" },
  price: { fontSize: 14, fontWeight: "800", color: "#E8573A" },

  // ARTIST CARD small
  artistSmall: { width: 110, alignItems: "center", gap: 6 },
  artistSmallAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#E8573A20", alignItems: "center", justifyContent: "center" },
  artistSmallLetter: { fontSize: 32, fontWeight: "800", color: "#E8573A" },
  artistSmallName: { fontSize: 13, fontWeight: "700", color: "#0F0E17", textAlign: "center" },
  artistSmallStyle: { fontSize: 11, color: "#8C8A84", textAlign: "center" },

  // FAB
  fab: { position: "absolute", bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#E8573A", alignItems: "center", justifyContent: "center", shadowColor: "#E8573A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabIcon: { fontSize: 28, color: "#fff", fontWeight: "300", lineHeight: 32 },

  // MODAL +
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,14,23,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FDFAF5", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E3DF", alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F0E17", marginBottom: 16 },
  modalItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, backgroundColor: "#F5F3EF", borderRadius: 12, marginBottom: 8 },
  modalItemIcon: { fontSize: 22, width: 32 },
  modalItemLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0F0E17" },
  modalItemArrow: { fontSize: 22, color: "#8C8A84" },
  modalCancel: { marginTop: 8, padding: 16, alignItems: "center" },
  modalCancelText: { fontSize: 15, color: "#8C8A84", fontWeight: "600" },
})