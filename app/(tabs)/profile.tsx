import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { useAuthStore } from "../../stores/auth.store"

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuthStore()

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, padding: 28, paddingTop: 80, gap: 20 }}>
          <Text style={styles.title}>Mon Profil</Text>
          <Text style={{ color: "#8C8A84", fontSize: 16 }}>Connecte-toi pour accéder à ton profil.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/(onboarding)/auth")}>
            <Text style={styles.btnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{profile?.full_name?.[0] ?? "?"}</Text>
        </View>
        <Text style={styles.name}>{profile?.full_name ?? "Mon profil"}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>
      <Text style={styles.section}>Paramètres</Text>
      {["Modifier mon profil", "Notifications", "Artistes favoris", "Parrainage", "Politique de confidentialité"].map((item, i) => (
        <TouchableOpacity key={i} style={styles.row}>
          <Text style={styles.rowLabel}>{item}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={signOut} style={{ padding: 16, alignItems: "center", marginTop: 8 }}>
        <Text style={{ color: "#C62828", fontWeight: "600", fontSize: 15 }}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  content: { padding: 24, paddingTop: 60, gap: 12 },
  card: { backgroundColor: "#FDFAF5", borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#E8573A20", alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 32, fontWeight: "800", color: "#E8573A" },
  name: { fontSize: 22, fontWeight: "800", color: "#0F0E17" },
  email: { fontSize: 14, color: "#8C8A84" },
  title: { fontSize: 28, fontWeight: "800", color: "#0F0E17" },
  btn: { height: 54, backgroundColor: "#E8573A", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  section: { fontWeight: "700", fontSize: 16, color: "#0F0E17", marginTop: 8 },
  row: { backgroundColor: "#FDFAF5", borderRadius: 12, padding: 16, flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { fontSize: 15, color: "#0F0E17" },
  arrow: { fontSize: 20, color: "#8C8A84" },
})