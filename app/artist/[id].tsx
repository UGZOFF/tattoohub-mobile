import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth.store'
import { Colors, Shadows } from '../../constants/colors'
import { Button } from '../../components/ui/Button'

const W = Dimensions.get('window').width

async function fetchArtist(id: string) {
  const { data, error } = await supabase.from('artists').select('*, profiles(full_name)').eq('id', id).single()
  if (error) throw error
  return data
}

async function fetchReviews(artistId: string) {
  const { data } = await supabase.from('reviews').select('*, profiles(full_name, avatar_url)').eq('artist_id', artistId).order('created_at', { ascending: false }).limit(5)
  return data || []
}

export default function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuthStore()
  const [bioExpanded, setBioExpanded] = useState(false)
  const [isFav, setIsFav] = useState(false)

  const { data: artist, isLoading } = useQuery({ queryKey: ['artist', id], queryFn: () => fetchArtist(id) })
  const { data: reviews } = useQuery({ queryKey: ['reviews', id], queryFn: () => fetchReviews(id) })

  const toggleFav = async () => {
    if (!session) { router.push('/(onboarding)/auth'); return }
    if (isFav) {
      await supabase.from('favorites').delete().match({ user_id: session.user.id, artist_id: id })
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, artist_id: id })
    }
    setIsFav(!isFav)
  }

  if (isLoading || !artist) return <View style={styles.loading}><Text style={styles.loadingText}>Chargement...</Text></View>

  const bioLines = artist.bio?.split('\n') ?? []
  const bioPreview = artist.bio ? artist.bio.slice(0, 140) : null

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.hero}>
          {artist.avatar_url
            ? <Image source={{ uri: artist.avatar_url }} style={styles.heroImg} />
            : <View style={[styles.heroImg, styles.heroFallback]}><Text style={styles.heroLetter}>{artist.stage_name[0]}</Text></View>
          }
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Retour">
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{artist.stage_name}</Text>
              {artist.is_verified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Vérifié</Text></View>}
            </View>
            <Text style={styles.heroCity}>{artist.city}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { val: artist.rating > 0 ? `${artist.rating.toFixed(1)}★` : 'Nouveau', label: 'Note' },
            { val: artist.review_count, label: 'Avis' },
            { val: artist.total_bookings, label: 'Séances' },
            { val: artist.hourly_rate ? `${artist.hourly_rate}€` : '–', label: '/ heure' },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Styles */}
        <View style={styles.section}>
          <View style={styles.stylesRow}>
            {artist.styles.map(s => (
              <View key={s} style={styles.stylePill}><Text style={styles.styleText}>{s}</Text></View>
            ))}
          </View>
        </View>

        {/* Bio */}
        {artist.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.bio} numberOfLines={bioExpanded ? undefined : 3}>{artist.bio}</Text>
            {artist.bio.length > 140 && (
              <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
                <Text style={styles.bioToggle}>{bioExpanded ? 'Voir moins' : 'Voir plus →'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Portfolio */}
        {artist.portfolio_urls?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {artist.portfolio_urls.map((url, i) => (
                <Image key={i} source={{ uri: url }} style={styles.portfolioImg} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Avis */}
        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            {reviews.map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarLetter}>{r.profiles?.full_name?.[0] ?? '?'}</Text></View>
                  <View>
                    <Text style={styles.reviewName}>{r.profiles?.full_name ?? 'Client'}</Text>
                    <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                  </View>
                </View>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CTA sticky */}
      <View style={styles.ctaBar}>
        <TouchableOpacity style={[styles.favBtn, isFav && styles.favBtnActive]} onPress={toggleFav} accessibilityRole="button" accessibilityLabel={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
          <Text style={styles.favIcon}>{isFav ? '♥' : '♡'}</Text>
        </TouchableOpacity>
        <Button label="Réserver" onPress={() => router.push(`/booking/${artist.id}`)} style={{ flex: 1 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.beige },
  loadingText: { fontFamily: 'Syne_400Regular', fontSize: 16, color: Colors.muted },
  hero: { height: 320, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroFallback: { backgroundColor: Colors.muted, alignItems: 'center', justifyContent: 'center' },
  heroLetter: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 80, color: Colors.white },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,14,23,0.35)' },
  backBtn: { position: 'absolute', top: 52, left: 20, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: Colors.ink },
  heroInfo: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.white, flex: 1 },
  verifiedBadge: { backgroundColor: Colors.coral, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  verifiedText: { fontFamily: 'Syne_600SemiBold', fontSize: 12, color: Colors.white },
  heroCity: { fontFamily: 'Syne_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.cream, marginHorizontal: 20, marginTop: 20, borderRadius: 16, padding: 16, ...Shadows.sm },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Colors.ink },
  statLabel: { fontFamily: 'Syne_400Regular', fontSize: 12, color: Colors.muted },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontFamily: 'Syne_600SemiBold', fontSize: 16, color: Colors.ink, marginBottom: 12 },
  stylesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stylePill: { backgroundColor: Colors.cream, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
  styleText: { fontFamily: 'Syne_500Medium', fontSize: 13, color: Colors.ink },
  bio: { fontFamily: 'Syne_400Regular', fontSize: 15, color: Colors.ink, lineHeight: 24 },
  bioToggle: { fontFamily: 'Syne_500Medium', fontSize: 14, color: Colors.coral, marginTop: 6 },
  portfolioImg: { width: (W - 48) / 2, height: (W - 48) / 2, borderRadius: 12 },
  reviewCard: { backgroundColor: Colors.cream, borderRadius: 14, padding: 14, marginBottom: 10, gap: 8, ...Shadows.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.beige, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarLetter: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Colors.coral },
  reviewName: { fontFamily: 'Syne_600SemiBold', fontSize: 14, color: Colors.ink },
  reviewStars: { fontSize: 13, color: '#F59E0B' },
  reviewComment: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.ink, lineHeight: 22 },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 36, backgroundColor: Colors.beige, borderTopWidth: 1, borderTopColor: Colors.border },
  favBtn: { width: 54, height: 54, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  favBtnActive: { borderColor: Colors.coral, backgroundColor: Colors.coral + '15' },
  favIcon: { fontSize: 22, color: Colors.coral },
})
