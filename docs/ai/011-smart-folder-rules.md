Implement various smart folder rules.

## `type` rule

already implemented.
see ./010-smart-folder.md

## `name` rule

already implemented.
see ./010-smart-folder.md

## `tags` rule

method: "union" | "intersection" | "equal" | "identity" | "empty" | "not-empty"
value: any value for "empty" | "not-empty", and string[] for other methods.

### method rules

union: items that have at least one tag in value tags
intersection: items that have all tags in value tags
equal: items that have exactly same tags with value tags
identity: items that don't have any tags in value tags (this method may be mislabelled)
empty: items that have no tag
not-empty: items that have at least one any tag

## `folders` rule

method: "union" | "intersection" | "equal" | "identity" | "empty" | "not-empty"
value: any value for "empty" | "not-empty", and string[] (array of folderId) for other methods.

method rules are same as tags rule.

## `folderName` rule

method: "contain" | "uncontain" | "startWith" | "endWith" | "equal" | "empty" | "not-empty" | "regex"
value: any value for "empty" | "not-empty", and string for other methods.

text match rules are same as `name` rule.
item may have multiple folders. item matches the rule if at least one folder match the rule.

## `color` rule

method: "similar" | "accuracy" | "grayscale"
value: string (hex value with format like "#ffffff" or "#0087EF") for "similar" | "accuracy", any value for "grayscale"

### method rules

items without item.palettes (or palettes is empty) doen't match any rules.

item.palettes example

```json
{
  "palettes": [
    { "color": [221, 218, 210], "ratio": 51 },
    { "color": [170, 148, 109], "ratio": 16 },
    { "color": [188, 188, 176], "ratio": 1.32 }
  ]
}
```

color: RGB int values
ratio: The proportion of that color within the image with range [0-100]

#### "similar" and "accuracy"

I couldn't find exact method used in Eagle app.
In this webui, we use "redmean" color distance between value and item.palettes .

https://en.wikipedia.org/wiki/Color_difference#sRGB

(write equoation here)

calc redmean distance value between value and each colors in palettes,
and get weighted sum with ratio (normalize ratio to [0.0-1.0]) as distance.

similar: distance < 32.0
accuracy: distance < 12.8

#### grayscale

item.palettes have only grayscale colors

##　 `createTime` rule

method: "before" | "after" | "between" | "on" | "within"
value: number[]

value.length must be >= 2 for "between", >= 1 for others.
value may contain extra length. ignore that.

### method rules

compare rules with `item.modificationTime`

#### for "before" | "after" | "between" | "on"

numbers of `value` represent UNIX time (ms) of 00:00 in certain date in user timezone.
comparison with `item.modificationTime` as date.

before: item.modificationTime <= target data, that is item.modificationTime < value[0] + 24h
after: value[0] <= item.modificationTime
between: value[0] <= item.modificationTime 　< value[1] + 24h
on: value[0] <= item.modificationTime 　< value[0] + 24h

#### for "within"

value[0] is int value. item with modificationTime that is within value[0] days from current time

## `mtime` rule

compare rules with `item.mtime` same as `createTime`.

## `btime` rule

compare rules with `item.btime` same as `createTime`.

## `url` rule

compare rules with `item.url` same as `name`.

## `annotation` rule

compare rules with `item.annotation` same as `name`.

## `width` rule

method: ">" | ">=" | "=" | "<" | "<=" | "between"
value: number[] (can be double)

value.length must be >= 2 for "between", >= 1 for others.
value may contain extra length. ignore that.

compare with `item.width`. "between" matches boundary value.

## `height` rule

compare with `item.height` same as `width`

## `fileSize` rule

method and value are same as `width`.

rule object have extra field `unit`
unit: "kb" | "mb" | "gb"

compare with `item.size` same as `width`, with multiplier `unit`.

## `shape` rule

method: "equal" | "unequal"
value: "landscape" | "portrait" | "square" | "panoramic-landscape" | "panoramic-portrait" | "custom"

use `item.width` and `item.height` .

(consider rule for "panoramic-landscape" and "panoramic-portrait")

when `value` is "custom", rule object has extra fields `width` and `height` with number value.
check equality both values with item.

## `rating` rule

method: "equal" | "unequal" | "contain"
value: string | number

simply check as string with `item.star` as string.
contain: `item.star` contains string `value`

## `comments` rule

item metadata has optional field `comments`

```
comments?: [
  {
    id: string;
    annotation: string
  }
]
```

import this field, and compare `value` with `annotation`, same as `folderName`

## `duration` rule

method and value are same as `width`.

rule object have extra field `unit`
unit: "s" | "m" | "h"

compare with `item.duration` same as `width`, with multiplier `unit`.
unit of item.duration is seconds

item with duration = 0 is not video or audio, so these items don't match any duration rule.

## `fontActivated` rule

method: "activate" | "deactivate"

we cannot know font active state from metadata.
for each meethod, filter font item that has fontMetas

## `bpm` rule

compare with `item.bpm` same as `width`

item with bpm = 0 is not audio, so these items don't match any bpm rule.
