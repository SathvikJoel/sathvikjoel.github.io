// Single source of truth for the MDX components available inside posts. Imported by
// both the full post page ([topic]/[slug].astro) and the inline feed (StreamFeed.astro)
// so the two never drift — add a component here once and it works everywhere.
import Figure from "./Figure.astro"
import Excursion from "./Excursion.astro"
import Details from "./Details.astro"
import CodeCaption from "./CodeCaption.astro"
import InlineSVG from "./InlineSVG.astro"
import Sidenote from "./Sidenote.astro"
import Gallery from "./Gallery.astro"
import ImageGrid from "./ImageGrid.astro"
import MediaList from "./MediaList.astro"
import MediaItem from "./MediaItem.astro"
import Year from "./Year.astro"
import WideImage from "./WideImage.astro"
import Reference from "./Reference.astro"
import Pullquote from "./Pullquote.astro"
import ComingSoon from "./ComingSoon.astro"
import IconList from "./IconList.astro"
import Card from "./Card.astro"
import Tweet from "./Tweet.astro"
import Book from "./Book.astro"
import Aside from "./Aside.astro"
import ScrollSlides from "./ScrollSlides.astro"
import Slide from "./Slide.astro"
import Chat from "./Chat.astro"
import ChatMessage from "./ChatMessage.astro"

export const mdxComponents = {
  Figure,
  Excursion,
  Details,
  CodeCaption,
  InlineSVG,
  Sidenote,
  Gallery,
  ImageGrid,
  MediaList,
  MediaItem,
  Year,
  Y: Year,
  WideImage,
  Reference,
  Callout: Reference,
  Pullquote,
  ComingSoon,
  IconList,
  Card,
  Tweet,
  Book,
  Aside,
  ScrollSlides,
  Slide,
  Chat,
  ChatMessage,
}
