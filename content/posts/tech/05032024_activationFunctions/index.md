---
title: "Pytorch Activation Functions and their Details"
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
description: "Revisiting Activation Functions in Pytorch and their details"
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

Here are a few observations:

GPT-2, developed by Ope.nAI, opts for the GELU (Gaussian Error Linear Unit) activation function

On the other hand, LLaMA, a creation of Facebook Research, embraces SwiGLU activation function.

Meanwhile, Gemma, a PyTorch implementation by Google, adopts GeGLU activation functions.


So what are these new activation functions ? 
How should one go about implementing them in pytorch ?

In this blog post I try to understand the definitions of these activation functions and how they could be implemented in pytorch. At the end I will show the definitions from the actual implementaions in GPT-2, Gemma and LLaMA.

## Imports


```python
import torch
import torch.nn as nn
```

Create a new tensor with random values to use it as input for the activation functions


```python
tensor = torch.randn(10)
print(tensor)
print(tensor.shape)
```

    tensor([-0.8281,  1.0340, -0.4363, -0.4764,  0.6419, -0.1156,  1.4339,  1.5654,
             0.7124, -0.5667])
    torch.Size([10])
    

## RELU Variants

### RELU

Rectified Linear Unit

$$
f(x) = max(0, x)
$$


```python
relu = nn.ReLU()
output = relu(tensor)
print(output)
```

    tensor([0.0000, 1.0340, 0.0000, 0.0000, 0.6419, 0.0000, 1.4339, 1.5654, 0.7124,
            0.0000])
    
{{< figure src="ReLU.png" caption="ReLU activation function, picture taken from pytorch documentaion of ReLU.">}}

### CReLU

Concatenated ReLU

$$
f(x) = [ReLU(x), ReLU(-x)]
$$


```python
crelu_output = torch.cat((relu(tensor), relu(-tensor)))
print(crelu_output)
```

    tensor([0.0000, 1.0340, 0.0000, 0.0000, 0.6419, 0.0000, 1.4339, 1.5654, 0.7124,
            0.0000, 0.8281, 0.0000, 0.4363, 0.4764, 0.0000, 0.1156, 0.0000, 0.0000,
            0.0000, 0.5667])
    

### Leaky ReLU


$$
f(x) =  \begin{cases}
    x, & \text{if } x > 0\\\
    \text{negative\_slope } * x, & \text{otherwise}
  \end{cases}
$$



```python
leaky_relu = nn.LeakyReLU( negative_slope=0.1)
output = leaky_relu(tensor)
print(output)
```

    tensor([-0.0828,  1.0340, -0.0436, -0.0476,  0.6419, -0.0116,  1.4339,  1.5654,
             0.7124, -0.0567])
    
{{< figure src="LeakyReLU.png" caption="Leaky ReLU activation function, picture taken from pytorch documentaion of LeakyReLU.">}}    

## GELU

Gaussian Error Linear Unit

$$
GELU(x) = x \times \Phi(x)
$$

where $\Phi(x)$ is the cumulative distribution function of the standard normal distribution (mean = 0, standard deviation = 1)

There is an approximate version of GELU that is faster to compute but at the cost of exactness

$$
GELU(x) = 0.5 \times x \times (1 + \tanh(\sqrt{2/\pi} \times (x + 0.044715 \times x^3)))
$$

or 

$$
GELU(x) = x \times \sigma(1.702 \times x)
$$

The motivation mentioned in the [paper](https://arxiv.org/abs/1606.08415) is based on the following observations:

1. ReLU determinstaically multiplies by 0 or 1
2. Dropout ( A regularization Technique ) also multiplies by 0 or 1, but stochastically
3. It is possible to multiple with the 0-1 mask stochastically while also depending on the input in the following way ( this is similar to Adaptive Dropout, zoneout )

the mask is given by $m \sim Bernoulli(\Phi(x))$

Since $x\sim N(0, 1)$ after the batch normaliztion anyway, this means that inputs have high probablity of getting dropped when $x$ decreases. 

They say that we often want deterministic decision from the output, so they proposed GELU as the expected transformation of the stochastic regularizer.

$$
E[x*m] = Ix * \Phi(x) + 0x * (1 - \Phi(x)) = x * \Phi(x)
$$

> I dont fully understand the motivation myself, but I guess having a partial idea is better than having no idea. They somehow want to take idea from dropout and activation functions and combine them to get a better activation function.


```python
gelu = nn.GELU(approximate=False) # using the accurate version of GELU
output = gelu(tensor)
print(output)
```

    tensor([-0.1688,  0.8783, -0.1445, -0.1510,  0.4747, -0.0525,  1.3252,  1.4735,
             0.5428, -0.1618])
    

{{< figure src="graph.png" caption="GELU, SiLU graphs from [here](https://kikaben.com/swiglu-2020/)">}}


### SiLU / Swish

Sigmoid Linear Unit

$$
f(x) = x \times \sigma(x)
$$

where $\sigma(x)$ is the sigmoid function.

This is very similar to GELU but $\sigma(x)$ is used instead of $\Phi(x)$

There is also a version of Swish with learneaable parameter.

$$
f(x) = x \times \sigma(\beta x)
$$

where $\beta$ is a learnable parameter


```python
silu = nn.SiLU()
output = silu(tensor)
print(output)
```

    tensor([-0.2518,  0.7628, -0.1713, -0.1825,  0.4206, -0.0544,  1.1579,  1.2948,
             0.4780, -0.2051])
    


## GLU and variants 

This section is **heavily** based on the paper [GLU Variants improve Transfomers](https://arxiv.org/pdf/2002.05202.pdf)

### GLU

**Gated Linear Unit (GLU)** : A neural network layer defined by component-wise product of two linear transformations of the input

$$
GLU(x, W, V, b, c) = \sigma (Wx + b) \odot (Vx + c)
$$

They also suggest omitting the activation, whih they call a bilnear layer

$$
\text{Bilinear}(x, W, V, b, c) = (Wx + b) \odot (Vx + c)
$$

Note: The `bias` term is often omitted

### GLU Variants

Any activation function could be used in place of $\sigma$ in the GLU equation, giving rise to a family of GLU variants.

$$
ReGLU(x, W, V, b, c) = ReLU(Wx + b) \odot (Vx + c)
$$
$$
SiGLU(x, W, V, b, c) = SiLU(Wx + b) \odot (Vx + c)\\\
$$
$$
GeGLU(x, W, V, b, c) = GELU(Wx + b) \odot (Vx + c)\\\
$$


> LLaMA model uses SwiGLU as the activation function in the FFN layer. [See in the model definition](https://github.com/facebookresearch/llama/blob/a0a4da8b497c566403941ceec47c2512ecf9dd20/llama/model.py#L348)


```python
# ReGLU could be implmeneted like this in pytorch

class ReGLU(nn.Module):
    def __init__(self):
        super(ReGLU, self).__init__()
        input_dim = 10
        hidden_dim = 20
        self.W = nn.Linear(input_dim, hidden_dim)
        self.V = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()

    def forward(self, x):
        return self.W(x) * self.relu(self.V(x))

# Create a tensor with 10 random numbers
tensor = torch.randn(10)

# Create an instance of the ReGLU class
reglu = ReGLU()

# Apply the ReGLU function to the tensor
output = reglu(tensor)
print(output)
```

    tensor([ 0.0000,  0.0074,  0.0000, -0.0000, -0.0753, -0.0598, -0.0000, -0.0000,
            -0.0000,  0.1110, -0.0109,  0.2933, -0.0185,  0.0000, -0.0016,  0.0250,
             0.0000,  0.3512,  0.0000,  0.0000], grad_fn=<MulBackward0>)
    

## Implementations from Projects

Here are a few practical implementations from LLM models

### GPT-2

{{< figure src="gelu.png" caption="GELU implementaiton from [GPT-2 model definition](https://github.com/openai/gpt-2/blob/9b63575ef42771a015060c964af2c3da4cf7c8ab/src/model.py#L25).">}}

GPT-2 uses an approximate version of GELU.

### LLaMA

{{< figure src="llama.png" caption="SwiGLU implementaiton from [LLaMA model definition](https://github.com/facebookresearch/llama/blob/a0a4da8b497c566403941ceec47c2512ecf9dd20/llama/model.py#L348).">}}

The python code

```python
F.silu(self.w1(x)) * self.w3(x)
```

is the SwiGLU implementation, the whole function is for the FFN ( MLP layer ) in the transformers.

### Gemma

{{< figure src="Gemma.png" caption="GeGLU implementaiton from [Gemma model definition](https://github.com/google/gemma_pytorch/blob/324cb185aa3fe60f43dad4b7ce5096ffdd513cb1/gemma/model.py#L195).">}}


The GEGLU is a little more hidden in this function, the screenshot shows the whole FFN ( MLP layer ) function, but if you carefully observe you can make out the GEGLU implementation. (Hint look at the `fuse` variable)
