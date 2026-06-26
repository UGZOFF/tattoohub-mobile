import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { router } from "expo-router"

const FEATURES = [
  { icon: "🎨", title: "Trouve ton artiste", desc: "Filtre par style, ville et disponibilité" },
  { icon: "📅", title: "Réserve en 3 clics", desc: "Choisis la date, paie l'acompte, c'est fait" },
  { icon: "💬", title: "Chat avec l'artiste", desc: "Partage tes références avant la séance" },
  { icon: "⚡", title: "Flash tattoo dispo", desc: "Des designs uniques à prix fixe" },
]

export default function WelcomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>L'Airbnb{"\n"}du tatouage</Text>
      <Text style={styles.subtitle}>Connecte-toi avec les meilleurs artistes tatoueurs parisiens.</Text>
      <View style={styles.features}>
        {FEATURES.map(f => (
          <View key={f.title} style={styles.row}>
            <Text style={styles.icon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.btn} onPress={() => router.push("/(onboarding)/auth")}>
        <Text style={styles.btnText}>Trouver un artiste</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(onboarding)/auth")} style={{ alignItems: "center" }}>
        <Text style={styles.link}>Je suis tatoueur → Rejoindre la plateforme</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  content: { padding: 28, paddingTop: 70, gap: 32 },
  title: { fontSize: 46, fontWeight: "800", color: "#0F0E17", lineHeight: 54 },
  subtitle: { fontSize: 17, color: "#8C8A84", lineHeight: 26 },
  features: { gap: 20 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  icon: { fontSize: 28, width: 40 },
  featureTitle: { fontWeight: "700", fontSize: 16, color: "#0F0E17" },
  featureDesc: { fontSize: 14, color: "#8C8A84", marginTop: 2 },
  btn: { height: 54, backgroundColor: "#E8573A", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { fontSize: 14, color: "#E8573A" },
})