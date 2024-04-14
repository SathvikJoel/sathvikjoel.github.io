---
title: "Forest in Latex"
date: 2024-03-12T11:30:03+00:00
# weight: 1
# aliases: ["/first"]
tags: ["latex"]
# series: ["Math in DL"]
author: "Sathvik Joel"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: true
draft: false
hidemeta: false
comments: false
description: "Found a cool way to draw trees in latex"
canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableHLJS: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowPostNavLinks: true
ShowRssButtonInSectionTermList: true
UseHugoToc: false
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



I am working on one of my research paper and came acorss this cool Latex Package called _Forest_ 🌳. The documentation can be found [here](https://texdoc.org/serve/forest/0)

Here is a cool example from this [paper](https://arxiv.org/pdf/2311.07989.pdf)


{{< figure src="images/ForestExample.jpg" caption="Forest that summarizes a survey work, used as an example" >}}

You can produce a Forest like this from the code below. Note that bib file is missing so the code wont run, but you get the idea💡



{{< codecaption lang="html" title="main.tex" >}}
\documentclass{article}
\usepackage[usenames,dvipsnames,table,xcdraw]{xcolor}
\usepackage[natbib=true,style=apa]{biblatex}
\addbibresource{references.bib}
\usepackage[edges]{forest}

\begin{document}


\begin{figure}[t]
    \centering
    \input{forestExample}
    \caption{Overview of the techniques we cover in this survey to imrpove Code generation}
    \label{fig:forestExample}
\end{figure}

\end{document}
{{< /codecaption >}}




{{< codecaption lang="html" title="ForestExample.tex" >}}
\begin{forest}
    for tree={
    forked edges,
    draw,
    rounded corners,
    grow=east,
    anchor=base west,
    anchor=center,
    reversed=true,
    },
    where level=0{font=\small}{},
    where level=1{text width=5.5em,font=\footnotesize}{},
    where level=2{text width=5.2em,font=\footnotesize}{},
    where level=3{text width=1.8em,font=\scriptsize}{},
    where level=4{text width=5.5em,font=\scriptsize}{},
    [Code LMs, fill=black, fill opacity=0.7, text=white
        [Raw LM, fill=Goldenrod, fill opacity=0.4
            [LaMDA~\citep{2022LaMDA}{,} PaLM~\citep{2022PaLM}{,} GPT-NeoX~\citep{2022GPT-NeoX}{,} 
            BLOOM~\citep{2022BLOOM}{,} LLaMA~\citep{2023LLaMA}{,} GPT-4~\citep{2023GPT4}{,} 
            LLaMA 2~\citep{2023LLaMA2}{,} Phi-1.5~\citep{2023Phi-1.5}{,} Baichuan 2~\citep{2023Baichuan2}{,} 
            Qwen~\citep{2023Qwen}{,} Mistral~\citep{2023Mistral}{,} Gemini~\citep{2023Gemini}{,} 
            DeepSeek~\citep{2024DeepSeek}{,} 
            Mixtral~\citep{2024Mixtral}{,} ...,
            text width=27.7em,font=\scriptsize, fill=Goldenrod, fill opacity=0.4]
        ]
        [Adapted LM, fill=Apricot, fill opacity=0.4
            [Codex~\citep{2021Codex}{,} PaLM Coder~\citep{2022PaLM}{,} Minerva~\citep{2022Minerva}{,} 
            PaLM 2*~\citep{2023PaLM2}{,} Code LLaMA~\citep{2023CodeLLaMA}{,} Code-Qwen~\citep{2023Qwen},
            text width=27.7em,font=\scriptsize, fill=Apricot, fill opacity=0.4]
        ]
        [Specialized LM, fill=MidnightBlue, fill opacity=0.4
            [Encoder, fill=ProcessBlue, fill opacity=0.4
                [CuBERT~\citep{2019CuBERT}{,} CodeBERT~\citep{2020CodeBERT}{,} GraphCodeBERT~\citep{2020GraphCodeBERT}{,} 
                SynCoBERT~\citep{2021SynCoBERT}{,} Code-MVP~\citep{2022Code-MVP}{,} SCodeR~\citep{2022SCodeR},
                text width=20.5em, fill=ProcessBlue, fill opacity=0.4]
            ]
            [Decoder, fill=Cerulean, fill opacity=0.4
                [CLM, fill=Cerulean, fill opacity=0.4
                    [GPT-C~\citep{2020GPT-C}{,} CodeGPT~\citep{2021CodeXGLUE}{,} PolyCoder~\citep{2022PolyCoder}{,} 
                    CodeGen~\citep{2022CodeGen}{,} PyCodeGPT~\citep{2022PyCodeGPT}{,} PanGu-Coder~\citep{2022Pangu-Coder}{,} 
                    CodeGeeX~\citep{2023CodeGeeX}{,} Jam~\citep{2023Jam}{,} 
                    Phi-1~\citep{2023Phi-1}{,} CodeFuse~\citep{2023CodeFuse13B},
                    text width=16.8em, fill=Cerulean, fill opacity=0.4]
                ]
                [FIM, fill=Cerulean, fill opacity=0.4
                    [InCoder~\citep{2022InCoder}{,} SantaCoder~\citep{2023SantaCoder}{,} StarCoder~\citep{2023StarCoder},
                    text width=16.8em, fill=Cerulean, fill opacity=0.4]
                ]
            ]
            [UniLM, fill=Cyan, fill opacity=0.4
                [CugLM~\citep{2020CugLM}{,} UniXcoder~\citep{2022UniXcoder},
                text width=20.5em, fill=Cyan, fill opacity=0.4]
            ]
            [Encoder-Decoder, fill=CornflowerBlue, fill opacity=0.4
                [PyMT5~\citep{2020PyMT5}{,} 
                T5-code~\citep{2021T5Code}{,} 
                DOBF~\citep{2021DOBF}{,} 
                PLBART~\citep{2021PLBART}{,} 
                CodeT5~\citep{2021CodeT5}{,} 
                SPT-Code~\citep{2022SPT-Code}{,} 
                AlphaCode~\citep{2022AlphaCode}{,} 
                NatGen~\citep{2022NatGen}{,} 
                ERNIE-Code~\citep{2022ERNIE-Code}{,} 
                CodeT5+~\citep{2023CodeT5+},
                text width=20.5em, fill=CornflowerBlue, fill opacity=0.4]
            ]
        ]
        [Code\\Finetuning, fill=WildStrawberry, fill opacity=0.4
            [Instruction Finetuning, fill=RedOrange, fill opacity=0.4
                [WizardCoder~\citep{2023WizardCoder}{,} PanGu-Coder2~\citep{2023Pangu-Coder2}{,} OctoCoder~\citep{2023OctoPack}{,} 
                MFTCoder~\citep{2023MFTCoder}{,} WaveCoder~\citep{2023WaveCoder}{,} 
                Astraios~\citep{2024Astraios},
                text width=20.5em, fill=RedOrange, fill opacity=0.4]
            ]
            [Reinforcement Learning, fill=Bittersweet, fill opacity=0.4
                [CompCoder~\citep{2022CompCoder}{,} CodeRL~\citep{2022CodeRL}{,} PPOCoder~\citep{2023PPOCoder}{,} RLTF~\citep{2023RLTF},
                text width=20.5em, fill=Bittersweet, fill opacity=0.4]
            ]
        ]
    ]
\end{forest}
{{< /codecaption >}}