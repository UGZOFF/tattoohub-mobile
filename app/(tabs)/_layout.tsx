import { Tabs } from "expo-router"

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const { Text } = require("react-native")
  return <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#FDFAF5", borderTopColor: "#E5E3DF", height: 80, paddingBottom: 16, paddingTop: 8 },
        tabBarActiveTintColor: "#E8573A",
        tabBarInactiveTintColor: "#8C8A84",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Accueil", tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tabs.Screen name="flash" options={{ title: "Flash", tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />
    </Tabs>
  )
}