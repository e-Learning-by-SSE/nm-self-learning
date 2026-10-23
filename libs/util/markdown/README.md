# util-markdown

This library was generated with [Nx](https://nx.dev).

## Code groups

Wrap fenced code blocks in `::: code-group` and `:::` to display them in tabs with
a fullscreen dialog for viewing all snippets side by side:

````markdown
::: code-group

```typescript title="hello.ts"
const greeting = "Hallo";
```

```python title="hello.py"
print("Hallo")
```

:::
````

`:::code-group` also works. Use blank lines to separate the group from preceding
paragraphs. Tab labels use `title="..."` (or `[filename]`), then the language,
then the snippet number. Each group must contain only fenced code blocks.
Incomplete groups remain readable as ordinary Markdown while editing.

For client rendering, pass `markdownComponents` along with `remarkPlugins` and
`rehypePlugins` to `ReactMarkdown`. Render `compileMarkdown` results using
`MarkdownRemote`, which supplies the same components for compiled Markdown.
Tabs support keyboard navigation; the comparison dialog supports Escape,
focus trapping, and horizontal scrolling on narrow screens.

## Running unit tests

Run `nx test util-markdown` to execute the unit tests via [Jest](https://jestjs.io).
