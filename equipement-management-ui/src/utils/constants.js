export const getHeadStyle = (theme) => ({
  fontWeight: 700,
  fontSize: "0.8rem",
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  py: 1.5,
  borderBottom: `2px solid ${theme.palette.divider}`,
});

export const CORPS_OPTIONS = [
  { key: 1, value: "Site Nord" },
  { key: 2, value: "Site Centre" },
  { key: 3, value: "Site Sud" },
];

export const ImageBaseUrl = "http://localhost:5000/pics/";
