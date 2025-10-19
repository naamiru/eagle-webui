In CollectionPage, I created stub TextInput for search. add search functionality.

## search text as url parameter

in each page, get parameter `search` as search text, and pass to item getter functions as `search` parameter.
`search` also passed to child component, chain to SearchControl.

## SearchControl

Create components/CollectionCotrols/SearchControl.tsx and define search control component.
The component accept `initialSearch: string` and hold state `search: string` .
with debounce, set search text to url parameter `search`.

initialSearch is not reactive prop. it is used only for initialize.
SearchControl hold search state, and no need to watch initialSearch, that is passed from url parameters.

rightSection of input is text clear button. it is visible only when text exists.

## item search logic

for each item getter functions, implement filtering with `search` argument.
split `search` into words by whitespaces.
Search for a case-insensitive partial match of the word.
the item that match all of words are selected.

target item fields:

- item name
- Folder name
- Folder description
- item ext
- item tags
- item url
- item comment (comment.annotation)
- item annotation

we need to import additional field in folder metadata: folder.description: string
