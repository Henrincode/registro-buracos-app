import { ReactNode } from "react"
import { View } from "react-native"

type Props = {
  children: ReactNode
  gap?: number
}

export default function InputGroup({ gap = 4, children }: Props) {
  return (
    <View style={{ gap }}>
      {children}
    </View>
  )
}