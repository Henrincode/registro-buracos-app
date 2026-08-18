import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{
        headerShown: false, contentStyle: {
          backgroundColor: '#020617'
        }
      }} />
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617' // slate 950
  }
})