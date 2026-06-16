import type { CollectionEntry } from "astro:content"
import { createEffect, createSignal } from "solid-js"
import Fuse from "fuse.js"
import ArrowCard from "@components/ArrowCard"
import SearchBar from "@components/SearchBar"

// Slim projection of a post — only the fields the search island actually needs.
// Sending full CollectionEntry objects would ship every post's raw `body` to the
// browser (hundreds of KB of Markdown the client never uses).
export type SearchItem = {
  slug: string
  data: Pick<
    CollectionEntry<"posts">["data"],
    "title" | "description" | "tags" | "topic" | "date"
  >
}

type Props = {
  data: SearchItem[]
}

export default function Search({ data }: Props) {
  const [query, setQuery] = createSignal("")
  const [results, setResults] = createSignal<SearchItem[]>([])

  const fuse = new Fuse(data, {
    keys: ["slug", "data.title", "data.description", "data.tags"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.4,
  })

  createEffect(() => {
    if (query().length < 2) {
      setResults([])
    } else {
      setResults(fuse.search(query()).map((result) => result.item))
    }
  })

  const onSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    setQuery(target.value)
  }

  return (
    <div class="flex flex-col">
      <SearchBar onSearchInput={onSearchInput} query={query} setQuery={setQuery} placeholderText="What are you looking for?" />

      {(query().length >= 2 && results().length >= 1) && (
        <div class="mt-12">
          <div class="text-sm uppercase mb-2">
            Found {results().length} results for {`'${query()}'`}
          </div>
          <ul class="flex flex-col gap-3">
            {results().map(result => (
              <li>
                <ArrowCard entry={result} pill={true} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}