// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import { type ComponentProps } from 'react';
import {
  type OpaqueColorValue,
  type StyleProp,
  type TextStyle,
} from 'react-native';

type SymbolName = Extract<SymbolViewProps['name'], string>;
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} satisfies Partial<Record<SymbolName, MaterialIconName>>;

type IconSymbolName = keyof typeof MAPPING;

/**
 * Uses Material Icons as the fallback icon set.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}