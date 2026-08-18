import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';

type Props = {
  name?: ComponentProps<typeof MaterialCommunityIcons>['name']
  size?: number
  color?: string
}

export default function Icon({ name = 'account', size = 48, color = 'white' }: Props) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />
}