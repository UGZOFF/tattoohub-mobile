import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { supabase, Message } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth.store'
import { Colors } from '../../constants/colors'

async function fetchMessages(bookingId: string) {
  const { data } = await supabase.from('messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true })
  return data || []
}

async function fetchBooking(id: string) {
  const { data } = await supabase.from('bookings').select('*, artists(stage_name, avatar_url), profiles(full_name)').eq('id', id).single()
  return data
}

export default function ChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { session } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const { data: booking } = useQuery({ queryKey: ['booking', bookingId], queryFn: () => fetchBooking(bookingId) })

  // Charger les messages initiaux
  useEffect(() => {
    fetchMessages(bookingId).then(setMessages)
  }, [bookingId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [bookingId])

  const sendMessage = async () => {
    if (!input.trim() || !session) return
    const text = input.trim()
    setInput('')
    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: session.user.id,
      content: text,
      message_type: 'text',
    })
  }

  const isMe = (senderId: string) => senderId === session?.user.id

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Retour">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{booking?.artists?.stage_name ?? 'Chat'}</Text>
          <Text style={styles.headerStatus}>{booking?.date ? `Séance le ${new Date(booking.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}` : ''}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, isMe(item.sender_id) ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe(item.sender_id) ? styles.bubbleTextMe : styles.bubbleTextThem]}>{item.content}</Text>
            <Text style={styles.bubbleTime}>{new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.inputField}
          value={input}
          onChangeText={setInput}
          placeholder="Ton message..."
          placeholderTextColor={Colors.muted}
          multiline
          returnKeyType="default"
          accessibilityLabel="Saisir un message"
        />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim()} accessibilityRole="button" accessibilityLabel="Envoyer">
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.beige },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.cream },
  back: { fontSize: 22, color: Colors.ink, width: 36 },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: 'Syne_600SemiBold', fontSize: 16, color: Colors.ink },
  headerStatus: { fontFamily: 'Syne_400Regular', fontSize: 13, color: Colors.muted },
  msgList: { padding: 16, gap: 8 },
  bubble: { maxWidth: '78%', padding: 12, borderRadius: 18, gap: 4 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: Colors.coral, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: Colors.cream, borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: 'Syne_400Regular', fontSize: 15, lineHeight: 22 },
  bubbleTextMe: { color: Colors.white },
  bubbleTextThem: { color: Colors.ink },
  bubbleTime: { fontFamily: 'Syne_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 16, paddingBottom: 36, backgroundColor: Colors.cream, borderTopWidth: 1, borderTopColor: Colors.border },
  inputField: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: Colors.beige, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontFamily: 'Syne_400Regular', fontSize: 15, color: Colors.ink, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.coral, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { color: Colors.white, fontSize: 20, fontWeight: '700' },
})
