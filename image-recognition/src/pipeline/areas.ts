// Campus areas from the tool contract, each with one or more map points (OpenStreetMap, 2026-10-04).
// A coordinate maps to the area of the nearest point, if it's within MAX_DISTANCE_M.
const AREAS: Record<string, [number, number][]> = {
  "Woodruff Library": [[33.79046, -84.32281]],
  "Emory Student Center": [[33.79361, -84.32401]],
  "DCT": [[33.79289, -84.32461]], // approximated by Dobbs Hall
  "Cox Hall": [[33.79242, -84.32317]],
  "WoodPEC": [[33.79334, -84.32598]],
  "Science buildings (MSC, Atwood, PAIS)": [[33.79017, -84.32654], [33.79111, -84.32695]],
  "Humanities buildings (Callaway, White Hall, Candler Library)": [[33.79144, -84.32413], [33.79074, -84.32588], [33.79133, -84.32354]],
  "Goizueta Business School": [[33.78996, -84.32125]],
  "Rollins School of Public Health": [[33.79758, -84.32421], [33.79752, -84.32351]],
  "Residence halls (Raoul, Hamilton, Turman, Dobbs, Alabama, Clifton Towers, Woodies, Complex, Harris Hall)": [
    [33.79466, -84.32347], [33.79433, -84.32343], [33.79404, -84.3229], [33.79289, -84.32461], [33.79279, -84.32324],
    [33.79772, -84.32221], [33.79679, -84.32161], [33.79069, -84.32127], [33.79123, -84.32149], [33.79454, -84.32457],
  ],
  "The Quad": [[33.79062, -84.32474]],
  "McDonough Field": [[33.79405, -84.32504]],
  "Cliff Shuttle / Asbury Circle": [[33.79349, -84.32476]],
  "Parking decks": [[33.78901, -84.32255], [33.79137, -84.31907], [33.7947, -84.32309]],
};
const MAX_DISTANCE_M = 150;

function meters(a: [number, number], b: [number, number]) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function areaFor(lat: number, lng: number): { area: string | null; distance_m: number } {
  let best = { area: null as string | null, distance_m: Infinity };
  for (const [area, points] of Object.entries(AREAS)) {
    for (const p of points) {
      const d = meters([lat, lng], p);
      if (d < best.distance_m) best = { area, distance_m: d };
    }
  }
  return best.distance_m <= MAX_DISTANCE_M ? best : { area: null, distance_m: best.distance_m };
}
