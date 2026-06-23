import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth.store'
import { Colors, Shadows } from '../../constants/colors'

async function fetchConversations(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, artists(stage_name, avatar_url), messages(content, created_at)')
    .eq('client_id', userId)
    .in('status', ['confirmed', 'deposit_paid', 'in_progress', 'completed'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default function MessagesScreen() {
  const { session } = useAuthStore()
  const { data: conversations } = useQuery({
    queryKey: ['conversations', session?.user.id],
    queryFn: () => fetchConversations(session!.user.id),
    enabled: !!session,
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations || []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push(`/chat/${item.id}`)} accessibilityRole="button" accessibilityLabel={`Conversation avec ${item.artists?.stage_name}`}>
            <View style={styles.avatar}>
              {item.artists?.avatar_url
                ? <Image source={{ uri: item.artists.avatar_url }} style={styles.avatarImg} />
                : <Text style={styles.avatarLetter}>{item.artists?.stage_name?.[0] ?? '?'}</Text>
              }
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.artists?.stage_name}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {item.messages?.[0]?.content ?? 'Réservation confirmée 📅'}
              </Text>
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptyDesc}>Tes conversations apparaîtront ici après une réservation confirmée.</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.ink, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  list: { paddingHorizontal: 20, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.cream, borderRadius: 14, padding: 14, ...Shadows.sm },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.beige, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 50, height: 50, borderRadius: 25 },
  avatarLetter: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Colors.coral },
  info: { flex: 1 },
  name: { fontFamily: 'Syne_600SemiBold', fontSize: 15, color: Colors.ink },
  lastMsg: { fontFamily: 'Syne_400Regular', fontSize: 13, color: Colors.muted, marginTop: 2 },
  date: { fontFamily: 'Syne_400Regular', fontSize: 12, color: Colors.muted },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: 'Syne_600SemiBold', fontSize: 18, color: Colors.ink },
  emptyDesc: { fontFamily: 'Syne_400Regular', fontSize: 14, color: Colors.muted, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
})
