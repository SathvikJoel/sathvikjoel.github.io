---
title: "Understanding Andrejs Tokenizer Video"
date: 2023-09-03T11:30:03+00:00
# weight: 1
# aliases: ["/first"]
tags: ["llm", "math"]
# series: ["Math in DL"]
author: "Sathvik Joel"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Decoding details from Andrejs video on Tokenizer"
canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableHLJS: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowPostNavLinks: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
math: true # needed for lated to render properly
cover:
    image: "" # image path/url
    alt: "List of Useful Resources" # alt text
    caption: "List of useful resources" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
# editPost:
#     URL: "https://github.com/<path_to_repo>/content"
#     Text: "Suggest Changes" # edit text
#     appendFilePath: true # to append file path to Edit link
---

This blog is based on [Andrejs video on Tokenizer](https://youtu.be/zduSFxRajkE?si=57oSzM0E5HW3aa_g), this is a very dense video and has covered a lot of nuances, reserch and gory and interesting details. In ths blog post I try to analyze few of those details and hopefully understand them better.

In this I wont be concentrating on the python implementation of BPE algorithm, tho I will briefly introduce the algorithm, and also be talking about a few python functions related to UTF-8 encoding that just interested me. I beleieve the algorithm itself is not so hard to code up and definelty an exercise I did and found worth doing( highly recommend doing it). 

## UNICODE AND UTF-8

The whole BPE algorithm is based on the UNICODE and UTF-8 encoding, in this I present a few details that are relavent to understand the BPE algorithm. 

In the video Andrej refer to the [UNICODE](https://en.wikipedia.org/wiki/Unicode) and [UTF-8](https://en.wikipedia.org/wiki/UTF-8) wikipedia pages, along with [this blog post](https://www.reedbeta.com/blog/programmers-intro-to-unicode/) that is more redable. But I persoanlly found [this amazing blog](https://tonsky.me/blog/unicode/) that is more reader friendly and gives an easy understanding. 

### Important Points about UNICODE and UTF-8

Here are the brief points that are really relavent, taken from [this amazing blog](https://tonsky.me/blog/unicode/)
1. UNICODE is a table that assigns unique numbers to different characters, they keep updating and adding new characters to the table.
2. UTF-8 is a way to encode those numbers into bytes. Simply, the way to store the UNICODE characters in memory.
3. UTF-8 is a variable length encoding, meaning it can use 1, 2, 3 or 4 bytes to store a character.
4. UTF-8 is backward compatible with ASCII, meaning that any ASCII text is also a valid UTF-8 text.

Again please refer to the resourced above to understand advanced concepts like Grapheme clusters, I persoanlly found the details really worth knowing.

### Related Python Functions

```python
ord("한")  # Gives the UNICODE number of the character
# 54620
chr(54620) # Gives the character corresponding to the UNICODE number
# '한'

# UTF-8 encoding
"안녕하세요 is hello in korean".encode("utf-8")
# b'\xec\x95\x88\xeb\x85\x95\xed\x95\x98\xec\x84\xb8\xec\x9a\x94 is hello in korean'
# This gives the bytes representation of the string, use list on the output to get the list in the form of integers

list("안녕하세요 is hello in korean".encode("utf-8"))
# [236, 149, 136, ...  101, 97, 110]

# UTF-8 decoding
b"\xec\x95\x88\xeb\x85\x95\xed\x95\x98\xec\x84\xb8\xec\x9a\x94 is hello in korean".decode('utf-8')
# '안녕하세요 is hello in korean'
# If you have a list of integers then use the below method

bytes([236, 149, 136, 235, 133, 149, 237, 149, 156, 236, 151, 144, 32, 105, 115, 32, 104, 101, 108, 108, 111, 32, 105, 110, 32, 107, 111, 114, 101, 97, 110]).decode("utf-8")
# '안녕하세요 is hello in korean'

```

## BPE Algorithm

The original BPE paper is [here](https://aclanthology.org/P16-1162/), I havent read it yet. In the video 

{{< figure src="conference.jpg">}}