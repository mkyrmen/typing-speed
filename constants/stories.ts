export interface Story {
  id: string;
  title: string;
  text: string;
}

export interface Genre {
  name: string;
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
    label: "Classic Lit",
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
    name: "tech",
    label: "Tech History",
    stories: [
      {
        id: "th-1",
        title: "Birth of the Internet",
        text: sanitize(
          `On October 29, 1969, the first message was sent over ARPANET, the precursor to the modern Internet. A student at UCLA typed "login" to connect to a machine at Stanford. The system crashed after just two letters: "lo." Yet that faltering transmission marked the beginning of a revolution that would reshape every facet of human civilisation within decades.`
        ),
      },
      {
        id: "th-2",
        title: "The First Microprocessor",
        text: sanitize(
          `In 1971, Intel released the 4004, a 4-bit central processing unit contained entirely on a single chip. Designed by Federico Faggin, Marcian Hoff, and Stanley Mazor, it packed 2,300 transistors into an area the size of a fingernail. This tiny sliver of silicon ignited the personal computer revolution, proving that an entire CPU could be manufactured cheaply and at scale.`
        ),
      },
      {
        id: "th-3",
        title: "The World Wide Web",
        text: sanitize(
          `In 1989, Tim Berners-Lee submitted a proposal to CERN titled "Information Management: A Proposal." His manager famously wrote "vague but exciting" in the margin. Two years later, the world's first website went live at the CERN data centre in Switzerland. It explained what the Web was and how to use it, quietly launching an era of interconnected knowledge that nobody could have anticipated.`
        ),
      },
      {
        id: "th-4",
        title: "The Unix Philosophy",
        text: sanitize(
          `Ken Thompson and Dennis Ritchie built Unix at Bell Labs in 1969 with a radical philosophy: write programs that do one thing well, that work together, and that handle text streams, the universal interface. That elegant discipline quietly shaped every operating system that followed. Linux, macOS, and Android all trace their lineage back to those spare, powerful ideas born in a Murray Hill laboratory.`
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
