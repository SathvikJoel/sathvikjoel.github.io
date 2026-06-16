# Writing toolkit

Beyond plain Markdown, posts can use a set of ready-made building blocks for richer
layouts — sidenotes, pull quotes, image grids, callouts, and more. They keep your
writing consistent with the rest of the site without any fuss.

> **One rule:** building blocks only work in posts saved as **`index.mdx`** (not
> `index.md`). If you want to use anything on this page, name the file `index.mdx`.
>
> **See them live:** open the **[Writing toolkit](/posts/tech/toolkit/)**
> post — it demonstrates every block below with its result. It's the fastest way to
> learn. (The post is unlisted, so it won't show up in the garden or Tech stream;
> reach it from this link.)

---

## Text & asides

### Sidenote

A margin note that floats to the side on wide screens and tucks inline on mobile —
great for asides, definitions, or citations that shouldn't break your sentence.

```mdx
Some claim worth qualifying.<Sidenote n={1}>The aside goes here.</Sidenote>
```

Number your sidenotes (`n={1}`, `n={2}`, …) in order through the post.

### Year ago

Writes a year and quietly updates the "… years ago" superscript every year, so the post
never goes stale.

```mdx
I started this blog back in <Y y={2023} />.
```

### Pull quote

A large, emphasised quote to give a line room to breathe. The citation is optional.

```mdx
<Pullquote cite="Christopher Alexander">
  A big, emphasised quote pulled out of the flow.
</Pullquote>
```

---

## Callouts & collapsibles

### Reference callout

A linked "card" that points to an external article or source, with an optional author
and site name. (Also available under the name `Callout`.)

```mdx
<Reference
  href="https://example.com/article"
  title="The headline of the thing"
  author="Author Name"
  source="Publication"
/>
```

### Details

A collapsible section that opens as a tidy accordion — a header bar with a plus icon and
a "Read more / Show less" hint. Good for tangents, long proofs, or reference detail you
don't want cluttering the main flow. Works without JavaScript.

```mdx
<Details title="Show the full derivation">
  Hidden content the reader can open.
</Details>
```

### Excursion

The same accordion as **Details**, but with a warmer accent so it reads as a gentle,
set-apart "side trip" rather than a plain disclosure. Give it an `anchor` to link straight
to it.

```mdx
<Excursion title="A short detour on notation" anchor="notation">
  The digression goes here.
</Excursion>
```

### Aside

A small labelled box for framing notes the reader should see before diving in. It defaults
to an **Assumed Audience** label; pass a custom `label` for a caveat, an epistemic-status
line, or any other aside.

```mdx
<Aside>
  Who you're writing this for.
</Aside>

<Aside label="Epistemic status">
  Thinking out loud — expect this to change.
</Aside>
```

---

## Highlights & cards

### Feature card

A bordered card for a quote, neologism, or definition, with an optional `title` and a
`From:` attribution. Pass `align="center"` to centre it, or nest a `Tweet` inside to
feature a post.

```mdx
<Card title="Brahmin Left" from="Thomas Piketty" fromHref="https://example.com">
  The educated, professional wing of left-leaning politics.
</Card>
```

### Chat

A chat-application style conversation — bubbles, name labels, and little avatars. Wrap a
run of `ChatMessage` lines in a `Chat`. Give `Chat` an optional `title` for a window
header. On each `ChatMessage`, set `from` (the speaker's name, which also seeds the avatar
initial) and `side="right"` to flip a speaker to the other side. Colours follow the side
(left = sage, right = crimson); override with `accent="sage|crimson|gold"`, or hide the
avatar with `avatar={false}`.

```mdx
<Chat title="In the woods">
  <ChatMessage from="Narcissus">"Is anyone here?"</ChatMessage>
  <ChatMessage from="Echo" side="right">"...here!"</ChatMessage>
  <ChatMessage from="Narcissus">"Come!"</ChatMessage>
  <ChatMessage from="Echo" side="right">"...come!"</ChatMessage>
</Chat>
```

### Icon list

A list whose bullets are replaced with a small hand-drawn marker in the accent colour.
Wrap a normal Markdown list and choose the marker: `arrow` (default), `leaf`, `spark`,
or `star`.

```mdx
<IconList icon="leaf">
- First point.
- Second point.
</IconList>
```

### Book

A book reference — cover, title, author, and an optional description. With a description
it lays the cover beside the text; add `small` for a compact, centred card you can stack
into a reading list. Put the cover image under `public/...` and link it by absolute path.
The `cover` is optional — leave it off and the card draws a tidy book glyph in its place.

```mdx
<Book cover="/covers/metaphors.jpg" title="Metaphors We Live By"
      author="Lakoff & Johnson" href="https://example.com">
  Why it's worth reading, in a sentence or two.
</Book>

<Book cover="/covers/another.jpg" title="A Quick Mention" author="Author" small />

<Book title="No Cover Yet" author="Some Author" />
```

### Tweet

Embed a post by passing its full URL. A plain link is the no-JS fallback, and it works on
its own or nested inside a `Card`.

```mdx
<Tweet url="https://twitter.com/user/status/1234567890" />
```

---

## Annotated talks

Turn a slide deck into an *annotated talk*: on a wide screen the slides stay pinned on one
side while your notes scroll past on the other, crossfading to the matching slide. On a
phone each slide simply sits above its note. Native scroll + a tiny script — nothing to
configure, and it respects reduced-motion settings.

```mdx
<ScrollSlides>
  <Slide image="/posts/tech/my-talk/slides/slide-01.png" alt="Title slide">
    What I said while this slide was up. **Markdown works here.**
  </Slide>
  <Slide image="/posts/tech/my-talk/slides/slide-02.png" alt="The problem">
    The notes for the second slide…
  </Slide>
</ScrollSlides>
```

Pass `slidesOn="right"` to pin the deck on the right instead of the left.

For the **full recipe** — folder layout, the exact `pdftoppm` command to convert a PDF deck
into slide images, front matter (cover + paperclip stage icon), and shipping — see the
dedicated [Annotated talks](./annotated-talks.md) page. There's a live example in the
**"Using Agents and Skills"** post in the Tech stream.

---

## Pictures inside a post

> These are for pictures **in the body** of a post. To restyle a post's homepage tile,
> use a [cover](./covers-and-images.md) instead.

### Figure

A single image with a caption underneath.

```mdx
<Figure src="/posts/tech/my-post/diagram.jpg" alt="A diagram">
  The caption sits under the image.
</Figure>
```

### Image grid (side by side)

Two or more images in a row, **each with its own caption**. On wide screens the row
**bleeds out wider than the text column** (like `WideImage`) for more impact, and collapses
to a single column on mobile. Use plain `<Figure>`s inside it.

```mdx
<ImageGrid>
  <Figure src="/left.jpg" alt="">Caption for the left image.</Figure>
  <Figure src="/right.jpg" alt="">Caption for the right image.</Figure>
</ImageGrid>
```

Pass `cols={3}` for a three-up row.

### Gallery

A group of images sharing **one** caption for the whole set. Use `cols={1}` to stack
them full-width instead of side by side.

```mdx
<Gallery cols={2} caption="One caption for the whole group.">
  ![](/one.jpg)
  ![](/two.jpg)
</Gallery>
```

### Wide image

A headline image that breaks out **wider than the text column** for impact, with an
optional caption.

```mdx
<WideImage src="/collage.png" alt="" caption="A wide breakout image." />
```

### Inline SVG

Drops a vector illustration (an `.svg` file) neatly centered in the text.

```mdx
<InlineSVG src="/posts/tech/my-post/figure.svg" />
```

---

## Lists with pictures

### Media list

A vertical list where each row pairs a paragraph of text with a thumbnail image — ideal
for reading lists, catalogues, or annotated screenshots. The text keeps the normal body
type and reading width, while on wide screens the image **bleeds out past the column** for
an editorial feel — to the right by default, and mirrored to the left when you add `flip`.
On mobile each row simply stacks (text above image).

```mdx
<MediaList>
  <MediaItem image="/thumb.jpg" alt="">Text beside the image.</MediaItem>
  <MediaItem image="/thumb2.jpg" alt="" flip>Image on the left for this row.</MediaItem>
</MediaList>
```

Each `MediaItem` can also take an `href` to make the row a link.

---

## Code

### Code caption

Puts a titled header bar above a code block, so readers know what file or snippet
they're looking at.

````mdx
<CodeCaption title="example.py">
```python
print("hello")
```
</CodeCaption>
````

---

## Placeholders

### Coming soon

A friendly placeholder for a section you haven't written yet, with an optional message.

```mdx
<ComingSoon note="Optional custom message." />
```

### Under development

A marker for a post you're **actively writing**. It looks like *Coming soon* (same card,
but with a warm trowel-and-sprout icon that gently animates), and it has one extra power:
**everything after it in the post is dimmed**, so readers can tell the notes below are a
rough, in-progress draft. Drop it in right where the polished writing stops and the
work-in-progress begins.

```mdx
Polished, finished writing up to here.

<UnderDevelopment note="Optional custom message." />

These paragraphs — and everything after them — render faded, because they're
still being tended.
```

When the post is done, just delete the `<UnderDevelopment />` line and the dimming goes
away.

---

## At a glance

| Block | Use it for |
| --- | --- |
| `Sidenote` | A margin aside or citation |
| `Y` | A self-updating "years ago" |
| `Pullquote` | A big emphasised quote |
| `Reference` / `Callout` | A linked card to an external source |
| `Aside` | A labelled note/caveat box before the piece |
| `Card` | A bordered feature card with optional `From:` source |
| `Chat` / `ChatMessage` | A chat-app style conversation with bubbles and avatars |
| `IconList` | A list with hand-drawn marker bullets |
| `Book` | A book reference with cover, author, and blurb |
| `Tweet` | An embedded post |
| `Details` | A collapsible accordion section |
| `Excursion` | A gentler set-apart digression |
| `ScrollSlides` / `Slide` | A scroll-synced presentation with notes |
| `Figure` | One captioned image |
| `ImageGrid` | Images side by side, each captioned |
| `Gallery` | An image group with one shared caption |
| `WideImage` | An image wider than the text column |
| `InlineSVG` | A centered vector illustration |
| `MediaList` / `MediaItem` | A list of text-plus-thumbnail rows |
| `CodeCaption` | A titled header over a code block |
| `ComingSoon` | A placeholder for unfinished sections |
| `UnderDevelopment` | A "still writing" marker that fades everything after it |
