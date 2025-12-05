// components/interactive.js
import React, { useState } from "react";
import { Pressable } from "react-native";

export default function Interactive({
  children,
  style,
  hoveredStyle,
  pressedStyle,
  ...props
}) {
  const [hovered, setHovered] = useState(false);

  // Default hover & press colors
  const defaultHover = { backgroundColor: "rgba(255,255,255,0.15)" };
  const defaultPress = { backgroundColor: "rgba(255,255,255,0.25)" };

  return (
    <Pressable
      {...props}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        style,
        hovered && (hoveredStyle || defaultHover),
        pressed && (pressedStyle || defaultPress),
      ]}
    >
      {children}
    </Pressable>
  );
}
