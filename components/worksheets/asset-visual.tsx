import {
  Apple,
  Banana,
  Citrus,
  Cat,
  Dog,
  Bird,
  Fish,
  Car,
  Bike,
  BookOpen,
  Volleyball,
  TreeDeciduous,
  Flower,
  Star,
  Circle,
  Square,
  Triangle,
} from 'lucide-react';
import type { AssetId } from '@/lib/learning/assets';
const icons = {
  apple: Apple,
  banana: Banana,
  orange: Citrus,
  cat: Cat,
  dog: Dog,
  bird: Bird,
  fish: Fish,
  car: Car,
  bicycle: Bike,
  book: BookOpen,
  ball: Volleyball,
  tree: TreeDeciduous,
  flower: Flower,
  star: Star,
  circle: Circle,
  square: Square,
  triangle: Triangle,
};
export function AssetVisual({
  id,
  count = 1,
}: {
  id: AssetId;
  count?: number;
}) {
  const Icon = icons[id];
  return (
    <div
      className="flex flex-wrap justify-center gap-4 p-4 text-primary-600"
      role="img"
      aria-label={`Ilustrasi: ${count} objek`}
    >
      {Array.from({ length: count }, (_, i) => (
        <Icon key={i} size={64} strokeWidth={2} aria-hidden="true" />
      ))}
    </div>
  );
}
export function PlantVisual({ target }: { target: 'leaf' | 'stem' | 'root' }) {
  const centers = { leaf: [135, 65], stem: [100, 120], root: [100, 190] };
  const [cx, cy] = centers[target];
  return (
    <svg
      viewBox="0 0 220 230"
      className="w-56 mx-auto"
      role="img"
      aria-label="Diagram tumbuhan dengan satu bagian ditandai lingkaran merah"
    >
      <path d="M100 180V55" fill="none" stroke="#15803d" strokeWidth="10" />
      <path
        d="M101 90Q160 15 175 65Q165 110 101 90M99 115Q30 40 25 90Q40 130 99 115"
        fill="#86efac"
        stroke="#15803d"
        strokeWidth="3"
      />
      <path
        d="M100 175L70 220M100 175L130 220M100 175V225M100 195L50 205M100 195L150 205"
        fill="none"
        stroke="#92400e"
        strokeWidth="6"
      />
      <path d="M15 165H205" stroke="#a8a29e" strokeWidth="2" />
      <circle
        cx={cx}
        cy={cy}
        r="28"
        fill="none"
        stroke="#dc2626"
        strokeWidth="4"
      />
    </svg>
  );
}
