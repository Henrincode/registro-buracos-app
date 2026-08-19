import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { router } from "expo-router";
import { useAlertsDatabase, AlertResponse } from "@/data/useAlertsDatabase";

export default function FullMap() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const alertsDb = useAlertsDatabase();

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const data = await alertsDb.listAll();
      setAlerts(data);
    } catch (error) {
      console.log("Erro ao carregar alertas no mapa:", error);
    }
  }

  // Região inicial (centralizada no primeiro alerta ou em uma posição padrão)
  const initialRegion =
    alerts.length > 0
      ? {
          latitude: alerts[0].latitude,
          longitude: alerts[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: -22.7394,
          longitude: -47.3314,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

  return (
    <View style={styles.container}>
      {/* Botão de Voltar Flutuante */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <MapView style={styles.map} initialRegion={initialRegion}>
        {alerts.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            pinColor="#f87171"
          >
            <Callout style={styles.callout}>
              <View style={styles.calloutContainer}>
                {item.ilink && (
                  <Image source={{ uri: item.ilink }} style={styles.calloutImage} />
                )}
                <Text style={styles.calloutTitle}>{item.title}</Text>
                <Text style={styles.calloutText}>
                  {item.observation || "Sem endereço detalhado"}
                </Text>
                <Text style={styles.calloutAuthor}>Por: {item.user_name}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  callout: {
    width: 200,
  },
  calloutContainer: {
    padding: 5,
  },
  calloutImage: {
    width: "100%",
    height: 100,
    borderRadius: 6,
    marginBottom: 6,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#0f172a",
  },
  calloutText: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  calloutAuthor: {
    fontSize: 10,
    color: "#0284c7",
    marginTop: 4,
  },
});