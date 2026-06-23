import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase, Artist } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth.store'
import { Colors } from '../../constants/colors'
import { ArtistCard } from '../../components/ui/ArtistCard'
import { TATTOO_STYLES } from '../../constants/typography'

async function fetchArtists(query: string, styles: string[]) {
  let req = supabase.from('artists').select('*').eq('is_active', true)
  if (query) req = req.ilike('stage_name', `%${query}%`)
  if (styles.length) req = req.contains('styles', styles)
  const { data, error } = await req.order('rating', { ascending: false }).limit(30)
  if (error) throw error
  return data as Artist[]
}

export default function HomeScreen() {
  const { profile } = useAuthStore()
  const [search, setSearch] = useState('')
  const [activeStyles, setActiveStyles] = useState<string[]>([])
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data: artists, isLoading, refetch } = useQuery({
    queryKey: ['artists', debouncedSearch, activeStyles],
    queryFn: () => fetchArtists(debouncedSearch, activeStyles),
  })

  const toggleStyle = (s: string) =>
    setActiveStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  let searchTimeout: ReturnType<typeof setTimeout>
  const handleSearch = (text: string) => {
    setSearch(text)
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => setDebouncedSearch(text), 300)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋</Text>
        <Text style={styles.title}>Trouve ton artiste</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={handleSearch}
          placeholder="Rechercher un artiste..."
          placeholderTextColor={Colors.muted}
          accessibilityLabel="Rechercher un artiste"
        />
      </View>

      {/* Filtres styles */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filters}>
        {TATTOO_STYLES.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterPill, activeStyles.includes(s) && styles.filterPillActive]}
            onPress={() => toggleStyle(s)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: activeStyles.includes(s) }}
          >
            <Text style={[styles.filterText, activeStyles.includes(s) && styles.filterTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste artistes */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.coral} size="large" />
        </View>
      ) : (
        <FlatList
          data={artists || []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ArtistCard artist={item} onPress={() => router.push(`/artist/${item.id}`)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.coral} />}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun artiste trouvé.{'\n'}Modifie tes filtres.</Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, gap: 4 },
  greeting: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.ink },
  searchRow: { paddingHorizontal: 20 },
  search: { height: 48, backgroundColor: Colors.cream, borderRadius: 12, paddingHorizontal: 16, fontFamily: 'Syne_400Regular', fontSize: 15, color: Colors.ink, borderWidth: 1, borderColor: Colors.border },
  filtersScroll: { marginTop: 12 },
  filters: { paddingHorizontal: 20, gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  filterPillActive: { backgroundColor: Colors.coral, borderColor: Colors.coral },
  filterText: { fontFamily: 'Syne_500Medium', fontSize: 13, color: Colors.ink },
  filterTextActive: { color: Colors.white },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, gap: 12 },
  empty: { fontFamily: 'Syne_400Regular', fontSize: 15, color: Colors.muted, textAlign: 'center', marginTop: 40, lineHeight: 24 },
})
