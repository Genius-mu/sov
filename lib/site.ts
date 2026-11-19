/**
 * Everything a client will want to change lives here: name, contact details,
 * model copy and configurator options.
 * Figures are indicative. Confirm them against current Rolls-Royce
 * specification sheets for your market before launch.
 */
export const SITE = {
  name: "Sovereign",
  title: "Sovereign | Private Rolls-Royce showroom",
  description:
    "A private Rolls-Royce showroom. Commission a new car, choose one from our collection, or book a viewing.",
  phone: "+000 000 000 0000",
  email: "advisors@sovereign.example",
  address: ["14 Harbour Road", "Viewings by appointment"],
  hours: [
    { days: "Monday to Friday", time: "9:00 to 19:00" },
    { days: "Saturday", time: "10:00 to 16:00" },
    { days: "Sunday", time: "By appointment" },
  ],
  legal:
    "Sovereign is an independent showroom. Rolls-Royce, Phantom, Ghost, Cullinan, Spectre and Starlight Headliner are trademarks of Rolls-Royce Motor Cars Limited. Performance figures are manufacturer claims and vary by market.",
  /**
   * Put a licensed .glb at /public/models/car.glb and it replaces the built-in
   * concept car automatically. If it faces the wrong way, set rotationY to Math.PI.
   * Materials whose names match `paintMaterials` follow the configurator's paint colour.
   */
  carModel: {
    url: "/models/car.glb",
    length: 5.6,
    rotationY: 0,
    paintMaterials: /paint|body|carpaint|exterior/i,
  },
};

export const NAV = [
  { label: "Collection", href: "#collection" },
  { label: "Bespoke", href: "#bespoke" },
  { label: "Starlight", href: "#starlight" },
  { label: "Visit", href: "#visit" },
] as const;

export const MODELS = [
  {
    id: "phantom",
    name: "Phantom",
    body: "Saloon",
    blurb: "The flagship. A long, hushed cabin made as much for being driven in as for driving.",
    specs: [
      { label: "Engine", value: "6.75 L twin-turbo V12" },
      { label: "Power", value: "563 hp" },
      { label: "0 to 100 km/h", value: "5.3 s" },
      { label: "Length", value: "5.76 m" },
    ],
  },
  {
    id: "ghost",
    name: "Ghost",
    body: "Saloon",
    blurb: "Smaller and lighter on its feet. Equally at home with you or a chauffeur at the wheel.",
    specs: [
      { label: "Engine", value: "6.75 L twin-turbo V12" },
      { label: "Power", value: "563 hp" },
      { label: "0 to 100 km/h", value: "4.8 s" },
      { label: "Length", value: "5.55 m" },
    ],
  },
  {
    id: "cullinan",
    name: "Cullinan",
    body: "SUV",
    blurb: "The high-riding Rolls-Royce, at ease on gravel drives and long distances alike.",
    specs: [
      { label: "Engine", value: "6.75 L twin-turbo V12" },
      { label: "Power", value: "563 hp" },
      { label: "0 to 100 km/h", value: "5.2 s" },
      { label: "Length", value: "5.34 m" },
    ],
  },
  {
    id: "spectre",
    name: "Spectre",
    body: "Electric coupé",
    blurb: "Fully electric, with two doors and four seats. Silent because there is nothing to hear.",
    specs: [
      { label: "Drive", value: "Twin electric motors" },
      { label: "Power", value: "577 hp" },
      { label: "0 to 100 km/h", value: "4.5 s" },
      { label: "Range (WLTP)", value: "Up to 530 km" },
    ],
  },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

/** Light, pearlescent finishes first; a few deep ones at the end for contrast. */
export const PAINTS = [
  { id: "pearl-white", name: "Pearl White", hex: "#f3efe8" },
  { id: "jubilee-silver", name: "Jubilee Silver", hex: "#cdd2da" },
  { id: "champagne", name: "Champagne", hex: "#f1dcae" },
  { id: "rose-quartz", name: "Rose Quartz", hex: "#f7c3cf" },
  { id: "coral", name: "Coral", hex: "#ffb09a" },
  { id: "seafoam", name: "Seafoam", hex: "#b8ecd9" },
  { id: "sky-blue", name: "Sky Blue", hex: "#bcd8ff" },
  { id: "lilac", name: "Lilac", hex: "#d9c7ff" },
  { id: "salamanca-blue", name: "Salamanca Blue", hex: "#2f5fd0" },
  { id: "diamond-black", name: "Diamond Black", hex: "#14161b" },
] as const;

export const COACHLINES = [
  { id: "champagne", name: "Champagne", hex: "#e2cc9c" },
  { id: "silver", name: "Silver", hex: "#d3d8e0" },
  { id: "crimson", name: "Crimson", hex: "#a3263a" },
  { id: "ice", name: "Ice blue", hex: "#a9c8ff" },
] as const;

export const WHEELS = [
  { id: "polished", name: "Polished" },
  { id: "dark", name: "Dark" },
] as const;

export type WheelFinish = (typeof WHEELS)[number]["id"];
