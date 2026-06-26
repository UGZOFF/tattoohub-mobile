import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Pressable, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { useAuthStore } from "../../stores/auth.store"

type Tab = "reservations" | "tatouages" | "avis"

export default function ProfileScreen() {
  const { profile, session, signOut, updateProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>("reservations")
  const [editModal, setEditModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)
  const [editName, setEditName] = useState(profile?.full_name ?? "")
  const [editBio, setEditBio] = useState(profile?.bio ?? "")
  const [saving, setSaving] = useState(false)

  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", session?.user.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings")
        .select("*, artists(stage_name, city)")
        .eq("client_id", session!.user.id)
        .order("created_at", { ascending: false })
      return data || []
    },
    enabled: !!session,
  })

  const { data: reviews } = useQuery({
    queryKey: ["my-reviews", session?.user.id],
    queryFn: async () => {
      const { data } = await supabase.from("reviews")
        .select("*, artists(stage_name)")
        .eq("client_id", session!.user.id)
        .order("created_at", { ascending: false })
      return data || []
    },
    enabled: !!session,
  })

  const handleSaveEdit = async () => {
    setSaving(true)
    await updateProfile({ full_name: editName.trim(), bio: editBio.trim() })
    setSaving(false)
    setEditModal(false)
  }

  const handleSignOut = () => {
    Alert.alert("Se déconnecter ?", "Tu devras te reconnecter.", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnecter", style: "destructive", onPress: signOut },
    ])
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.guestWrap}>
          <Text style={{ fontSize: 60 }}>👤</Text>
          <Text style={styles.guestTitle}>Crée ton compte</Text>
          <Text style={styles.guestSub}>Pour suivre tes réservations et retrouver tes artistes favoris.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/(onboarding)/auth")}>
            <Text style={styles.btnText}>Se connecter / S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "#F59E0B" },
    confirmed: { label: "Confirmée", color: "#3B82F6" },
    deposit_paid: { label: "Acompte payé", color: "#8B5CF6" },
    in_progress: { label: "En cours", color: "#E8573A" },
    completed: { label: "Terminée", color: "#22C55E" },
    cancelled: { label: "Annulée", color: "#EF4444" },
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER PROFIL */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarWrap} onPress={() => setEditModal(true)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{profile?.full_name?.[0]?.toUpperCase() ?? "?"}</Text>
            </View>
            <View style={styles.avatarEdit}><Text style={{ fontSize: 14 }}>📷</Text></View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{profile?.full_name ?? "Mon profil"}</Text>
          <Text style={styles.profileEmail}>{profile?.email ?? session.user.email}</Text>
          {profile?.bio ? <Text style={styles.profileBio}>{profile.bio}</Text> : null}

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => { setEditName(profile?.full_name ?? ""); setEditBio(profile?.bio ?? ""); setEditModal(true) }}>
              <Text style={styles.editBtnText}>✏️ Modifier le profil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsModal(true)}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.stats}>
          {[
            { val: bookings?.length ?? 0, label: "Réservations" },
            { val: reviews?.length ?? 0, label: "Avis laissés" },
            { val: bookings?.filter((b: any) => b.status === "completed")?.length ?? 0, label: "Séances faites" },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ONGLETS */}
        <View style={styles.tabs}>
          {(["reservations", "tatouages", "avis"] as Tab[]).map(t => (
            <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === "reservations" ? "📅 Réservations" : t === "tatouages" ? "🖤 Tatouages" : "⭐ Avis"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTENU ONGLETS */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>

          {activeTab === "reservations" && (
            bookings?.length === 0
              ? <View style={styles.emptyTab}><Text style={{ fontSize: 36 }}>📅</Text><Text style={styles.emptyTabTitle}>Aucune réservation</Text><Text style={styles.emptyTabText}>Trouve un artiste et réserve ta prochaine séance.</Text><TouchableOpacity style={styles.btn} onPress={() => router.push("/(tabs)/home")}><Text style={styles.btnText}>Trouver un artiste</Text></TouchableOpacity></View>
              : bookings?.map((b: any) => {
                const status = STATUS_LABELS[b.status] || { label: b.status, color: "#8C8A84" }
                return (
                  <TouchableOpacity key={b.id} style={styles.bookingCard} onPress={() => router.push(`/chat/${b.id}`)}>
                    <View style={styles.bookingLeft}>
                      <View style={styles.bookingAvatar}><Text style={styles.bookingAvatarLetter}>{b.artists?.stage_name?.[0] ?? "?"}</Text></View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookingArtist}>{b.artists?.stage_name}</Text>
                      <Text style={styles.bookingDate}>{new Date(b.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "long" })} · {b.time_slot}</Text>
                      {b.style && <Text style={styles.bookingStyle}>{b.style}</Text>}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })
          )}

          {activeTab === "tatouages" && (
            <View style={styles.emptyTab}>
              <Text style={{ fontSize: 36 }}>🖤</Text>
              <Text style={styles.emptyTabTitle}>Mes tatouages</Text>
              <Text style={styles.emptyTabText}>Partage les photos de tes tatouages et crée ta galerie personnelle.</Text>
              <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Ajouter une photo</Text></TouchableOpacity>
            </View>
          )}

          {activeTab === "avis" && (
            reviews?.length === 0
              ? <View style={styles.emptyTab}><Text style={{ fontSize: 36 }}>⭐</Text><Text style={styles.emptyTabTitle}>Aucun avis</Text><Text style={styles.emptyTabText}>Après une séance, laisse un avis pour aider la communauté.</Text></View>
              : reviews?.map((r: any) => (
                <View key={r.id} style={styles.reviewCard}>
                  <Text style={styles.reviewArtist}>{r.artists?.stage_name}</Text>
                  <Text style={{ color: "#F59E0B", fontSize: 16 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Text>
                  {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                </View>
              ))
          )}

        </View>
      </ScrollView>

      {/* MODAL EDIT PROFIL */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setEditModal(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Modifier mon profil</Text>

            <View style={styles.sheetAvatar}>
              <View style={styles.avatar}><Text style={styles.avatarLetter}>{editName?.[0]?.toUpperCase() ?? "?"}</Text></View>
              <TouchableOpacity style={styles.changePhotoBtn}><Text style={styles.changePhotoText}>📷 Changer la photo</Text></TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Prénom ou pseudo</Text>
            <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} placeholder="Ton prénom..." placeholderTextColor="#8C8A84" autoFocus />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.fieldInput, { height: 90, textAlignVertical: "top" }]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Parle de toi, de tes styles préférés..."
              placeholderTextColor="#8C8A84"
              multiline
            />

            <TouchableOpacity style={[styles.btn, saving && { opacity: 0.5 }]} onPress={handleSaveEdit} disabled={saving}>
              <Text style={styles.btnText}>{saving ? "Sauvegarde..." : "Sauvegarder"}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* MODAL PARAMÈTRES */}
      <Modal visible={settingsModal} transparent animationType="slide" onRequestClose={() => setSettingsModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setSettingsModal(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Paramètres</Text>
            {[
              { icon: "🔔", label: "Notifications", sub: "Gérer mes alertes" },
              { icon: "🔒", label: "Confidentialité", sub: "Contrôler mes données" },
              { icon: "💳", label: "Paiements", sub: "Mes moyens de paiement" },
              { icon: "❓", label: "Aide & Support", sub: "FAQ et contact" },
              { icon: "📋", label: "CGU & Politique", sub: "Conditions d'utilisation" },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.settingsRow}>
                <Text style={{ fontSize: 22, width: 36 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                  <Text style={styles.settingsSub}>{item.sub}</Text>
                </View>
                <Text style={{ color: "#8C8A84", fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.signOutBtn} onPress={() => { setSettingsModal(false); handleSignOut() }}>
              <Text style={styles.signOutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },

  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 },
  guestTitle: { fontSize: 26, fontWeight: "800", color: "#0F0E17" },
  guestSub: { fontSize: 15, color: "#8C8A84", textAlign: "center", lineHeight: 24 },

  profileHeader: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: "#FDFAF5", borderBottomWidth: 1, borderBottomColor: "#E5E3DF" },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#E8573A20", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#E8573A30" },
  avatarLetter: { fontSize: 36, fontWeight: "800", color: "#E8573A" },
  avatarEdit: { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: "#E8573A", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FDFAF5" },
  profileName: { fontSize: 22, fontWeight: "800", color: "#0F0E17" },
  profileEmail: { fontSize: 13, color: "#8C8A84", marginTop: 2 },
  profileBio: { fontSize: 14, color: "#0F0E17", textAlign: "center", marginTop: 8, lineHeight: 20, paddingHorizontal: 20 },
  profileActions: { flexDirection: "row", gap: 10, marginTop: 14, alignItems: "center" },
  editBtn: { flex: 1, height: 40, backgroundColor: "#F5F3EF", borderRadius: 10, borderWidth: 1.5, borderColor: "#E5E3DF", alignItems: "center", justifyContent: "center" },
  editBtnText: { fontSize: 13, fontWeight: "600", color: "#0F0E17" },
  settingsBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F5F3EF", borderWidth: 1.5, borderColor: "#E5E3DF", alignItems: "center", justifyContent: "center" },

  stats: { flexDirection: "row", backgroundColor: "#FDFAF5", marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 16, gap: 4 },
  stat: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 22, fontWeight: "800", color: "#0F0E17" },
  statLabel: { fontSize: 11, color: "#8C8A84", marginTop: 2, textAlign: "center" },

  tabs: { flexDirection: "row", marginHorizontal: 20, marginTop: 16, backgroundColor: "#FDFAF5", borderRadius: 12, padding: 4, borderWidth: 1, borderColor: "#E5E3DF" },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  tabActive: { backgroundColor: "#E8573A" },
  tabText: { fontSize: 11, fontWeight: "700", color: "#8C8A84" },
  tabTextActive: { color: "#fff" },

  emptyTab: { alignItems: "center", gap: 10, paddingTop: 40, paddingHorizontal: 20 },
  emptyTabTitle: { fontSize: 18, fontWeight: "800", color: "#0F0E17" },
  emptyTabText: { fontSize: 14, color: "#8C8A84", textAlign: "center", lineHeight: 22 },

  bookingCard: { backgroundColor: "#FDFAF5", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  bookingLeft: {},
  bookingAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#E8573A20", alignItems: "center", justifyContent: "center" },
  bookingAvatarLetter: { fontSize: 20, fontWeight: "800", color: "#E8573A" },
  bookingArtist: { fontWeight: "700", fontSize: 15, color: "#0F0E17" },
  bookingDate: { fontSize: 12, color: "#8C8A84", marginTop: 2 },
  bookingStyle: { fontSize: 11, color: "#E8573A", fontWeight: "600", marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },

  reviewCard: { backgroundColor: "#FDFAF5", borderRadius: 14, padding: 14, gap: 6 },
  reviewArtist: { fontWeight: "700", fontSize: 15, color: "#0F0E17" },
  reviewComment: { fontSize: 14, color: "#0F0E17", lineHeight: 22 },

  btn: { height: 50, backgroundColor: "#E8573A", borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  overlay: { flex: 1, backgroundColor: "rgba(15,14,23,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FDFAF5", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, gap: 16 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E3DF", alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#0F0E17" },
  sheetAvatar: { alignItems: "center", gap: 10 },
  changePhotoBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#F5F3EF", borderRadius: 10, borderWidth: 1, borderColor: "#E5E3DF" },
  changePhotoText: { fontSize: 13, fontWeight: "600", color: "#0F0E17" },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#8C8A84", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: { backgroundColor: "#F5F3EF", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: "#0F0E17", borderWidth: 1.5, borderColor: "#E5E3DF" },

  settingsRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, backgroundColor: "#F5F3EF", borderRadius: 12 },
  settingsLabel: { fontSize: 15, fontWeight: "600", color: "#0F0E17" },
  settingsSub: { fontSize: 12, color: "#8C8A84", marginTop: 1 },
  signOutBtn: { padding: 16, alignItems: "center", borderTopWidth: 1, borderTopColor: "#E5E3DF", marginTop: 8 },
  signOutText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
})