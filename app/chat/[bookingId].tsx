import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { useAuthStore } from "../../stores/auth.store"

export default function ChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { session } = useAuthStore()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const listRef = useRef<FlatList>(null)

  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*, artists(stage_name)").eq("id", bookingId).single()
      return data
    },
  })

  useEffect(() => {
    supabase.from("messages").select("*").eq("booking_id", bookingId).order("created_at").then(({ data }) => {
      if (data) setMessages(data)
    })
    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `booking_id=eq.${bookingId}` },
        payload => {
          setMessages(prev => [...prev, payload.new])
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [bookingId])

  const send = async () => {
    if (!input.trim() || !session) return
    const text = input.trim()
    setInput("")
    await supabase.from("messages").insert({ booking_id: bookingId, sender_id: session.user.id, content: text, message_type: "text" })
  }

  const isMe = (sid: string) => sid === session?.user.id

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerName}>{booking?.artists?.stage_name ?? "Chat"}</Text>
          {booking?.date && <Text style={styles.headerDate}>Séance le {new Date(booking.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}</Text>}
        </View>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, isMe(item.sender_id) ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe(item.sender_id) && styles.bubbleTextMe]}>{item.content}</Text>
            <Text style={styles.bubbleTime}>{new Date(item.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Text>
          </View>
        )}
      />
      <View style={styles.inputBar}>
        <TextInput style={styles.inputField} value={input} onChangeText={setInput} placeholder="Ton message..." placeholderTextColor="#8C8A84" multiline />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() && { backgroundColor: "#E5E3DF" }]} onPress={send} disabled={!input.trim()}>
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EF" },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#E5E3DF", backgroundColor: "#FDFAF5" },
  back: { fontSize: 22, color: "#0F0E17", width: 36 },
  headerName: { fontWeight: "700", fontSize: 16, color: "#0F0E17" },
  headerDate: { fontSize: 13, color: "#8C8A84" },
  bubble: { maxWidth: "78%", padding: 12, borderRadius: 18, gap: 4 },
  bubbleMe: { alignSelf: "flex-end", backgroundColor: "#E8573A", borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: "flex-start", backgroundColor: "#FDFAF5", borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: "#0F0E17", lineHeight: 22 },
  bubbleTextMe: { color: "#fff" },
  bubbleTime: { fontSize: 11, color: "rgba(255,255,255,0.6)", alignSelf: "flex-end" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 16, paddingBottom: 36, backgroundColor: "#FDFAF5", borderTopWidth: 1, borderTopColor: "#E5E3DF" },
  inputField: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: "#F5F3EF", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: "#0F0E17", borderWidth: 1, borderColor: "#E5E3DF" },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8573A", alignItems: "center", justifyContent: "center" },
  sendIcon: { color: "#fff", fontSize: 20, fontWeight: "700" },
})