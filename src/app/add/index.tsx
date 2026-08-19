import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, MapPressEvent } from "react-native-maps";

import Button from "@/components/Button";
import Input from "@/components/Form/Input";
import Container from "@/components/Component";
import { useAlertsDatabase } from "@/data/useAlertsDatabase";

export default function AddOrEditAlert() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Buraco");
  const [observation, setObservation] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Coordenadas
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const alertsDb = useAlertsDatabase();

  // Carrega os dados se for MODO EDIÇÃO
  useEffect(() => {
    if (isEditing && id) {
      loadAlertData(Number(id));
    } else {
      // Se for novo cadastro, pega o GPS automaticamente
      getCurrentLocation();
    }
  }, [id]);

  async function loadAlertData(alertId: number) {
    try {
      setLoading(true);
      const data = await alertsDb.show(alertId);
      if (data) {
        setTitle(data.title);
        setCategory(data.category || "Buraco");
        setObservation(data.observation || "");
        setImageUri(data.ilink);
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } else {
        Alert.alert("Erro", "Alerta não encontrado.");
        router.back();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar os dados do reporte.");
    } finally {
      setLoading(false);
    }
  }

  // 1. Obter Localização via GPS (expo-location)
  async function getCurrentLocation() {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Precisamos do acesso à localização para marcar o buraco no mapa."
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter a localização atual.");
    } finally {
      setLoadingLocation(false);
    }
  }

  // 2. Tirar Foto com Câmera
  async function handleTakePicture() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Permissão para acessar a câmera é necessária.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  }

  // 3. Escolher Foto da Galeria
  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  }

  // Permite ajustar a posição tocando no Mapa
  function handleMapPress(e: MapPressEvent) {
    setLocation(e.nativeEvent.coordinate);
  }

  // 4. Salvar (Criar ou Atualizar)
  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Atenção", "Por favor, digite um título para o alerta.");
      return;
    }

    if (!location) {
      Alert.alert("Atenção", "É necessário capturar a localização do problema.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        // Atualizar
        await alertsDb.update({
          id: Number(id),
          title: title.trim(),
          category,
          observation: observation.trim(),
          ilink: imageUri,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        Alert.alert("Sucesso", "Reporte atualizado com sucesso!");
      } else {
        // Criar (Mockando user_id como 1 por enquanto)
        await alertsDb.create({
          user_id: 1,
          title: title.trim(),
          category,
          observation: observation.trim(),
          ilink: imageUri,
          latitude: location.latitude,
          longitude: location.longitude,
          status: "open",
        });
        Alert.alert("Sucesso", "Novo reporte cadastrado com sucesso!");
      }

      router.replace("/dashboard");
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar o reporte.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEditing && !title) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>
        {isEditing ? "Editar Reporte" : "Novo Reporte"}
      </Text>

      <Container gap={16} padding={0}>
        {/* Formulário */}
        <Input
          value={title}
          onChange={setTitle}
          placeHodler="Título (ex: Buraco profundo na pista)"
        />

        <Input
          value={category}
          onChange={setCategory}
          placeHodler="Categoria (ex: Buraco, Asfalto cedendo)"
        />

        <Input
          value={observation}
          onChange={setObservation}
          placeHodler="Observações / Ponto de referência"
        />

        {/* Seção da Imagem */}
        <Text style={styles.sectionLabel}>Foto do Local</Text>
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setImageUri(null)}
            >
              <Text style={styles.removeImageText}>Remover Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={handleTakePicture}>
              <Text style={styles.photoBtnText}>📷 Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickImage}>
              <Text style={styles.photoBtnText}>🖼️ Galeria</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção do Mapa / GPS */}
        <View style={styles.locationHeader}>
          <Text style={styles.sectionLabel}>Localização no Mapa</Text>
          <TouchableOpacity onPress={getCurrentLocation} disabled={loadingLocation}>
            <Text style={styles.gpsLink}>
              {loadingLocation ? "Buscando GPS..." : "🎯 Recapturar GPS"}
            </Text>
          </TouchableOpacity>
        </View>

        {location ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              onPress={handleMapPress}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={location}
                draggable
                onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                title="Local do problema"
                description="Arraste para ajustar"
              />
            </MapView>
            <Text style={styles.mapHint}>Toque no mapa para ajustar o ponto exato</Text>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator color="#38bdf8" />
            <Text style={styles.mapPlaceholderText}>Obtendo sinal do GPS...</Text>
          </View>
        )}

        {/* Botões Salvar / Cancelar */}
        <View style={styles.actions}>
          <Button
            text={loading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
            onPress={handleSave}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  photoBtnText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  imagePreviewContainer: {
    alignItems: "center",
    gap: 8,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  removeImageBtn: {
    padding: 6,
  },
  removeImageText: {
    color: "#f87171",
    fontSize: 13,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  gpsLink: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "500",
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapHint: {
    position: "absolute",
    bottom: 6,
    left: 10,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    color: "#cbd5e1",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  mapPlaceholderText: {
    color: "#64748b",
    fontSize: 13,
  },
  actions: {
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    padding: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#94a3b8",
    fontSize: 15,
  },
});