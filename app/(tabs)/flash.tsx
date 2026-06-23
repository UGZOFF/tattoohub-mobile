import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase, FlashEvent } from '../../lib/supabase'
import { Colors, Shadows } from '../../constants/colors'
import { TATTOO_STYLES } from '../../constants/typography'

async function fetchFlash(style: string | null) {
  let req = supabase.from('flash_events').select('*, artists(stage_name, avatar_url, is_verified)').eq('is_active', true)
  if (style) req = req.eq('style', style)
  const { data, error } = await req.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

function FlashCard({ item, onPress }: { item: any; onPress: () => void }) {
  const slotsLeft = item.available_slots - item.booked_slots
  const isUrgent = slotsLeft <= 2
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel={`Flash tattoo: ${item.title}`}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      {isUrgent && <View style={styles.urgentBadge}><Text style={styles.urgentText}>{slotsLeft} place{slotsLeft > 1 ? 's' : ''}</Text></View>}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardPrice}>{item.price}€</Text>
        </View>
        <Text style={styles.cardArtist}>{item.artists?.stage_name}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.sizePill}><Text style={styles.sizeText}>{item.size}</Text></View>
          <View style={styles.stylePill}><Text style={styles.styleText}>{item.style}</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function FlashScreen() {
  const [activeStyle, setActiveStyle] = useState<string | null>(null)
  const { data: flashes, isLoading } = useQuery({
    queryKey: ['flash', activeStyle],
    queryFn: () => fetchFlash(activeStyle),
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flash Tattoo</Text>
        <Text style={styles.subtitle}>Designs uniques, dispo immédiate</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filters}>
        <TouchableOpacity style={[styles.pill, !activeStyle && styles.pillActive]} onPress={() => setActiveStyle(null)}>
          <Text style={[styles.pillText, !activeStyle && styles.pillTextActive]}>Tous</Text>
        </TouchableOpacity>
        {TATTOO_STYLES.map(s => (
          <TouchableOpacity key={s} style={[styles.pill, activeStyle === s && styles.pillActive]} onPress={() => setActiveStyle(s === activeStyle ? null : s)}>
            <Text style={[styles.pillText, activeStyle === s && styles.pillTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={flashes || []}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <FlashCard item={item} onPress={() => router.push(`/booking/${item.artist_id}?flashId=${item.id}`)} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>Aucun flash disponible.</Text> : null}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 12, gap: 4 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.ink },
  subtitle: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted },
  filtersScroll: {},
  filters: { paddingHorizontal: 20, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  pillActive: { backgroundColor: Colors.coral, borderColor: Colors.coral },
  pillText: { fontFamily: 'Syne_500Medium', fontSize: 13, color: Colors.ink },
  pillTextActive: { color: Colors.white },
  grid: { padding: 20, gap: 12 },
  card: { flex: 1, backgroundColor: Colors.cream, borderRadius: 14, overflow: 'hidden', ...Shadows.sm },
  cardImage: { width: '100%', aspectRatio: 1 },
  urgentBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.error, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  urgentText: { fontFamily: 'Syne_600SemiBold', fontSize: 11, color: Colors.white },
  cardBody: { padding: 10, gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontFamily: 'Syne_600SemiBold', fontSize: 13, color: Colors.ink, flex: 1 },
  cardPrice: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Colors.coral },
  cardArtist: { fontFamily: 'Syne_400Regular', fontSize: 12, color: Colors.muted },
  cardMeta: { flexDirection: 'row', gap: 4 },
  sizePill: { backgroundColor: Colors.beige, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sizeText: { fontFamily: 'Syne_500Medium', fontSize: 10, color: Colors.ink },
  stylePill: { backgroundColor: Colors.beige, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  styleText: { fontFamily: 'Syne_500Medium', fontSize: 10, color: Colors.ink },
  empty: { fontFamily: 'Syne_400Regular', fontSize: 15, color: Colors.muted, textAlign: 'center', marginTop: 40 },
})
