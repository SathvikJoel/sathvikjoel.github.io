---
title: "Mathematical Musings:  Unraveling LLM Subtleties"
date: 2023-08-30T11:30:03+00:00
# weight: 1
# aliases: ["/first"]
tags: ["llm", "math"]
series: ["Math in DL"]
author: "Sathvik Joel"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
# description: "Desc Text."
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
    image: "pi.jpg" # image path/url
    alt: "Unraveling Deep Learning's Subtleties" # alt text
    caption: "Unraveling Deep Learning's Subtleties" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
# editPost:
#     URL: "https://github.com/<path_to_repo>/content"
#     Text: "Suggest Changes" # edit text
#     appendFilePath: true # to append file path to Edit link
---

In this blog I delve into the intricate mathematical subtilities that abound in a few LLM research papers I recently came across. The primary aim is to unravel these mathematical complexities, offering readers a key to unlocking a deeper comprehension of the complete papers. The focus of this blog remains exclusively on the mathematical nuances, tailored to resonate with those who possess a keen mathematical acumen. 

## Flash Attention

Transformers rely on a core operation called Attention Calculation. This basic formula, known as

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

is essential to transformer models.
Making this operation fast on GPUs is really important. Flash Attention addresses this by suggesting a new algorithm that pays attention ( *pun intended* ) to data movement (IO aware, that is, carefully accounting for reads and writes to different levels of fast and slow memory, e.g., between fast GPU on-chip SRAM and relatively slow GPU high bandwidth memory, or HBM ). This has several advantages, like making model training faster and allowing transformers to work well with longer sequences.

Here are a few references to enhance your understanding of Flash Attention

1. [An introductory blog post on Flash Attention by Jackson Cakes](https://jacksoncakes.com/2023/06/29/flashattention-fast-and-memory-efficient-exact-attentionwith-io-awareness/)
2. [A Deep Dive into Flash Attention Paper, A blog by 
Aleksa Gordić](https://gordicaleksa.medium.com/eli5-flash-attention-5c44017022ad)




### Standard Attention
Lets first look at the standard way to calculate and then expand it to the central idea

Let $q$ be the query, and $k_1, k_2, \dots, k_n$ be the keys. Correspondingly, let $v_1, v_2, \dots, v_n$ represent the associated values. In order to illustrate the central concept while avoiding undue distraction, we will initially consider these elements as scalars from the real numbers ($\mathbb{R}$). However, it's important to note that the following derivations can be readily extended to accommodate vector representations.

The primary objective is to compute the output, denoted as $O \in \mathbb{R}$.

1. First, we define a vector $s$ as follows:

$$
s = \left(q \cdot k_1, q \cdot k_2, \dots, q \cdot k_n \right)
$$

In this formulation, each component $s_i$ of the vector $s$ is calculated by taking the dot product between the query $q$ and the respective key $k_i$.

2. Subsequently, we compute a vector $p$ where each component $p_i$ is obtained by applying the exponential function to the corresponding component $s_i$:

$$
p = \left(\exp(s_1), \exp(s_2), \dots, \exp(s_n) \right)
$$

Here, the exponential function is applied element-wise to the vector $s$.


3. Next, we calculate a scalar $l$, which is the summation of all components of vector $s$:

$$
l = \sum_{i=1}^{n} p_i
$$


4. Now, employing the concept of softmax, we construct a vector $\text{softmax}$:

$$
\text{softmax} = \frac{p}{l} = \left(\frac{\exp(s_1)}{l}, \frac{\exp(s_2)}{l}, \dots, \frac{\exp(s_n)}{l} \right)
$$


5. Finally, the output $O$ is determined by computing the weighted sum of the values $v_i$ using the weights $w_i$ obtained from the softmax operation:

$$
O = w_1 \cdot v_1 + w_2 \cdot v_2 + \dots + w_n \cdot v_n \\
  = \frac{\exp(s_1)}{\sum \exp(s_i)} \cdot v_1 + \frac{\exp(s_2)}{\sum \exp(s_i)} \cdot v_2  + \dots + \frac{\exp(s_n)}{\sum \exp(s_i)} \cdot v_n
$$

In this formulation, each value $v_i$ is scaled by its respective weight $w_i$, which is a result of applying the softmax function to the original dot product components $s_i$.

### Incremental Attention

Now imagine refining the algorithm we discussed earlier. This time, we still want to calculate $O$ through $n$ steps. However, **there's a twist:** in each of the $n$ steps, we only get one set of values, $k_i$ and $v_i$. We're allowed to use a few tracking variables to help us out.

Motivation:

The reason for adding this rule is tied to some technical stuff like [tiling](https://nichijou.co/cuda7-tiling/#:~:text=tiling%20as%20a%20parallel%20algorithm&text=It%20divides%20the%20long%20access,in%20time%20and%20in%20space.) and recomputation, especially when dealing with GPU kernel functions. While we won't dive into these details here, the original paper [Dao et al.](https://arxiv.org/abs/2205.14135) has more information. The cool thing is that by solving the problem with this constraint, the actual algorithm in the paper becomes much easier to understand. It's like looking at the problem through a special lens that can make complex things simpler.

**Initialization:**
$$
O = 0, \quad l = 0
$$

**1st Iteration:**

1. Load query $q$, key $k_1$, and value $v_1$.
2. Calculate $s_1 = q \cdot k_1$.
3. Update the summation term: $l_{\text{new}} = l + \exp(s_1)$.
4. Update the weighted sum: $O_{\text{new}} = \frac{l \cdot O + \exp(s_1) \cdot v_1}{l_{\text{new}}}$.
5. Update variables: $l = l_{\text{new}}$ and $O = O_{\text{new}}$.

After these steps, we have:
$$
O = \frac{\exp(s_1) \cdot v_1}{\exp(s_1)}
$$

**2nd Iteration:**

1. Load query $q$, key $k_2$, and value $v_2$.
2. Calculate $s_2 = q \cdot k_2$.
3. Update the summation term: $l_{\text{new}} = l + \exp(s_2)$.
4. Update the weighted sum: $O_{\text{new}} = \frac{l \cdot O + \exp(s_2) \cdot v_2}{l_{\text{new}}}$.
5. Update variables: $l = l_{\text{new}}$ and $O = O_{\text{new}}$.

After these steps, we have:
$$
O = \frac{\exp(s_1) \cdot v_1 + \exp(s_2) \cdot v_2}{\exp(s_1) + \exp(s_2)}
$$

Extending this algorithm for $n$ iterations reveals that the final output $O$ coincides with the conventional attention mechanism.

### Trick for Numerical Stability of Softmax
The proof provided employs a straightforward method for calculating softmax. However, this approach can result in undesirable outcomes such as generating 'inf' (infinity) and 'nan' (not-a-number) values when implemented in code. To address this issue, a workaround is introduced, which is demonstrated below. For a more in-depth exploration of this topic, you can refer to a blog post authored by Jay Mody, accessible at the following link: [Jay Mody's Blog Post on Stable Softmax](https://jaykmody.com/blog/stable-softmax/).

To compute the softmax transformation for a vector \\(s = \left(s_1, s_2, \dots, s_n \right)\\), the following method is applied:

1. Let $m = \max(s) = \max\left(s_1, s_2, \dots, s_n \right)$.

2. Shift the values of vector \\(s\\) by \\(m\\), resulting in \\(s^\sim = \left(s_1 - m, s_2 - m, \dots, s_n - m \right)\\).

3. Perform the exponentiation operation on each element of \\(s^\sim\\), yielding \\(p = \left(\exp(s_1 - m), \exp(s_2 - m), \dots, \exp(s_n - m) \right)\\).

4. Calculate the sum of the elements in \\(p\\), denoted as \\(l = \sum p_i\\).

5. Finally, compute the softmax values as the ratio of each \\(p_i\\) to \\(l\\), leading to the softmax transformation: \\(\text{softmax} = \left(\frac{p_1}{l}, \frac{p_2}{l}, \dots, \frac{p_n}{l}\right)\\).


$$
\text{softmax} = \left(\frac{\exp(s_1 - m)}{\sum_{i = 1}^{n}(s_i - m)},  \frac{\exp(s_2 - m)}{\sum_{i = 1}^{n}(s_i - m)}, \dots, \frac{\exp(s_n - m)}{\sum_{i = 1}^{n}(s_i - m)}\right)
$$
### Incremental Attention with Trick

To incorporate the above mentioned trick, we need to keep track of one more variable called $m$ that represents the maximum. Here is the modified algorithm with the trick


**Initialization:**
$$
O = 0, \quad l = 0, \quad m = -\infty
$$



**ith Iteration:**

1. Load query $q$, key $k_i$, and value $v_i$.
2. Calculate $s_i = q \cdot k_i$.
3. Update m, $m_{new} = max\left(m, s_i \right)$
4. Update the summation term: $l_{\text{new}} = \exp(m - m_{new})l + \exp(s_i)$.
5. Update the weighted sum: $O_{\text{new}} = \frac{\exp(m - m_{new})l \cdot O + \exp(s_i - m_{new}) \cdot v_i}{l_{\text{new}}}$.
6. Update variables: $l = l_{\text{new}}$, $O = O_{\text{new}}$ and $m = m_{new}$

After these steps, we have:
$$
O = \frac{\exp(s_1 - m) \cdot v_1 + \exp(s_2 - m) \cdot v_2 + \dots exp(s_i - m) \cdot v_i}{\exp(s_1 - m) + \exp(s_2 - m) + \dots \exp(s_i -m)}
$$

where $m = max\left(s_1, s_2, \dots , s_i\right)$


Extending this algorithm for $n$ iterations reveals that the final output $O$ coincides with the conventional attention mechanism.

### Increment in Blocks

I made a little simplification in the earlier sections by saying that we have access to only one key value pair in a given iteration, in general we have access to a block of those pairs, i.e., in ith iteration we have access to $\left(k_{i \cdot B}, k_{i \cdot B + 1}  \dots k_{i+1 \cdot B}\right)$ and $\left(v_{i \cdot B}, v_{i \cdot B + 1}  \dots v_{i+1 \cdot B}\right)$. The extention in this case should also be very obvious from the above steps, *Give it a try*

### Flashclusion

Given the foundation we've established, comprehending the actual algorithm discussed in the paper should be straightforward. The sole modification lies in the paper's approach of handling multiple queries concurrently, as opposed to our singular approach. Regardless, I maintain the suggestion to delve into the original paper for an in-depth understanding.

For those intrigued by delving deeper into GPU technology, a highly recommended step would involve enrolling in a comprehensive GPU Programming course. Such a course effectively covers various aspects of GPU kernels and useful techniques like Kernel Fusion and tiling. This provides a robust grasp of the intricate world of GPU programming.

## References

1. Dao et al. [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135) NeurIPS 2022 
2. 