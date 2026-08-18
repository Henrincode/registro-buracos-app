import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

type Props = {
  text: string
  bg?: string
  padding?: number
  radius?: number
  flex?: boolean
  onPress?: TouchableOpacityProps['onPress']

}

export default function Button({ text, bg = '#2563eb', padding = 8, radius = 20, flex = false, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { padding, borderRadius: radius, backgroundColor: bg },
        flex && { flex: 1 }
      ]}
    >
      <Text style={styles.text}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#2563eb' // blue 600
  },
  text: {
    fontSize: 18,
    color: 'white'
  }
})