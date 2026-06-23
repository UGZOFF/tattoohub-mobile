import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Colors } from '../../constants/colors'
import { Button } from '../../components/ui/Button'

const FEATURES = [
  { icon: '🎨', title: 'Trouve ton artiste', desc: 'Filtre par style, ville et disponibilité' },
  { icon: '📅', title: 'Réserve en 3 clics', desc: 'Choisis la date, paie l\'acompte, c\'est fait' },
  { icon: '💬', title: 'Chat avec l\'artiste', desc: 'Partage tes références avant la séance' },
  { icon: '⚡', title: 'Flash tattoo dispo', desc: 'Des designs uniques à prix fixe' },
]

export default function WelcomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.title}>L'Airbnb{'\n'}du tatouage</Text>
        <Text style={styles.subtitle}>Connecte-toi avec les meilleurs artistes tatoueurs parisiens.</Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map(f => (
          <View key={f.title} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.ctas}>
        <Button label="Trouver un artiste" onPress={() => router.push('/(onboarding)/auth')} />
        <TouchableOpacity onPress={() => router.push('/(onboarding)/become-artist')} style={styles.artistLink}>
          <Text style={styles.artistLinkText}>Je suis tatoueur · Rejoindre la plateforme →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  content: { padding: 28, paddingTop: 80, gap: 40 },
  hero: { gap: 12 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 48, color: Colors.ink, lineHeight: 56 },
  subtitle: { fontFamily: 'Syne_400Regular', fontSize: 17, color: Colors.muted, lineHeight: 26 },
  features: { gap: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  featureIcon: { fontSize: 28, width: 40 },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { fontFamily: 'Syne_600SemiBold', fontSize: 16, color: Colors.ink },
  featureDesc: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted },
  ctas: { gap: 16, paddingBottom: 40 },
  artistLink: { alignItems: 'center' },
  artistLinkText: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.coral },
})
