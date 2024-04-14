---
title: "Microsoft Python Programming Interview Question"
date: 2024-04-10T11:30:03+00:00
# weight: 1
# aliases: ["/first"]
tags: ["python"]
# series: ["Math in DL"]
author: "Sathvik Joel"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: true
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
# cover:
#     image: "pi.jpg" # image path/url
#     alt: "Unraveling Deep Learning's Subtleties" # alt text
#     caption: "Unraveling Deep Learning's Subtleties" # display caption under cover
#     relative: false # when using page bundles set this to true
#     hidden: true # only hide on current single page
# editPost:
#     URL: "https://github.com/<path_to_repo>/content"
#     Text: "Suggest Changes" # edit text
#     appendFilePath: true # to append file path to Edit link
---

I want to discuss an interview question that was asked in an interview at Microsoft during my interview for the poistion of a Research Fellow( RF ). The question primary deals with python programming knowledge and it requires understanding of **generators**. In this post I will discuss the programming topics that are required to solve the question and finally give a solutioin to the question. The question is pretty open ended and I was asked to write the code in a google doc. So, feel free to write your own solution.

## The Question 🤔
You are given a dataset that is a list of sample, label.
For example: 
$$
\begin{align*}
\text{data} = \{ (X_1, y_1), (X_2, y_2), \ldots, (X_n, y_n) \}
\end{align*}
$$

You are required to write a function that takes this dataset and returns batches of data. But ofcourse, we dont need all the batches at once. We need to generate the batches on the fly. This is where the concept of **generators** comes into play.

### Function Definition 📝
The function definition is as follows:
```python
def batch_generator(data, batch_size):
    ```
    Args:
        data: list of tuples
        batch_size: int
    Returns:
        Generator that returns batches of data
        Batch should be a pair of samples and lables
        Eg: (X_batch, y_batch) where X_batch and y_batch are lists
    ```
    pass
```

## Generators 🧐
To understand Generators we need to understand the concept of **iterables** and **iterators**.

> **Iterables**: An iterable is an object that can be iterated upon, simply we can use a for loop to iterate over it.

It must implement the `__iter__` method and the `__iter__` method must return an iterator.


> **Iterators**: An Object with a state and rememebers where it is during the iteration and knows how to get the next value.

It must implement the `__next__` method and the `__iter__` method, this is called [Iterator Protocol](https://realpython.com/python-iterators-iterables#what-is-the-python-iterator-protocol).

> **Generators**: A generator is a special type of iterator that generates values on the fly. More precisely, generator functions are a special kind of function that **returns** a lazy iterator.


### How does generator work?

A generator function is very similar to a regular function, but instead of a `return` statement, a generator uses `yield` statement. 

So, whats the difference between `return` and `yield`?

When the Python yield statement is hit, the program suspends function execution and returns the yielded value to the caller. (In contrast, return stops function execution completely.) When a function is suspended, the state of that function is saved. This includes any variable bindings local to the generator, the instruction pointer, the internal stack, and any exception handling. *So when the function is called again, the function resumes execution right after the yield statement*[^1]

To understand this better, lets look at an example that is taken from the Real Python Blog[^1].

```python
def multi_yield():
    yield_str = "This will print the first string"
    yield yield_str
    yield_str = "This will print the second string"
    yield yield_str
multi_obj = multi_yield()
print(next(multi_obj))
print(next(multi_obj))
print(next(multi_obj))
```

    This will print the first string
    This will print the second string

    Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    StopIteration

It can be seen that the second time the next is called, the function resumes execution right after the first yield statement.


Since the generator returns an interator, it already implements the `__iter__` and `__next__` methods. So, we can use the generator in a for loop.

## Constraints 📏

1. The function should return batches of data.
2. For the last batch return a batch that is same size as the batch size; use None for the sample and label if the batch is smaller than the batch size.

## Solution 🧠
```python
def batch_generator(data, batch_size):
    for i in range(0, len(data), batch_size):
        X_batch = []
        y_batch = []
        for j in range(i, i+batch_size):
            if j >= len(data):
                X_batch.append(None)
                y_batch.append(None)
            else:
                X_batch.append(data[j][0])
                y_batch.append(data[j][1])
        yield X_batch, y_batch
```

## Extension 🚀

Obviously, this is not the only question the interviewer asked me, later he asked me to extend this function. The interviewr could have asked an extention in a number of ways for example:
- Convert it into a class
- Add a method to shuffle the data
- Add a collate function to collate the data

But due the limitation of time, the interviwer asked me a simple extention to this, the extention was the following:


Assume $X_1, X_2, \ldots, X_n$ are sentences and the task is to convert these sentences into tokens before returning the batch. Also, there is a variable `seq_len` that is the maximum length of the tokens in the returned batch and it is the job of the batching function to turncate or elonate the sentences to make them of length `seq_len`. 

Here I assumed that there is a tokenizer object, and the following were defined:
- `tokenizer.tokenize(sentence)`: This function tokenizes the sentence and returns a list of tokens.
- `tokenizer.pad_index` : This is the index of the padding token in the vocabulary.


This is pretty easy to integrate into the existing function. So I shall leave this as an exercise.



[^1]: [Real Python Blog on Generators](https://realpython.com/introduction-to-python-generators/)





