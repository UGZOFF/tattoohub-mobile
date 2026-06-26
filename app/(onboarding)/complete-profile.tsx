import { useState } from "react"
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { useAuthStore } from "../../stores/auth.store"

const STYLES = ["Réaliste", "Old School", "Géométrique", "Blackwork", "Japonais", "Minimaliste", "Aquarelle", "Tribal", "Fine Line", "Neo-Trad"]

export default function CompleteProfileScreen() {
  const [name, setName] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuthStore()

  const toggle = (s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    await updateProfile({ full_name: name.trim(), preferred_styles: selected, onboarding_complete: true })
    setLoading(false)
    router.replace("/(tabs)/home")
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ton profil</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ton prénom"
        placeholderTextColor="#8C8A84"
        autoFocus
      />
      <Text style={styles.label}>Styles qui t'intéressent</Text>
      <View style={styles.grid}>
        {STYLES.map(s => (
          <TouchableOpacity key={s} style={[styles.pill, selected.includes(s) && styles.pillActive]} onPress={() => toggle(s)}>
            <Text style={[styles.pillText, selected.includes(s) && styles.pillTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.btn, loading && { opacity: 0.5 }]} onPress={handleSave} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Enregistrement..." : "C'est parti !"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { updateProfile({ onboarding_complete: true }); router.replace("/(tabs)/home") }}>
        <Text style={styles.skip}>Passer</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  content: { padding: 28, paddingTop: 70, gap: 16 },
  title: { fontSize: 36, fontWeight: "800", color: "#0F0E17" },
  input: { height: 54, backgroundColor: "#FDFAF5", borderRadius: 12, paddingHorizontal: 18, fontSize: 16, color: "#0F0E17", borderWidth: 1.5, borderColor: "#E5E3DF" },
  label: { fontWeight: "600", fontSize: 15, color: "#0F0E17" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FDFAF5", borderWidth: 1.5, borderColor: "#E5E3DF" },
  pillActive: { backgroundColor: "#E8573A", borderColor: "#E8573A" },
  pillText: { fontSize: 13, fontWeight: "500", color: "#0F0E17" },
  pillTextActive: { color: "#fff" },
  btn: { height: 54, backgroundColor: "#E8573A", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  skip: { textAlign: "center", color: "#8C8A84", fontSize: 14, marginTop: 4 },
})