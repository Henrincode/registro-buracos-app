import { ReactNode } from "react";
import { DimensionValue, StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode;
  width?: DimensionValue;
  padding?: DimensionValue;
  margin?: DimensionValue;
  gap?: number;
};

export default function Container({ children, width = '100%', padding = 10, margin = 10, gap = 0 }: Props) {
  return (
    // wrapper
    <View style={[styles.wrapper, { width, padding: margin }]}>
      {/* container */}
      <View style={[styles.container, { gap, padding }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  container: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#1e293b', // slate 800
  },
});