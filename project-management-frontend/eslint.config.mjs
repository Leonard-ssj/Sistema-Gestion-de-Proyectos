export default [
  ...(await import("eslint-config-next/core-web-vitals")).default,
  ...(await import("eslint-config-next/typescript")).default,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "dist/**"],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-hooks/purity": "off",
    },
  },
];
