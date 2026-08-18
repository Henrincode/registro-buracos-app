import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = {
  placeHodler?: TextInputProps['placeholder']
  radius?: number
  value: string
  onChange: TextInputProps['onChangeText']

}

export default function Input({ value, onChange, placeHodler, radius = 20 }: Props) {

  const [valueTemp, setValueTemp] = useState('')

  useEffect(() => setValueTemp(value), [])

  return (
    <View style={[styles.container, { borderRadius: radius }]}>
      <TextInput
        defaultValue={valueTemp}
        onChangeText={onChange}
        placeholder={placeHodler}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#94a3b8' // slate 400
  },
  input: {
    fontSize: 18
  }
})