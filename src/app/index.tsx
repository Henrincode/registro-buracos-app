import React, { useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { router } from "expo-router";

import Button from "@/components/Button";
import Container from "@/components/Component";
import Input from "@/components/Form/Input";
import tw from "@/styles/tailwindColors";

import { useUsersDatabase } from "@/data/useUsersDatabase";
import { useAuth } from "@/app/_layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const userDb = useUsersDatabase();
  const { signIn } = useAuth();

  async function handleLogin() {
    setErrorMsg("");

    if (email.trim() === "" || password.trim() === "") {
      setErrorMsg("Preencha e-mail e senha para entrar.");
      return;
    }

    try {
      // Valida credenciais no SQLite aplicando o hash SHA-256
      const user = await userDb.verifyLogin(
        email.trim().toLowerCase(),
        password
      );

      if (!user) {
        setErrorMsg("E-mail ou senha incorretos.");
        return;
      }

      // Salva o usuário no contexto global e vai para a dashboard
      signIn(user);
      router.replace("/dashboard");
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar realizar o login.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desvia.AI!</Text>

      <Container gap={20} padding={20}>
        <Input
          value={email}
          onChange={setEmail}
          placeHodler="seu@email.com"
        />
        <Input
          value={password}
          onChange={setPassword}
          placeHodler="suaS3nh@"
        />

        {errorMsg !== "" && (
          <View style={styles.msg}>
            <Text style={styles.msgText}>{errorMsg}</Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 20 }}>
          <Button text="Entrar" flex onPress={handleLogin} />
          <Button
            text="Cadastrar"
            flex
            onPress={() => router.push("/create")}
          />
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  title: {
    fontSize: 48,
    color: "white",
    marginBottom: 20,
  },
  msg: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: tw.red["950"] + "40",
  },
  msgText: {
    color: "white",
    textAlign: "center",
  },
});