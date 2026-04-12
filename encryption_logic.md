# Encryption Logic Overview

This encryption works by splitting characters into two groups: lowercase letters (plus space) and uppercase letters. 

For each character, a shift value is calculated using the key and its position in the text (`shift = key + index`). 

- Lowercase letters and spaces are shifted forward within their group.
- Uppercase letters are shifted backward within theirs. 

Spaces are treated like regular characters, so they can turn into letters. To decrypt, the same process is applied in reverse, which restores the original text exactly without losing any characters.
