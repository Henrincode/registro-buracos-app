import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

import Button from "@/components/Button";
import Input from "@/components/Form/Input";
import { useAlertsDatabase } from "@/data/useAlertsDatabase";
import { useAuth } from "@/app/_layout";

export default function AddOrEditAlert() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Buraco");
  const [zip, setZip] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [complement, setComplement] = useState("");
  const [observation, setObservation] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  const alertsDb = useAlertsDatabase();
  const { user } = useAuth();

  useEffect(() => {
    if (isEditing) {
      loadDataForEdit(Number(id));
    } else {
      askLocationPreference();
    }
  }, [id]);

  // Pergunta ao usuário se quer autodetectar ou preencher manual
  function askLocationPreference() {
    Alert.alert(
      "Localização",
      "Como deseja preencher o endereço do alerta?",
      [
        {
          text: "Detectar pelo GPS",
          onPress: () => fetchGPSAndReverseGeocode(),
        },
        {
          text: "Preencher Manualmente",
          style: "cancel",
        },
      ]
    );
  }

  async function loadDataForEdit(alertId: number) {
    try {
      const alertData = await alertsDb.getById(alertId);
      if (alertData) {
        setTitle(alertData.title);
        setCategory(alertData.category || "Buraco");
        setZip(alertData.zip || "");
        setStreet(alertData.street || "");
        setNumber(alertData.number || "");
        setNeighborhood(alertData.neighborhood || "");
        setCity(alertData.city || "");
        setComplement(alertData.complement || "");
        setObservation(alertData.observation || "");
        setImageUri(alertData.ilink || null);
        setLocation({
          latitude: alertData.latitude,
          longitude: alertData.longitude,
        });
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados do reporte.");
    }
  }

  // Busca GPS e faz Geocodificação Reversa para preencher os campos automaticamente
  async function fetchGPSAndReverseGeocode() {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permita o acesso à localização para autodetectar o endereço."
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);

      // Converte coordenadas em Endereço Legível
      const [address] = await Location.reverseGeocodeAsync(coords);
      if (address) {
        setZip(address.postalCode || "");
        setStreet(address.street || address.name || "");
        setNumber(address.streetNumber || "");
        setNeighborhood(address.district || address.subregion || "");
        setCity(address.city || address.region || "");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter o endereço atual.");
    } finally {
      setLoadingLocation(false);
    }
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão negada", "É preciso acesso à galeria para enviar fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Atenção", "Por favor, preencha o título do alerta.");
      return;
    }

    if (!location) {
      Alert.alert(
        "Atenção",
        "É necessário capturar a localização (ou detectar pelo GPS) para cadastrar."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        user_id: user?.id || 1,
        title: title.trim(),
        category,
        zip,
        street,
        number,
        neighborhood,
        city,
        complement,
        observation,
        ilink: imageUri || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      if (isEditing) {
        await alertsDb.update(Number(id), payload);
        Alert.alert("Sucesso", "Alerta atualizado com sucesso!");
      } else {
        await alertsDb.create(payload);
        Alert.alert("Sucesso", "Alerta cadastrado com sucesso!");
      }

      router.back();
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar o alerta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.headerTitle}>
        {isEditing ? "Editar Alerta" : "Novo Alerta"}
      </Text>

      {/* Botão de Redetectar GPS */}
      <TouchableOpacity
        style={styles.gpsButton}
        onPress={fetchGPSAndReverseGeocode}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator color="#38bdf8" />
        ) : (
          <Text style={styles.gpsButtonText}>
            📍 {location ? "Atualizar por GPS (Auto)" : "Detectar Endereço por GPS"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Seção da Foto */}
      <View style={styles.section}>
        <Text style={styles.label}>Foto do Buraco/Problema</Text>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setImageUri(null)}
            >
              <Text style={styles.removeImageText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
            <Text style={styles.uploadButtonText}>📷 Selecionar Foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Formulário */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Título do Alerta *</Text>
        <Input
          value={title}
          onChange={setTitle}
          placeHodler="Ex: Buraco fundo na pista"
        />

        <Text style={styles.label}>CEP</Text>
        <Input value={zip} onChange={setZip} placeHodler="00000-000" />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 2 }}>
            <Text style={styles.label}>Rua / Avenida</Text>
            <Input
              value={street}
              onChange={setStreet}
              placeHodler="Nome da via"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Número</Text>
            <Input value={number} onChange={setNumber} placeHodler="123" />
          </View>
        </View>

        <Text style={styles.label}>Bairro</Text>
        <Input
          value={neighborhood}
          onChange={setNeighborhood}
          placeHodler="Nome do bairro"
        />

        <Text style={styles.label}>Cidade</Text>
        <Input value={city} onChange={setCity} placeHodler="Nome da cidade" />

        <Text style={styles.label}>Complemento / Ponto de Referência</Text>
        <Input
          value={complement}
          onChange={setComplement}
          placeHodler="Ex: Próximo à padaria"
        />

        <Text style={styles.label}>Observações Adicionais</Text>
        <Input
          value={observation}
          onChange={setObservation}
          placeHodler="Detalhes sobre os riscos ou tamanho"
        />
      </View>

      {/* Ações */}
      <View style={styles.actions}>
        <Button
          text={saving ? "Salvando..." : isEditing ? "Atualizar" : "Salvar Alerta"}
          onPress={handleSave}
        />
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  gpsButton: {
    backgroundColor: "#1e293b",
    borderColor: "#38bdf8",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  gpsButtonText: {
    color: "#38bdf8",
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },
  uploadButton: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#94a3b8",
  },
  imageContainer: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  removeImageText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  formGroup: {
    gap: 4,
  },
  actions: {
    marginTop: 24,
    gap: 10,
  },
  cancelBtn: {
    padding: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#94a3b8",
  },
});