import Button from "@/components/Button";
import Container from "@/components/Component";
import Input from "@/components/Form/Input";
import tw from "@/styles/tailwindColors";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { useUsersDatabase } from "@/data/useUsersDatabase";

type Errors = {
  name?: boolean;
  mail?: boolean;
  pass1?: boolean;
  pass2?: boolean;
  msg?: string;
};

export default function CreateUser() {
  // Hooks
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const userDb = useUsersDatabase();

  async function insert() {
    const messages = [];
    const newErrors: Errors = {};

    if (name.trim() === "") {
      newErrors.name = true;
      messages.push("• Nome precisa ser preenchido");
    }

    if (mail.trim() === "") {
      newErrors.mail = true;
      messages.push("• E-Mail precisa ser preenchido");
    }

    if (mail.trim() !== "") {
      const atCount = mail.split("@").length - 1;

      if (atCount === 0) {
        newErrors.mail = true;
        messages.push("• E-Mail precisa ter um @");
      } else if (atCount > 1) {
        newErrors.mail = true;
        messages.push("• E-Mail precisa ter só um @");
      }
    }

    if (pass1.trim() === "") {
      newErrors.pass1 = true;
      messages.push("• Senha precisa ser preenchida");
    }

    if (pass2.trim() === "") {
      newErrors.pass2 = true;
      messages.push("• Senha precisa ser confirmada");
    }

    if (pass1.trim() !== "" && pass2.trim() !== "" && pass1 !== pass2) {
      newErrors.pass1 = true;
      newErrors.pass2 = true;
      messages.push("• Senhas precisam ser iguais");
    }

    if (messages.length > 0) {
      setErrors({
        ...newErrors,
        msg: messages.join("\n"),
      });
      return;
    }

    setErrors({});

    try {
      // Grava no banco com hash na senha
      await userDb.create({
        name: name.trim(),
        email: mail.trim().toLowerCase(),
        password: pass1,
      });

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      router.replace("/"); // Volta para o Dashboard/Home
    } catch (error) {
      setErrors({
        msg: "Erro ao cadastrar usuário. O e-mail pode já estar em uso.",
      });
    }
  }

  return (
    <View style={styles.container}>
      {/* title */}
      <Text style={styles.title}>Desvia.AI!</Text>

      {/* form */}
      <Container gap={20} padding={20}>
        <Input
          value={name}
          onChange={setName}
          placeHodler="Nome"
          bg={errors.name ? tw.red["400"] : undefined}
        />
        <Input
          value={mail}
          onChange={setMail}
          placeHodler="seu@email.com"
          bg={errors.mail ? tw.red["400"] : undefined}
        />
        <Input
          value={pass1}
          onChange={setPass1}
          placeHodler="suaS3nh@"
          bg={errors.pass1 ? tw.red["400"] : undefined}
        />
        <Input
          value={pass2}
          onChange={setPass2}
          placeHodler="suaS3nh@"
          bg={errors.pass2 ? tw.red["400"] : undefined}
        />

        {errors.msg && (
          <View style={styles.msg}>
            <Text style={styles.msgText}>{errors.msg}</Text>
          </View>
        )}

        {/* send */}
        <View style={{ gap: 10 }}>
          <Button onPress={insert} text="Cadastrar" />
          <Text
            onPress={() => router.back()}
            style={{ textAlign: "center", color: "white" }}
          >
            Já tenho conta
          </Text>
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
  },
});