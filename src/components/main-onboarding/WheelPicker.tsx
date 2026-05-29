import { useEffect, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { appFonts } from "@/constants/fonts";
import { onboardingTheme } from "@/constants/onboarding-theme";

const ITEM_HEIGHT = 42;
const VISIBLE_ITEMS = 3;

type WheelPickerProps = {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  width?: number;
};

export function WheelPicker({ items, value, onChange, width }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, items.indexOf(value));

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    onChange(items[clamped]!);
  };

  const paddingVertical = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

  return (
    <View style={[styles.wrap, width ? { width } : null]}>
      <View style={styles.highlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingVertical }}
      >
        {items.map((item) => {
          const isSelected = item === value;
          return (
            <View key={item} style={styles.item}>
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: "relative",
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: onboardingTheme.line,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontFamily: appFonts.regular,
    color: onboardingTheme.accentDim,
    fontSize: 16,
  },
  itemTextSelected: {
    fontFamily: appFonts.bold,
    color: onboardingTheme.accent,
    fontSize: 18,
  },
});
