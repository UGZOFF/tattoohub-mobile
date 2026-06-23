import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth.store'
import { Colors, Shadows } from '../../constants/colors'
import { Button } from '../../components/ui/Button'

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuthStore()

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings', session?.user.id],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*, artists(stage_name, avatar_url)').eq('client_id', session!.user.id).order('created_at', { ascending: false })
      return data
    },
    enabled: !!session,
  })

  const statusColors: Record<string, string> = {
    pending: '#F59E0B', confirmed: '#10B981', deposit_paid: '#3B82F6',
    completed: Colors.muted, cancelled: Colors.error,
  }

  const statusLabels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmé', deposit_paid: 'Acompte payé',
    in_progress: 'En cours', completed: 'Terminé', cancelled: 'Annulé',
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthContent}>
          <Text style={styles.title}>Mon Profil</Text>
          <Text style={styles.unauthText}>Connecte-toi pour accéder à ton profil et tes réservations.</Text>
          <Button label="Se connecter" onPress={() => router.push('/(onboarding)/auth')} />
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profil header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          {profile?.avatar_url
            ? <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
            : <Text style={styles.avatarLetter}>{profile?.full_name?.[0] ?? '?'}</Text>
          }
        </View>
        <Text style={styles.name}>{profile?.full_name ?? 'Mon profil'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {profile?.role === 'artist' && (
          <TouchableOpacity style={styles.dashboardBtn} onPress={() => router.push('/artist/dashboard')} accessibilityRole="button">
            <Text style={styles.dashboardText}>Tableau de bord artiste →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Réservations */}
      <Text style={styles.sectionTitle}>Mes réservations</Text>
      {(bookings || []).slice(0, 5).map(b => (
        <TouchableOpacity key={b.id} style={styles.bookingRow} onPress={() => router.push(`/chat/${b.id}`)} accessibilityRole="button" accessibilityLabel={`Réservation avec ${b.artists?.stage_name}`}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingArtist}>{b.artists?.stage_name}</Text>
            <Text style={styles.bookingDate}>{new Date(b.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[b.status] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[b.status] }]}>{statusLabels[b.status]}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Settings */}
      <Text style={styles.sectionTitle}>Paramètres</Text>
      <View style={styles.settingsGroup}>
        {[
          { label: 'Modifier mon profil', action: () => {} },
          { label: 'Notifications', action: () => {} },
          { label: 'Mes artistes favoris', action: () => {} },
          { label: 'Parrainage', action: () => {} },
          { label: 'Politique de confidentialité', action: () => {} },
          { label: 'Mentions légales', action: () => {} },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.settingsRow} onPress={item.action} accessibilityRole="button" accessibilityLabel={item.label}>
            <Text style={styles.settingsLabel}>{item.label}</Text>
            <Text style={styles.settingsArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut} accessibilityRole="button" accessibilityLabel="Se déconnecter">
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  content: { padding: 24, paddingTop: 60, gap: 16 },
  unauthContent: { flex: 1, padding: 28, paddingTop: 80, gap: 20 },
  profileCard: { backgroundColor: Colors.cream, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, ...Shadows.sm },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.beige, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarLetter: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: Colors.coral },
  name: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Colors.ink },
  email: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted },
  dashboardBtn: { marginTop: 4 },
  dashboardText: { fontFamily: 'Syne_500Medium', fontSize: 14, color: Colors.coral },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.ink },
  unauthText: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.muted, lineHeight: 24 },
  sectionTitle: { fontFamily: 'Syne_600SemiBold', fontSize: 16, color: Colors.ink, marginTop: 8 },
  bookingRow: { backgroundColor: Colors.cream, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Shadows.sm },
  bookingInfo: { gap: 2 },
  bookingArtist: { fontFamily: 'Syne_600SemiBold', fontSize: 14, color: Colors.ink },
  bookingDate: { fontFamily: 'Syne_400Regular', fontSize: 13, color: Colors.muted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontFamily: 'Syne_600SemiBold', fontSize: 12 },
  settingsGroup: { backgroundColor: Colors.cream, borderRadius: 16, overflow: 'hidden', ...Shadows.sm },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsLabel: { fontFamily: 'Syne_400Regular', fontSize: 15, color: Colors.ink },
  settingsArrow: { fontFamily: 'Syne_400Regular', fontSize: 20, color: Colors.muted },
  signOutBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  signOutText: { fontFamily: 'Syne_500Medium', fontSize: 15, color: Colors.error },
})
