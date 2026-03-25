export interface Story {
  id: string;
  title: string;
  text: string;
}

export type GenreName = "classic" | "code" | "scifi";

export interface Genre {
  name: GenreName;
  label: string;
  stories: Story[];
}

function sanitize(text: string): string {
  // Normalize multiple spaces/newlines to a single space, trim edges
  return text.replace(/\s+/g, " ").trim();
}

export const GENRES: Genre[] = [
  {
    name: "classic",
    label: "Classic",
    stories: [
      {
        id: "cl-1",
        title: "A Scandal in Bohemia",
        text: sanitize(
          `To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.`
        ),
      },
      {
        id: "cl-2",
        title: "The Hound of the Baskervilles",
        text: sanitize(
          `Mr. Holmes, they were the footprints of a gigantic hound! The night was dark, the wind was howling, and the moor stretched around us, vast and silent. Watson gripped my arm as we crouched behind the boulder, barely daring to breathe. Then we heard it: that deep, unearthly baying that chilled the blood of every man who had ever ventured onto those desolate lands after nightfall.`
        ),
      },
      {
        id: "cl-3",
        title: "The Picture of Dorian Gray",
        text: sanitize(
          `The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn. From the corner of the divan of Persian saddle-bags on which he was lying, Lord Henry surveyed him with that calm, heavy-lidded look that possessed such curious charm.`
        ),
      },
      {
        id: "cl-4",
        title: "Pride and Prejudice",
        text: sanitize(
          `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.`
        ),
      },
    ],
  },
  {
    name: "code",
    label: "Code",
    stories: [
      {
        id: "cd-1",
        title: "Async Data Fetcher",
        text: sanitize(
          `async function fetchUserData(userId: string): Promise<User> { const response = await fetch(\`/api/users/\${userId}\`); if (!response.ok) { throw new Error(\`Failed to fetch user: \${response.status}\`); } const data = await response.json(); return { id: data.id, name: data.name, email: data.email, createdAt: new Date(data.created_at) }; }`
        ),
      },
      {
        id: "cd-2",
        title: "Array Pipeline",
        text: sanitize(
          `const result = orders.filter((order) => order.status === "completed").map((order) => ({ id: order.id, total: order.items.reduce((sum, item) => sum + item.price * item.qty, 0), customer: order.customer.name, })).sort((a, b) => b.total - a.total).slice(0, 10);`
        ),
      },
      {
        id: "cd-3",
        title: "Event Debouncer",
        text: sanitize(
          `function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void { let timer: ReturnType<typeof setTimeout> | null = null; return (...args: Parameters<T>) => { if (timer !== null) { clearTimeout(timer); } timer = setTimeout(() => { fn(...args); timer = null; }, delay); }; }`
        ),
      },
      {
        id: "cd-4",
        title: "React Custom Hook",
        text: sanitize(
          `function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] { const [stored, setStored] = useState<T>(() => { try { const item = window.localStorage.getItem(key); return item ? (JSON.parse(item) as T) : initialValue; } catch { return initialValue; } }); const setValue = (value: T) => { setStored(value); window.localStorage.setItem(key, JSON.stringify(value)); }; return [stored, setValue]; }`
        ),
      },
    ],
  },
  {
    name: "scifi",
    label: "Sci-Fi",
    stories: [
      {
        id: "sf-1",
        title: "Neon Streets",
        text: sanitize(
          `Rain hammered the corrugated rooftops of the lower ward as Case jacked into the matrix. The city's data-towers rose like chrome cathedrals above the smog line, their surfaces alive with scrolling advertisements in three languages. Down here, below the overpass, dealers traded black-market firmware and stolen wetware in equal measure, and every second contract was a trap.`
        ),
      },
      {
        id: "sf-2",
        title: "The Quantum Gate",
        text: sanitize(
          `Dr. Vasquez pressed her palm against the scanner and the gate hummed to life. Quantum foam shimmered at its centre, a bruise of violet light folding spacetime into a doorway no wider than her shoulders. On the other side lay a star system fourteen light-years away, reachable in three steps. She had rehearsed this moment a thousand times, yet her heart still raced as she crossed the threshold.`
        ),
      },
      {
        id: "sf-3",
        title: "Ghost Signal",
        text: sanitize(
          `The colony ship had been silent for a hundred years when the distress beacon activated. Commander Ilyina read the transmission twice: seven survivors, oxygen critical, located in Sector Nine. But Sector Nine had been sterilised after the outbreak. She ordered the crew to their stations and set a course, knowing that whatever waited in the dark was almost certainly not the same species that had sent the signal.`
        ),
      },
      {
        id: "sf-4",
        title: "The Architect of Dreams",
        text: sanitize(
          `In the city of New Seoul, consciousness was a commodity. You could lease twenty years of expertise directly into your hippocampus for the price of a meal. Ryn had been a surgeon, a pilot, and a concert violinist, all before her thirtieth birthday, none of it truly hers. But last Tuesday, she had dreamed something that no neural package could explain: a garden, a voice, and the certain, terrifying knowledge that she was being watched.`
        ),
      },
    ],
  },
];

export function getRandomStoryFromGenre(genreName: string): Story | null {
  const genre = GENRES.find((g) => g.name === genreName);
  if (!genre || genre.stories.length === 0) return null;
  const idx = Math.floor(Math.random() * genre.stories.length);
  return genre.stories[idx];
}
