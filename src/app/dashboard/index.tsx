import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import Button from "@/components/Button";
import { useAlertsDatabase, AlertResponse } from "@/data/useAlertsDatabase";

export default function Dashboard() {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const alertsDb = useAlertsDatabase();

  // Carrega todos os reportes do banco
  async function loadAlerts() {
    try {
      const data = await alertsDb.listAll();
      setAlerts(data);
    } catch (error) {
      console.log("Erro ao carregar alertas:", error);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  // Abre o modal de perfil/detalhes do buraco
  function handleOpenDetails(item: AlertResponse) {
    setSelectedAlert(item);
    setModalVisible(true);
  }

  // Deleta o alerta após confirmação
  async function handleDeleteAlert(id: number) {
    Alert.alert("Excluir Reporte", "Deseja realmente remover este alerta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await alertsDb.remove(id);
            setModalVisible(false);
            setSelectedAlert(null);
            loadAlerts();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o alerta.");
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Desvia.AI!</Text>
          <Text style={styles.headerSubtitle}>
            {alerts.length} buracos reportados
          </Text>
        </View>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push("/full-map")}
        >
          <Text style={styles.mapButtonText}>Mapa Completo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Cards */}
      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleOpenDetails(item)}
          >
            {/* Foto do problema */}
            {item.ilink ? (
              <Image source={{ uri: item.ilink }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.noImage]}>
                <Text style={styles.noImageText}>Sem foto</Text>
              </View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAddress} numberOfLines={1}>
                📍 {item.observation || "Endereço não informado"}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAuthor}>Por: {item.user_name}</Text>
                <Text style={styles.cardDate}>
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum buraco reportado ainda.
            </Text>
          </View>
        }
      />

      {/* Botão Flutuante (+) para Cadastrar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Detalhes / Perfil do Buraco */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAlert && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Imagem Ampliada */}
                {selectedAlert.ilink ? (
                  <Image
                    source={{ uri: selectedAlert.ilink }}
                    style={styles.modalImage}
                  />
                ) : (
                  <View style={[styles.modalImage, styles.noImage]}>
                    <Text style={styles.noImageText}>Sem foto registrada</Text>
                  </View>
                )}

                <Text style={styles.modalTitle}>{selectedAlert.title}</Text>
                <Text style={styles.modalAuthor}>
                  Reportado por: {selectedAlert.user_name} ({selectedAlert.user_email})
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedAlert.observation || "Sem observações adicionais."}
                </Text>

                {/* Quadrado do Mapa exibindo o ponto exato */}
                <Text style={styles.mapLabel}>Localização no Mapa:</Text>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: selectedAlert.latitude,
                      longitude: selectedAlert.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: selectedAlert.latitude,
                        longitude: selectedAlert.longitude,
                      }}
                      title={selectedAlert.title}
                    />
                  </MapView>
                </View>

                {/* Botões de Ação */}
                <View style={styles.modalActions}>
                  <Button
                    text="Editar"
                    flex
                    onPress={() => {
                      setModalVisible(false);
                      router.push({
                        pathname: "/add",
                        params: { id: selectedAlert.id },
                      });
                    }}
                  />
                  <Button
                    text="Excluir"
                    flex
                    onPress={() => handleDeleteAlert(selectedAlert.id)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617", // slate 950
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  mapButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  mapButtonText: {
    color: "#38bdf8",
    fontWeight: "600",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  noImage: {
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#64748b",
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 8,
  },
  cardAuthor: {
    fontSize: 12,
    color: "#38bdf8",
  },
  cardDate: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2563eb",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: {
    color: "#ffffff",
    fontSize: 32,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  modalAuthor: {
    fontSize: 12,
    color: "#38bdf8",
    marginVertical: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: "#cbd5e1",
    marginVertical: 10,
  },
  mapLabel: {
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  closeButton: {
    padding: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#94a3b8",
    fontWeight: "600",
  },
});