---
title: "内容写作指南：Front Matter 与排版"
slug: "theme-content"
date: 2024-12-20
description: "front matter 全字段速查、特色图的两种用法与尺寸建议、摘要写法、分类标签、归档页，以及创建文章的正确姿势。"
featured: "images/covers/theme-content.svg"
categories: ["技术"]
tags: ["hugo", "写作", "markdown"]
author: "Period"
---

## Front Matter 全字段

每篇文章开头用 `---` 包裹的 YAML 就是 front matter。完整字段：

```yaml
---
title: "文章标题"                 # 必填
date: 2025-01-15                  # 必填：发布时间（决定排序与归档）
lastmod: 2025-01-20               # 可选：详情页显示"最后更新于"
description: "摘要，列表页显示"    # 强烈建议手写（见"摘要"一节）
featured: "images/hero.jpg"       # 特色图（static/ 下路径；也可用 Page Bundle）
slug: "my-post"                   # 可选：URL 末尾段（默认取文件名）
categories: ["技术"]              # 分类（可多个）
tags: ["hugo", "写作"]            # 标签（可多个）
author: "Period"                  # 可选：覆盖站点默认作者
sticky: true                      # 可选：列表页显示"精选"徽标
draft: true                       # 草稿（hugo server -D 才显示）
keywords: ["hugo", "主题"]        # 可选：meta keywords（缺省用 tags）
canonicalURL: ""                  # 可选：手动指定 canonical（转载声明用）
robotsNoIndex: true               # 可选：单篇屏蔽索引
images: ["images/hero.jpg"]       # 可选：OG/JSON-LD 图片列表（缺省取 featured）
---
```

## 特色图：两种用法

| 方式 | 说明 | 示例 |
|---|---|---|
| `featured` 参数 | 指向 `static/` 下路径 | `featured: "images/covers/theme-intro.svg"` |
| Page Bundle | 文章目录 `index.md` + 图片 | `content/post/xxx/index.md` + `hero.jpg`，自动取包内第一张图 |

列表页特色图统一 **2:1 比例裁切**（`object-fit: cover`），建议源图 ≥ 1200×600；
本站示例用的是同比例的 SVG 封面，文字不会裁切。

## 摘要（Summary）写法

- 列表卡片优先显示 `description`；留空则用 Hugo 自动摘要（长度由 `params.excerptLength` 控制），
  末尾自动附加"阅读更多"按钮；
- **中文没有空格分词，自动摘要可能从句子中间截断——务必手写 `description`**，建议 60~120 字；
- 摘要里的 Markdown 链接可以正常渲染（`[链接](https://example.com)`）。

## 分类、标签与归档

```bash
hugo new post/my-first-post.md     # 在 post 分区创建（archetypes/post.md 模板）
```

- 分类归档：`/categories/技术/`；标签归档：`/tags/hugo/`；总览页：`/categories/`、`/tags/`；
- 给分类/标签写描述：在 `content/categories/技术/_index.md`（或 tags 下）加 front matter
  `description`，会显示在归档标题条下方；
- 按月归档：`/archives/`，侧栏"归档"组件与文章署名里的日期链接都指向它；
- URL 由 `[permalinks] post = "/:sections/:slug/"` 决定：`content/post/ai/openclaw.md` → `/post/ai/openclaw/`。
  **嵌套子分区必须建 `_index.md`**，否则该层级不会出现在 URL 中。

## 正文排版要点

- 正文链接自动**加粗 + 下划线**，悬停去下划线（原版主题排版习惯）；
- 支持表格、脚注、任务列表、定义列表（goldmark 已开启），示例见
  [代码高亮与 Markdown 进阶排版](/post/theme-code/)；
- `markup.goldmark.renderer.unsafe = true` 已开启，可直接嵌入 HTML；
- 行内代码 `` `code` `` 与代码块 ```lang 均会自动着色（One Dark）。

## 写作流程建议

1. `hugo new post/xxx.md` 生成草稿；
2. 填写 front matter（标题、日期、description、featured、分类、标签）；
3. `hugo server -D` 边写边预览（草稿也显示）；
4. 定稿后删掉 `draft: true`，`hugo --minify && npx pagefind --site public` 构建发布。
