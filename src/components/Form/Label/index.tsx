import Icon from "@/components/Icon";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  text: string
  icon?: ComponentProps<typeof Icon>['name']
  fontSize?: number
  color?: string
};

export default function Label({ text = 'Label', icon, fontSize = 14, color = 'withe' }: Props) {
  return (
    <View style={styles.container}>
      {icon !== undefined && <Icon name={icon} size={fontSize * 1.3} color={color} />}
      <Text style={{ color, fontSize }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10
  }
})