---
title: "评论、搜索与联系表单集成"
slug: "theme-integrations"
date: 2024-10-28
description: "WordPress 动态功能在 Hugo 的替代方案：Giscus/Utterances 评论、Pagefind 搜索、Formspree/Netlify 表单的完整配置步骤。"
featured: "images/covers/theme-integrations.svg"
categories: ["技术"]
tags: ["hugo", "giscus", "pagefind"]
author: "Period"
---

原 WordPress 主题的评论、搜索、联系表单在 Hugo 中由第三方服务替代，全部通过
`config.toml` 开关控制，**未启用时页面不含任何相关脚本**（性能优先）。

| 功能 | 方案 | 默认 |
|---|---|---|
| 评论 | Giscus / Utterances | 关闭 |
| 搜索 | Pagefind | 开启 |
| 联系表单 | Formspree / Netlify Forms | 关闭 |

## 评论：Giscus（推荐）

### 一次性准备（GitHub 侧）

1. 仓库设为**公开**；
2. Settings → General → Features → 开启 **Discussions**；
3. 安装 **giscus App**：https://github.com/apps/giscus → Configure → 选择该仓库。

### 生成配置

打开 https://giscus.app/zh-CN，选择仓库与分类，复制生成的配置填入：

```toml
[params.comments]
  provider   = "giscus"
  repo       = "你的用户名/你的仓库"
  repoId     = "R_kgDOxxxxxxx"
  category   = "Announcements"
  categoryId = "DIC_kwDOxxxxxxx"
  theme      = "light"     # 或 dark；勿用 preferred_color_scheme（SSR 缺陷）
```

> 排查：页面报 "giscus is not installed" → App 未安装/仓库非公开/Discussions 未开启；
> 控制台 MIME 报错 → theme 用了非法值。

### Utterances 替代

只需 `repo` 与 `theme`（`github-light` / `github-dark`）两个字段，其余照抄
[utteranc.es](https://utteranc.es) 即可。

## 搜索：Pagefind（本站已启用）

### 完整管线

```bash
npm install                 # 首次：安装 pagefind
hugo --minify               # 构建站点
npx pagefind --site public  # 生成 /pagefind/ 索引
```

### 配置与使用

```toml
[params.search]
  provider    = "pagefind"
  placeholder = "搜索…"
```

- 页眉放大镜展开输入框，提交后跳转 `/search/?q=关键词`，Pagefind UI 自动读取 `q` 参数；
- 中文自动识别（索引日志显示语言与页面数）；结果链接为站内相对路径，本地/线上一致；
- 搜索页自身通过 `data-pagefind-ignore` 排除出索引；单篇想排除可给该页加同属性；
- 本地预览：`npx pagefind --serve`（`hugo server` 不生成索引）；
- **baseURL 必须与部署域名一致**，否则结果链接指向错误地址。

## 联系表单：Formspree

1. 在 https://formspree.io 注册并创建表单，得到 `https://formspree.io/f/xxxx` 端点；
2. 配置：

```toml
[params.contactForm]
  provider = "formspree"
  endpoint = "https://formspree.io/f/你的表单ID"
```

3. 在联系页插入短代码（本演示的[联系页](/contact/)即示例）：

```markdown
{{< contact-form >}}
```

- 表单已内置 honeypot 防垃圾字段（`_gotcha`），样式与主题输入框一致；
- Netlify Forms 用户：`provider = "netlify"`（无需 endpoint，表单自动收集提交）。

## 通用原则

三个服务一致的设计：**`provider = "none"` 时零脚本加载**；配置即用、关闭即无痕。
评论与表单默认关闭是为了开箱即用不被第三方依赖拖累，需要时按本文配置即可。
