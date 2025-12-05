const turf = [
  "#f5fff6",
  "#e3f8e3",
  "#c3efc2",
  "#9ce79d",
  "#71de77",
  "#4ad45a",
  "#2ec248",
  "#1fa23a",
  "#1b8032",
  "#135524"
];

const clay = [
  "#fff7f0",
  "#ffe1c7",
  "#ffc293",
  "#ffa163",
  "#ff8439",
  "#fa6a1a",
  "#dc5711",
  "#b9470f",
  "#92380f",
  "#5c2208"
];

const chalk = [
  "#ffffff",
  "#f4f7f5",
  "#e7ece5",
  "#d5dfd0",
  "#bfcfba",
  "#a6b9a0",
  "#8b9f84",
  "#6f8269",
  "#566654",
  "#323c31"
];

const theme = {
  fontFamily: "'Poppins', 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily: "'Space Grotesk', 'Poppins', 'Inter', sans-serif",
    fontWeight: 600,
    sizes: {
      h1: { fontSize: "3rem", lineHeight: 1.1 },
      h2: { fontSize: "2.25rem", lineHeight: 1.2 },
      h3: { fontSize: "1.75rem", lineHeight: 1.25 }
    }
  },
  colors: {
    turf,
    clay,
    chalk
  },
  primaryColor: "turf",
  primaryShade: 5,
  defaultRadius: "xl",
  shadows: {
    sm: "0 8px 30px rgba(19, 85, 36, 0.08)",
    md: "0 18px 50px rgba(32, 82, 51, 0.16)"
  },
  defaultGradient: {
    from: "turf.5",
    to: "turf.8",
    deg: 120
  }
};

export default theme;
