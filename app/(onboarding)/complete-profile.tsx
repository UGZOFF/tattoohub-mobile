import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../stores/auth.store'
import { useUIStore } from '../../stores/ui.store'
import { Colors } from '../../constants/colors'
import { Button } from '../../components/ui/Button'
import { TATTOO_STYLES } from '../../constants/typography'

export default function CompleteProfileScreen() {
  const [name, setName] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuthStore()
  const { showToast } = useUIStore()

  const toggleStyle = (s: string) => {
    setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSave = async () => {
    if (!name.trim()) { showToast('Entre ton prénom', 'error'); return }
    setLoading(true)
    const { error } = await updateProfile({
      full_name: name.trim(),
      preferred_styles: selectedStyles,
      onboarding_complete: true,
    })
    setLoading(false)
    if (error) { showToast(error, 'error'); return }
    router.replace('/(tabs)/home')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Ton profil</Text>
      <Text style={styles.subtitle}>Pour personnaliser ton expérience.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Ton prénom</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Prénom"
          placeholderTextColor={Colors.muted}
          autoFocus
          accessibilityLabel="Prénom"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Styles qui t'intéressent</Text>
        <Text style={styles.hint}>Sélectionne un ou plusieurs styles</Text>
        <View style={styles.stylesGrid}>
          {TATTOO_STYLES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.stylePill, selectedStyles.includes(s) && styles.stylePillActive]}
              onPress={() => toggleStyle(s)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selectedStyles.includes(s) }}
            >
              <Text style={[styles.styleText, selectedStyles.includes(s) && styles.styleTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button label="C'est parti !" onPress={handleSave} loading={loading} style={{ marginTop: 8 }} />
      <TouchableOpacity onPress={() => { updateProfile({ onboarding_complete: true }); router.replace('/(tabs)/home') }}>
        <Text style={styles.skip}>Passer cette étape</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  content: { padding: 28, paddingTop: 70, gap: 28 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, color: Colors.ink },
  subtitle: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.muted },
  field: { gap: 8 },
  label: { fontFamily: 'Syne_600SemiBold', fontSize: 15, color: Colors.ink },
  hint: { fontFamily: 'Syne_400Regular', fontSize: 13, color: Colors.muted },
  input: { height: 54, backgroundColor: Colors.cream, borderRadius: 12, paddingHorizontal: 18, fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.ink, borderWidth: 1.5, borderColor: Colors.border },
  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stylePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.border },
  stylePillActive: { backgroundColor: Colors.coral, borderColor: Colors.coral },
  styleText: { fontFamily: 'Syne_500Medium', fontSize: 13, color: Colors.ink },
  styleTextActive: { color: Colors.white },
  skip: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted, textAlign: 'center', marginTop: 4 },
})
