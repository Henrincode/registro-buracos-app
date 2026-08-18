import Button from "@/components/Button";
import Container from "@/components/Component";
import Input from "@/components/Form/Input";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {

  // hooks
  const [name, setName] = useState('')
  const [mail, setMail] = useState('')
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [errors, setErrors] = useState({})

  function insert() {
    let msg = ''

    if (name.trim() === '') {
      setErrors({ ...errors, name: true })
      msg += 'Nome precisa ser preenchido' + '\n'
    }

    if (mail.trim() === '') {
      setErrors({ ...errors, mail: true })
      msg += 'E-Mail precisa ser preenchido' + '\n'
    }

    if (mail.split('@').length - 1 !== 1) {
      setErrors({ ...errors, mail: true })
      msg += 'E-Mail precisa ter um @' + '\n'
    }

    if (mail.split('@').length - 1 > 1) {
      setErrors({ ...errors, mail: true })
      msg += 'E-Mail precisa ter só um @' + '\n'
    }
    
    Object.keys(errors).length >= 1 && setErrors({...errors, msg})
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* title */}
      <Text style={styles.title}>
        Desvia.AI!
      </Text>

      {/* form */}
      <Container gap={20} padding={20} >
        <Input value={name} onChange={setName} placeHodler="Nome" />
        <Input value={mail} onChange={setMail} placeHodler="seu@email.com" />
        <Input value={pass1} onChange={setPass1} placeHodler="suaS3nh@" />
        <Input value={pass2} onChange={setPass2} placeHodler="suaS3nh@" />

        {Object.keys(errors).length >= 1 && (
          <View>
            <Text>{errors.msg ? errors.msg : ''}</Text>
          </View>
        )}

        {/* send */}
        <View style={{ gap: 10 }}>
          <Button text="Cadastrar" />
          <Text onPress={() => router.back()} style={{ textAlign: 'center', color: 'white' }}>
            Já tenho conta
          </Text>
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