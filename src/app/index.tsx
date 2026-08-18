import Button from "@/components/Button";
import Container from "@/components/Component";
import Input from "@/components/Form/Input";
import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {


  // return <Redirect href={'/create'} />
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styles.title}>
        Desvia.AI!
      </Text>
      <Container gap={20} padding={20} >
        <Input placeHodler="seu@email.com" />
        <Input placeHodler="suaS3nh@" />
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <Button text="Entrar" flex />
          <Button text="Cadastrar" flex onPress={() => router.push('/create')} />
        </View>
      </Container>
    </View>
  );
}


const styles = StyleSheet.create({
  title: {
    fontSize: 48,
    color: 'white'
  }
})