---
title: "My 1st post"
date: 2020-09-15T11:30:03+00:00
# weight: 1
# aliases: ["/first"]
tags: ["first"]
series: ["Themes Guide"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Desc Text."
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
    image: "<image path/url>" # image path/url
    alt: "<alt text>" # alt text
    caption: "<text>" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
# editPost:
#     URL: "https://github.com/<path_to_repo>/content"
#     Text: "Suggest Changes" # edit text
#     appendFilePath: true # to append file path to Edit link
---

https://www.appsloveworld.com/go/7/how-to-insert-an-image-in-my-post-on-hugo

used option 2 from the above link with figure shortcode to make the images work


https://kyxie.github.io/en/blog/tech/papermod/#modify-code-font

Use this to modify the fonts only change is that the extend head is not in themes folder it is in latouts/pratials/ and the blank.css is in assets/css/extended 

If you want line numbers in code blocks, use

```python linenos
import torch
```


{{< codecaption lang="html" title="Code caption shortcode" >}}
<figure class="code">
  <figcaption>
    <span>{{ .Get "title" }}</span>
  </figcaption>
  <div class="codewrapper">
    {{ highlight .Inner (.Get "lang") "linenos=true" }}
  </div>
</figure>
{{< /codecaption >}}



{{< rawhtml >}}
<a href="https://colab.research.google.com/github/GoogleCloudPlatform/vertex-ai-samples/blob/main/notebooks/official/model_monitoring/model_monitoring.ipynb" target="_blank">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab" style="display: inline-block; margin-right: 10px;">
</a>
{{< /rawhtml >}}
from https://anaulin.org/blog/hugo-raw-html-shortcode/


{{< rawhtml >}}
<a href="https://github.com" target="_blank">
  <img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
</a>

{{< /rawhtml >}}