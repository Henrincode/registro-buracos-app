import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { migrate } from "@/data/migrate";

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <SQLiteProvider
        databaseName="alerts.db"
        onInit={migrate}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#020617",
            },
          }}
        />
      </SQLiteProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617", // slate 950
  },
});