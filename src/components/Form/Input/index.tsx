import tw from "@/styles/tailwindColors";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = {
  placeHodler?: TextInputProps['placeholder']
  radius?: number
  value: string
  onChange: TextInputProps['onChangeText']
  bg?: string

}

export default function Input({ value, onChange, placeHodler, radius = 20, bg = tw.slate['400'] }: Props) {

  const [valueTemp, setValueTemp] = useState('')

  useEffect(() => setValueTemp(value), [])

  return (
    <View style={[styles.container, { borderRadius: radius, backgroundColor: bg }]}>
      <TextInput
        defaultValue={valueTemp}
        onChangeText={onChange}
        placeholder={placeHodler}
        style={[styles.input, {}]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10
  },
  input: {
    fontSize: 18
  }
})