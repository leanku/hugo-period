---
title: "Period 主题简介与快速开始"
slug: "theme-intro"
date: 2025-01-15
lastmod: 2025-01-20
description: "Period Hugo 主题是什么、有哪些特性，以及从零跑起来的具体步骤与环境要求。本文是整套演示站点的入口。"
featured: "images/covers/theme-intro.svg"
categories: ["技术"]
tags: ["hugo", "主题"]
author: "Period"
---

**Period** 是把 Compete Themes 的 WordPress 博客主题复刻到 Hugo 的静态站点主题：深色页眉、
浅灰背景、白色卡片，内容区上叠压住页眉下沿是它的标志性视觉。配色、字体、间距、断点均
逐值移植自原版 v1.750 的 `style.css`，视觉相似度目标 ≥90%。

## 特性清单

| 特性 | 具体内容 |
|---|---|
| 布局 | 1300px 最大宽度；≥900px 双栏（主栏 62.5% + 侧栏 34.375%），`layout = "right"/"left"` 切换 |
| 响应式 | 600 / 900 / 1100px 三档断点；移动端汉堡菜单 + 子菜单手风琴 |
| 零依赖 JS | 菜单/搜索/返回顶部/代码复制均为原生脚本，无 jQuery |
| 代码高亮 | Hugo Chroma（Atom One Dark），行号 + 一键复制 |
| SEO | robots 索引控制、Open Graph、Twitter Cards、JSON-LD（Organization/BreadcrumbList/BlogPosting） |
| 搜索 | Pagefind 全文搜索（构建后 `npx pagefind --site public`） |
| 评论 | Giscus / Utterances（默认关闭，配置即用） |
| 表单 | Formspree / Netlify Forms（`{{< contact-form >}}` 短代码） |

## 环境要求

- **Hugo extended ≥ v0.128**（推荐：内置 dart-sass，SCSS 自动编译，**零 Node 依赖**）；
- 普通版 Hugo 也可用（样式回退到预编译 CSS），但需 Node 手动编译 SCSS；
- 搜索功能需要 Node（pagefind）。

## 快速开始（三步）

```bash
# 1. 复制配置模板
copy config.toml.example config.toml    # Windows
cp config.toml.example config.toml      # macOS/Linux

# 2. 本地预览
hugo server -D

# 3. 生产构建 + 搜索索引
hugo --minify && npx pagefind --site public
```

打开 http://localhost:1313 即可看到本演示站点。

> **端口被占用？** 报 `port 1313 already in use` 时加 `--port 8080` 换端口。
> **改了 config 不生效？** `[permalinks]`/`[markup]` 等配置变更需要重启 `hugo server`。

## 目录结构速览

```text
period/
├── config.toml.example    # 配置模板（复制为 config.toml 使用；config.toml 不入库）
├── content/
│   ├── post/              # 文章（theme-*.md 即本组说明文档）
│   ├── about/  contact/   # 页面
│   ├── archives.md        # 归档页 /archives/
│   └── search.md          # 搜索页 /search/
├── static/images/         # 特色图、头像、favicon
└── themes/period/         # ★ 主题本体
    ├── layouts/           # baseof + partials + shortcodes
    ├── assets/scss/       # 设计令牌与样式源码
    ├── assets/js/         # 原生交互脚本
    ├── i18n/              # 中英文案
    └── static/font-awesome/
```

## 接下来读什么

1. [安装与配置指南](/post/theme-install/) —— config.toml 全参数
2. [内容写作指南](/post/theme-content/) —— front matter 与排版
3. [代码高亮与排版](/post/theme-code/) —— Chroma 与 Markdown 进阶
4. [主题定制](/post/theme-customize/) —— SCSS 设计令牌
5. [评论、搜索与表单](/post/theme-integrations/) —— 第三方服务
6. [SEO 与部署](/post/theme-seo/) —— 上线前必读
