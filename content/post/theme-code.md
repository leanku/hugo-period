---
title: "代码高亮与 Markdown 进阶排版"
slug: "theme-code"
date: 2024-12-02
description: "Chroma 代码高亮的配置与用法（行号/指定行高亮/一键复制），以及表格、脚注、任务列表、定义列表的完整演示。"
featured: "images/covers/theme-code.svg"
categories: ["技术"]
tags: ["hugo", "代码高亮", "markdown"]
author: "Period"
---

本主题内置 **Hugo Chroma** 代码高亮：Atom One Dark 深色配色、行号、长行横向滚动与一键复制。

## 代码块用法

三个反引号 + 语言名即可，语法高亮由 Chroma 自动完成：

```go
package main

import "fmt"

func main() {
    // 支持 Go/Python/JS/TOML/Bash 等 100+ 语言
    fmt.Println("Hello, Period!")
}
```

需要高亮指定行时，用 `highlight` 短代码 + `hl_lines`（行号从 1 计）：

```text
{{< highlight go "hl_lines=2" >}}
func add(a, b int) int {
    return a + b   // ← 这一行会被背景高亮
}
{{< /highlight >}}
```

Bash 示例（注意行号会自动生成）：

```bash
hugo server -D
hugo --minify && npx pagefind --site public
```

每个代码块右上角有**复制按钮**（悬停高亮），点击即复制全文。

## 高亮配置

```toml
[markup.highlight]
  codeFences = true
  noClasses = false        # 使用 Chroma 类名（配合主题内置 chroma.css）
  lineNos = true           # 行号
  lineNumbersInTable = false
  style = "onedark"        # 与 themes/period/assets/css/chroma.css 对应
  tabWidth = 4
```

**换配色风格**：运行 `hugo gen chromastyles --style=<风格名>`（如 `github`、`monokai`、
`friendly`），把输出覆盖到 `themes/period/assets/css/chroma.css`，再同步修改
`markup.highlight.style` 即可；换成浅色风格时记得同步调整
`themes/period/assets/scss/_base.scss` 里 `.highlight` 块的深色适配（边框/复制按钮配色）。

## Markdown 进阶排版

### 表格

| 语法 | 效果 |
|---|---|
| `**粗体**` | **粗体** |
| `*斜体*` | *斜体* |
| `` `行内代码` `` | `行内代码` |
| `~~删除线~~` | ~~删除线~~ |

### 脚注

脚注[^1]自动渲染为编号引用，点击正文编号可跳转到文末。

[^1]: goldmark 默认支持脚注，无需额外配置。

### 任务列表

- [x] 安装 Hugo extended
- [x] 运行 `hugo server`
- [ ] 配置 Giscus 评论
- [ ] 部署上线

### 定义列表

设计令牌（Design Token）
: 颜色、字体、间距等视觉属性的命名变量，集中定义在 `_variables.scss`。

断点（Breakpoint）
: 响应式布局的切换宽度，本主题为 600 / 900 / 1100px。

### 引用

> 好的代码高亮应该隐身于代码之后——只提供对比度，不抢走注意力。
>
> —— 主题设计手记

### 原始 HTML

`markup.goldmark.renderer.unsafe = true` 已开启，可直接嵌入 HTML：

<div style="background:#f7f7f7;padding:1em 1.5em;border:1px solid #ededed;">
  自定义 HTML 容器示例。
</div>

## 常见问题

| 问题 | 解决 |
|---|---|
| 代码没颜色 | 硬刷新浏览器；确认 `noClasses = false`；检查 chroma.css 是否随构建输出 |
| 复制按钮消失 | 旧样式缓存，硬刷新；按钮为绝对定位，不会遮挡代码文字 |
| 长行被截断 | 代码块 `overflow-x: auto` 横向滚动，不会换行断行 |
