---
title: "安装与配置指南"
slug: "theme-install"
date: 2025-01-08
description: "config.toml 的每个参数逐一说明：布局、元数据、侧栏、菜单、评论、搜索、SEO，以及必须知道的 TOML 陷阱。"
featured: "images/covers/theme-install.svg"
categories: ["技术"]
tags: ["hugo", "配置"]
author: "Period"
---

## 安装

把主题放入 Hugo 站点的 `themes/` 目录，然后在 `config.toml` 声明：

```toml
theme = "period"
```

配置从模板开始最省事：把 `config.toml.example` 复制为 `config.toml` 再改。

## 核心参数速查

```toml
[params]
  tagline       = "记录设计、代码与生活的个人博客。"  # 页眉标语
  description   = "站点描述"                          # 首页 meta/OG/JSON-LD
  author        = "Period"                            # 默认作者（front matter 可覆盖）
  dateFormat    = "2006年1月2日"                      # Go 时间布局
  layout        = "right"      # right | left —— 侧边栏位置
  fullPost      = false        # true = 列表页显示全文而非摘要
  excerptLength = 40           # 自动摘要字数（无 description 时生效）
  readMoreText  = "阅读更多"    # 摘要按钮文字
  displayAuthor = true         # 署名显示作者
  displayDate   = true         # 署名显示日期
  lastUpdated   = true         # 显示"最后更新于"
  scrollToTop   = true         # 返回顶部按钮
  logo          = ""           # logo 路径（static/ 下）；留空用文字标题
  logoSize      = 168          # logo 宽度 px
  searchBar     = true         # 页眉搜索按钮
  footerText    = "版权说明"    # 页脚 credit 条
  googleFonts   = true         # 加载 Google Fonts（false = 离线系统字体）
  fontFamily    = "Roboto:300,300italic,400,700"
  fontSubsets   = "latin,latin-ext"
```

### 侧栏组件

```toml
[params.sidebar]
  recentPosts = 5       # 最近文章；0 = 不显示
  categories  = true    # 分类列表（带计数）
  tags        = true    # 标签云
  archives    = true    # 按月归档（链接到 /archives/#2025-01）
  [params.sidebar.about]      # 关于组件（参考 laruence.com 紧凑样式）
    name  = "Period"          # 加粗名字
    image = "images/avatar.jpg"   # 81×50 小头像（object-fit: cover）
    text  = "简介，支持 Markdown 链接"
```

### 导航菜单（含嵌套）

```toml
[menu]
  [[menu.main]]
    name       = "主页"
    url        = "/"
    weight     = 1
    identifier = "home"
  # 嵌套子菜单：用 parent 指向父项 name
  [[menu.main]]
    name   = "专题"
    weight = 8
  [[menu.main]]
    name   = "AI"
    url    = "/post/ai/"
    parent = "专题"
```

- `weight` 决定顺序；`identifier` 为 `rss` 时菜单自动加 fa-rss 图标；
- 当前页自动高亮（`current-menu-item` + `aria-current="page"`），以菜单 url 与页面地址精确匹配为准。

## ⚠️ TOML 陷阱（必读）

TOML 中一旦出现子表表头，**其后的所有键都归属该子表**，直到下一个表头：

```toml
# ✅ 正确：顶层标量在前，子表在后
[params]
  layout = "right"
  [params.social]
    rss = "/index.xml"

# ❌ 错误：layout 会被解析成 params.social.layout
[params]
  [params.social]
    rss = "/index.xml"
  layout = "right"
```

同理，`[params.seo]` 子表内的 `[params.seo.verification]` 之后的键也须写在它之前。
`config.toml.example` 已按正确顺序排列，新增键时请遵守。

## 评论 / 搜索 / 表单开关

```toml
[params.comments]          # provider = "none" 时零脚本加载
  provider = "giscus"      # none | giscus | utterances
  repo     = "yourname/your-repo"
  repoId   = "R_kgDOxxxxxxx"
  category = "Announcements"
  categoryId = "DIC_kwDOxxxxxxx"
  theme    = "light"       # 勿用 preferred_color_scheme（SSR 下加载不存在的主题文件）

[params.search]            # 构建后需运行 npx pagefind --site public
  provider    = "pagefind" # none | pagefind
  placeholder = "搜索…"

[params.contactForm]       # 配合 {{< contact-form >}} 短代码
  provider = "none"        # none | formspree | netlify
  endpoint = ""            # formspree: https://formspree.io/f/xxxx
```

## 常见问题

| 现象 | 原因与解决 |
|---|---|
| 改配置不生效 | `hugo server` 需重启才重载 `[permalinks]`/`[markup]` 等配置 |
| 菜单不高亮 | 菜单 url 与页面地址不完全一致（大小写、结尾斜杠） |
| 搜索无结果 | 忘记运行 `npx pagefind --site public`，或 baseURL 与部署域名不一致 |
| 评论报 "not installed" | giscus App 未安装到该仓库 / 仓库非公开 / Discussions 未开启 |
