export const AVATAR_OPTIONS = {
  chassis: ["square", "circle", "triangle"],
  topAccessory: ["none", "ring", "spire", "crest", "nodes"],
  visor: ["dots", "slit", "binary", "waves", "crosshair"],
  expression: ["line", "arc", "zigzag", "block"],
  badge: ["none", "bolt", "bracket", "coffee", "trophy"],
};

export const migrateLegacyAvatar = (legacyConfig) => {
  if (!legacyConfig || typeof legacyConfig !== "object") {
    return null;
  }

  // Force all older non-geometric configurations to square
  if (!AVATAR_OPTIONS.chassis.includes(legacyConfig.chassis)) {
    return {
      chassis: "square",
      topAccessory: "none",
      visor: "dots",
      expression: "line",
      badge: "none",
    };
  }

  return legacyConfig;
};
