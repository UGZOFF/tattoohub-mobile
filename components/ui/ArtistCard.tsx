import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Colors, Shadows } from '../../constants/colors'
import { Artist } from '../../lib/supabase'

interface ArtistCardProps {
  artist: Artist
  onPress: () => void
}

export function ArtistCard({ artist, onPress }: ArtistCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`Voir le profil de ${artist.stage_name}`}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {artist.avatar_url
          ? <Image source={{ uri: artist.avatar_url }} style={styles.avatar} />
          : <View style={[styles.avatar, styles.avatarFallback]}><Text style={styles.avatarLetter}>{artist.stage_name[0]}</Text></View>
        }
        {artist.is_verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{artist.stage_name}</Text>
          {artist.early_adopter && <View style={styles.earlyBadge}><Text style={styles.earlyText}>🔥 Early</Text></View>}
        </View>
        <Text style={styles.city}>{artist.city}</Text>

        {/* Styles */}
        <View style={styles.styles}>
          {artist.styles.slice(0, 3).map(s => (
            <View key={s} style={styles.stylePill}><Text style={styles.styleText}>{s}</Text></View>
          ))}
          {artist.styles.length > 3 && <Text style={styles.moreStyles}>+{artist.styles.length - 3}</Text>}
        </View>

        {/* Rating + Prix */}
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingVal}>{artist.rating > 0 ? artist.rating.toFixed(1) : 'Nouveau'}</Text>
            {artist.review_count > 0 && <Text style={styles.reviewCount}>({artist.review_count})</Text>}
          </View>
          {artist.hourly_rate && <Text style={styles.price}>{artist.hourly_rate}€/h</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.cream, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 14, ...Shadows.md },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 12 },
  avatarFallback: { backgroundColor: Colors.beige, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.coral },
  verifiedBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: Colors.coral, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.cream },
  verifiedText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: Colors.ink, flex: 1 },
  earlyBadge: { backgroundColor: '#FFF3CD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  earlyText: { fontFamily: 'Syne_500Medium', fontSize: 11, color: '#856404' },
  city: { fontFamily: 'Syne_400Regular', fontSize: 13, color: Colors.muted },
  styles: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  stylePill: { backgroundColor: Colors.beige, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  styleText: { fontFamily: 'Syne_500Medium', fontSize: 11, color: Colors.ink },
  moreStyles: { fontFamily: 'Syne_400Regular', fontSize: 11, color: Colors.muted, alignSelf: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star: { color: '#F59E0B', fontSize: 14 },
  ratingVal: { fontFamily: 'Syne_600SemiBold', fontSize: 13, color: Colors.ink },
  reviewCount: { fontFamily: 'Syne_400Regular', fontSize: 12, color: Colors.muted },
  price: { fontFamily: 'Syne_600SemiBold', fontSize: 14, color: Colors.coral },
})
