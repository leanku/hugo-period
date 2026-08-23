# Period Hugo 主题 — 设计文档

> 目标：将 Compete Themes 的 **Period** WordPress 主题（v1.750，GPL）复刻为 Hugo 静态站点主题，
> 视觉相似度 ≥ 90%，功能覆盖：文章列表、详情页、分类/标签、分页、导航菜单、响应式布局。
>
> 本设计基于**官方主题源码**（`downloads.wordpress.org/theme/period.1.750.zip`）逐条分析得出，
> 非凭空猜测。演示站点 `demo.competethemes.com` 位于 Cloudflare 之后无法直接抓取，
> 但其渲染效果即主题默认配置，故以源码 CSS 为唯一权威参照。

---

## 0. 设计结论摘要（TL;DR）

| 维度 | 结论 |
|---|---|
| 设计语言 | 「深色头部 + 浅灰底 + 白色卡片」的极简编辑型博客 |
| 主色 | 炭灰 `#333333`（页眉/页脚/正文）、浅灰 `#EDEDED`（页面底）、白卡片 |
| 字体 | **仅 Roboto**（300/300italic/400/700），无衬线、低字重正文 |
| 布局 | 1300px 最大宽度；≥900px 时主栏 62.5% + 侧栏 34.375%（默认右栏） |
| 签名特征 | 内容区 `margin-top: -5.25em` **上叠压住深色页眉下沿** |
| 构建 | SCSS 源码 + 预编译 CSS（本机 Hugo 0.104 非 extended，不支持 Pipes 编译 SCSS） |
| 第三方 | 评论 Giscus/Utterances · 搜索 Pagefind · 表单 Formspree |

---

## 1. 视觉分析（来自官方源码 style.css，逐值核对）

### 1.1 设计语言

- "dark, clean, and SEO-optimized blogging theme"（官方描述）。
- 全站只有一个强调方式：**深炭灰 + 白** 的反差，无彩色强调色（自定义颜色是 Pro 功能，免费版与演示站均为默认）。
- 视觉层级靠字重（正文 300 / 标题 700）与卡片阴影，而非色彩。

### 1.2 配色令牌（精确值，全部来自 style.css）

| 令牌 | 值 | 用途 |
|---|---|---|
| `--c-page` | `#EDEDED` | 页面背景 `body` |
| `--c-text` | `#333333` | 正文、链接、标题 |
| `--c-text-hover` | `#757575` | 正文区链接 hover |
| `--c-header` | `#333333` | `site-header` / `site-footer` 背景 |
| `--c-header-text` | `#FFFFFF` | 页眉/页脚/菜单链接文字 |
| `--c-header-text-hover` | `#D4D4D4` | tagline、页眉链接 hover、页脚文字 |
| `--c-credit` | `#242424` | `design-credit`、当前菜单项、归档标题条、返回顶部按钮 |
| `--c-card` | `#FFFFFF` | 文章卡片、侧栏组件、分页、评论卡片 |
| `--c-card-shadow` | `rgba(58,58,58,0.2)` | 卡片阴影 `0 0 2px 0` |
| `--c-input-bg` | `#F7F7F7` | 输入框/代码块背景 |
| `--c-input-border` | `#D4D4D4` | 输入框描边 |
| `--c-muted` | `#666666` | placeholder、次要文字 |
| 反色态 | 文字 `#FFF` / 底 `#333` | 标签 pill、more-link、按钮 hover 反转 |

### 1.3 字体与字阶

- 字体族：**Roboto**（Google Fonts，`300,300italic,400,700`，`latin,latin-ext`，`display=swap`）。全站唯一字体。
- 正文：`16px`，`line-height 1.5`，字重 `300`；标题字重 `700`。
- 字阶（与断点联动，模拟 WP 的媒体查询）：

| 元素 | 基础(<600px) | ≥600px | ≥900px | ≥1100px |
|---|---|---|---|---|
| `body` | 16px/1.5/300 | — | — | — |
| `site-title` | 21px/1.333/700 | — | — | — |
| `h1`（单篇标题） | 18px/1.333 | 21px/1.333 | — | 28px/1.357 |
| `h2`（列表标题） | 18px/1.333 | 21px/1.333 | — | 21px/1.333 |
| `h3` | 16px/1.5 | — | — | 18px/1.333 |
| 导航/组件/分类/标签/归档 | 14px/1.715 | — | — | — |
| 署名/表单/图注/credit | 12px/1.5 | — | — | — |

### 1.4 布局与网格

- 最大宽度 `.max-width`: **1300px**，居中。
- 内容容器 `.primary-container`: `padding: 0 5.5556%; margin-top: -5.25em`（**上叠压头**，签名特征）。
- 网格（≥900px，`56.25em`）：
  - `.main`: `width: 62.5005%; float: left; margin-right: 3.125025%`
  - `.sidebar-primary`: `width: 34.375275%; float: left; margin-top: 3em`
  - `.left-sidebar .main`: `float: right; margin-right: 0; margin-left: 3.125025%`（侧栏换左）
  - 默认布局 **right-sidebar**（右栏）。
- 断点：`37.5em`(600px) / `56.25em`(900px) / `68.75em`(1100px)。

### 1.5 组件规格

| 组件 | 规格 |
|---|---|
| `site-header` | 背景 `#333`，白字，居中；`padding: 36px 5.5556% 5.25em`；≥900px 左对齐，`title-container`(左 float) + `icon-container`(右 float，社交图标+搜索) |
| 主菜单 | 移动端：汉堡按钮(36×23 SVG 三白条) + `max-height` 手风琴展开；桌面 ≥900px：inline-block，`li` 间距 `0 10px 0 0`，**hover 白底黑字块状反色**；当前项 `#242424` 底；下拉白底黑字绝对定位 |
| 归档标题条 | `#242424` 圆角 pill：`folder-open`/`tag`/`user`/`calendar` 图标 + 标题（字重300 白字），描述为 `#D4D4D4` pill，`padding: 6px 14px` |
| 文章卡片 `.entry > article` | 白底 + `0 0 2px 0 rgba(58,58,58,.2)` 阴影，`margin-bottom: 1.5em` |
| 特色图 | 宽高比 **2:1**（`padding-bottom: 50%`），`object-fit: cover`，绝对定位铺满；列表页外层包 `<a>` 链接 |
| 署名 byline | 12px：`Published {date} by {author}`；日期/作者粗体+下划线，hover 去下划线 |
| more-link | 列表摘要末尾按钮：`1px solid #333` 描边、`padding: 6px 12px`，hover 反色 |
| 标签 | pill：`1px solid #333`、`padding: 0 12px`、`margin: 0 6px 6px 0`，hover 反色 |
| 分页 | 白卡片居中；`«`/`»` 前后箭头；当前页 `#EDEDED` 底 `padding: 2px 8px`；≥600px 上一页/下一页绝对定位两端 |
| 侧栏组件 | 白卡片同文章卡片样式；标题 16px，`margin-bottom: 1.5em`；链接 hover 下划线 |
| `site-footer` | 背景 `#333`、居中、`margin-top: 3.75em`、文字 `#D4D4D4`、链接白粗体；`design-credit` 条背景 `#242424`、`padding: 9px 5.5556%` |
| 页眉搜索 | 放大镜图标（白，hover `#D4D4D4`），点击展开绝对定位输入框（focus 白色 + pulse 描边动画） |
| 返回顶部 | 固定右下 60px 宽按钮，`#242424` 底，hover `#666666`，`fa-arrow-up` 21px |

### 1.6 交互与动效

| 场景 | 行为 | 时长 |
|---|---|---|
| 正文链接 | 变色 `#333→#757575` | 0.1s |
| 菜单项 hover | 白底黑字块状反色（含子项箭头下移） | 0.2s |
| 移动菜单展开 | `max-height` 手风琴 | 0.3s ease-in-out |
| 下拉菜单 | 透明度/可见性过渡 | 0.2s |
| 特色图 focus | 白色遮罩 `opacity: 0.2` | 0.1s |
| 输入框 focus | 背景 `#F7F7F7→#FFF`，描边 pulse | 0.2s |
| 返回顶部按钮 | `translateY(-45px)` 滑入 | 0.3s |

### 1.7 响应式行为汇总

- `<600px`：单栏，页眉居中，汉堡菜单。
- `600–900px`：单栏，字号微升（标题 21px），分页两端箭头。
- `900–1100px`：双栏（62.5%+34.375%），页眉左对齐+右侧图标区。
- `≥1100px`：字号升至最大（h1 28px），卡片内边距 `1.875em 7.50006% 2.25em`。

---

## 2. 信息架构与 Hugo 模板映射

### 2.1 站点目录结构（工作区根 = Hugo 站点根）

```
D:\Develop\Hugo\period\
├── hugo.toml                  # 站点配置（含主题全部参数）
├── content/                   # 示例内容
│   ├── _index.md
│   ├── posts/                 # 博客文章（.Type = posts）
│   │   └── hello-world/       # Page Bundle：index.md + 特色图
│   ├── about/                 # 独立页面
│   ├── contact/               # 联系页（Formspree 短代码）
│   ├── categories/            # 分类术语页（可选 _index.md 描述）
│   └── tags/                  # 标签术语页
├── archetypes/post.md
├── themes/period/             # ★ 主题本体（见 2.2）
├── package.json               # npm run css（sass 编译）
├── static/images/             # 示例站点静态资源（含示例特色图）
├── docs/DESIGN.md             # 本文档
└── README.md                  # 安装/配置/自定义说明
```

### 2.2 主题目录结构（`themes/period/`）

```
themes/period/
├── theme.toml
├── LICENSE.md                 # GPL v2（衍生自 GPL 主题）+ Font Awesome 授权说明
├── assets/
│   ├── scss/                  # ★ SCSS 源码（设计令牌在此，见 §3）
│   │   ├── main.scss
│   │   ├── _variables.scss    # 全部颜色/字体/间距/断点令牌
│   │   ├── _mixins.scss
│   │   ├── _base.scss         # reset、正文、标题、链接、表格、代码
│   │   ├── _layout.scss       # 网格、max-width、内容上叠
│   │   ├── _header.scss       # 页眉 + 社交图标 + 搜索
│   │   ├── _nav.scss          # 桌面/移动菜单
│   │   ├── _cards.scss        # 文章卡片 + 特色图 + 归档标题条
│   │   ├── _single.scss       # 单篇：正文、分类/标签、前后篇
│   │   ├── _sidebar.scss
│   │   ├── _pagination.scss
│   │   ├── _footer.scss
│   │   ├── _forms.scss        # 输入框/按钮/联系表单
│   │   └── _utilities.scss    # 无障碍类、clearfix 等
│   └── css/main.css           # ★ 预编译产物（npm run css 生成，Hugo 直接引用）
├── assets/js/main.js          # 原生 JS（汉堡菜单/下拉/搜索/返回顶部，无依赖）
├── static/
│   ├── font-awesome/          # 从原主题复制的 FA 5 图标字体（woff2 + all.min.css）
│   └── images/                # 主题内置示例图
└── layouts/
    ├── index.html             # 首页 = 文章流（对应 WP index.php）
    ├── 404.html
    ├── _default/
    │   ├── baseof.html        # 页面骨架（head/header/main/footer 装配）
    │   ├── list.html          # 分类/标签/日期归档
    │   ├── single.html        # 文章与页面详情
    │   └── terms.html         # 分类/标签云页
    ├── partials/
    │   ├── head.html          # meta/OG/字体/样式装配
    │   ├── site-header.html   # 对应 header.php
    │   ├── logo.html          # 对应 logo.php（支持图片/文字 logo）
    │   ├── menu.html          # 对应 menu-primary.php（Hugo menu.main）
    │   ├── social.html        # 对应 social icons（FA 图标）
    │   ├── search.html        # 对应 search-bar.php（Pagefind 集成）
    │   ├── archive-header.html# 对应 content/archive-header.php
    │   ├── post-card.html     # 对应 content-archive.php（列表卡片）
    │   ├── post-byline.html   # 对应 content/post-byline.php
    │   ├── post-categories.html
    │   ├── post-tags.html
    │   ├── further-reading.html # 对应 content/post-nav.php（上一篇/下一篇）
    │   ├── sidebar.html       # 对应 sidebar-primary.php（params 驱动组件）
    │   ├── widgets/
    │   │   ├── about.html     # 关于
    │   │   ├── recent.html    # 最近文章
    │   │   ├── categories.html
    │   │   ├── tags.html
    │   │   └── archives.html  # 按月归档
    │   ├── pagination.html    # 对应 the_posts_pagination
    │   ├── comments.html      # Giscus/Utterances 集成点
    │   ├── footer.html        # 对应 footer.php
    │   └── scroll-to-top.html
    └── shortcodes/
        └── contact-form.html  # Formspree 表单
```

### 2.3 WordPress → Hugo 模板映射表

| WordPress | Hugo | 说明 |
|---|---|---|
| `header.php` | `partials/site-header.html` | 页眉 |
| `footer.php` | `partials/footer.html` | 页脚 |
| `index.php` | `layouts/index.html` | 首页文章流 |
| `content-archive.php` | `partials/post-card.html` | 列表卡片 |
| `content.php`（单篇） | `_default/single.html` + `partials/post-meta` 系列 | 详情页 |
| `sidebar-primary.php` | `partials/sidebar.html` + `widgets/*` | 侧栏（params 驱动） |
| `logo.php` | `partials/logo.html` | 站点标题/logo |
| `menu-primary.php` | `partials/menu.html` | Hugo `menu.main` |
| `content/archive-header.php` | `partials/archive-header.html` | 归档标题 pill |
| `content/post-byline.php` | `partials/post-byline.html` | 署名 |
| `content/post-categories.php` / `post-tags.php` | `partials/post-categories.html` / `post-tags.html` | 分类/标签 |
| `content/post-nav.php` | `partials/further-reading.html` | 上一篇/下一篇 |
| `content/search-bar.php` | `partials/search.html` | Pagefind 搜索 |
| `the_posts_pagination` | `partials/pagination.html` | 分页（`paginate`） |
| `comments_template` | `partials/comments.html` | Giscus/Utterances |
| `404.php` | `layouts/404.html` | 404 |
| `search.php` | `layouts/_default/search.html` + Pagefind UI | 搜索结果页 |
| 分类/标签归档 | `_default/list.html` + `terms.html` | taxonomy |

### 2.4 数据流设计

- **菜单**：`hugo.toml` 的 `[menu.main]` → `partials/menu.html` 渲染 `ul.menu-primary-items`；当前项判断用 `$.IsMenuCurrent`/`$.HasMenuCurrent` 输出 `current-menu-item` 类。子菜单用嵌套 `children` 递归 partial（Hugo 支持菜单嵌套）。
- **分类/标签**：默认 taxonomy（`categories`/`tags`）；文章 front matter 声明；`list.html` 统一渲染归档（分类/标签/日期），`archive-header.html` 按 `Kind` 选图标。
- **特色图**：优先 Page Bundle 资源（`resources.GetMatch "*.jpg"`），回退 front matter `featured` 指向 `static/images/`。
- **摘要**：front matter `summary` 优先；否则 Hugo 自动摘要；长度由 `params.excerptLength` 控制，尾部拼 `readMoreText`（对应 WP `excerpt_length=25` + `Continue Reading`）。
- **分页**：`paginate = 6`（演示站首页约 6 篇），模板用 `paginator`。

---

## 3. SCSS 架构与构建策略

### 3.1 设计令牌（`_variables.scss` 核心内容）

```scss
// ===== Colors（与 §1.2 一一对应）=====
$c-page:              #EDEDED;
$c-text:              #333333;
$c-text-hover:        #757575;
$c-header:            #333333;
$c-header-text:       #FFFFFF;
$c-header-text-hover: #D4D4D4;
$c-credit:            #242424;
$c-card:              #FFFFFF;
$c-card-shadow:       rgba(58, 58, 58, 0.2);
$c-input-bg:          #F7F7F7;
$c-input-border:      #D4D4D4;
$c-muted:             #666666;

// ===== Typography =====
$font-family: "Roboto", "Open Sans", sans-serif;
$font-weights: (light: 300, regular: 400, bold: 700);
$fs-base: 16px;
$lh-base: 1.5;

// ===== Layout =====
$max-width: 1300px;
$header-overlap: 5.25em;      // 内容上叠页眉
$gutters: 5.5556%;            // 页面左右留白
$col-main: 62.5005%;
$col-side: 34.375275%;
$col-gap: 3.125025%;

// ===== Breakpoints（与原主题媒体查询一致）=====
$bp-600: 37.5em;   // 600px
$bp-900: 56.25em;  // 900px
$bp-1100: 68.75em; // 1100px
```

### 3.2 构建策略（重要约束）

本机 Hugo 为 **v0.104.3 非 extended**（`hugo env` 无 extended 标记），**不支持 Hugo Pipes 编译 SCSS**。
因此采用双轨方案：

1. **源码**：`assets/scss/*.scss`（含全部变量，可配置的"真相源"）。
2. **产物**：`assets/css/main.css`（压缩版），由 `package.json` 脚本用 **dart-sass** 编译：

   ```bash
   npm install          # 安装 sass
   npm run css          # sass assets/scss/main.scss assets/css/main.css --style=compressed
   ```

3. **模板引用**：`head.html` 中 `resources.Get "css/main.css" | minify | fingerprint` → 直接可用，无需 extended。
4. **可选升级**：README 中说明——若安装 `npm i hugo-extended`（下载 extended 二进制）或升级 Hugo ≥ 0.107，可改用 Pipes 直接编译 SCSS 并启用 `hugo.IsExtended` 分支。

---

## 4. 配置参数设计（`hugo.toml` 完整示例）

```toml
baseURL      = "https://example.org/"
languageCode = "en-us"
title        = "Period Hugo Demo"
theme        = "period"
paginate     = 6
enableRobotsTXT = true

[params]
  tagline = "A modern blog about design, code, and photography."
  # ---- 布局（对应 WP customizer）----
  layout        = "right"        # right | left（侧栏位置，body 类 right-sidebar/left-sidebar）
  fullPost      = false          # 列表页显示全文（对应 full_post）
  excerptLength = 25             # 摘要字数（对应 excerpt_length）
  readMoreText  = "Continue Reading"
  displayAuthor = true           # 对应 display_post_author
  displayDate   = true           # 对应 display_post_date
  lastUpdated   = false          # 显示"最后更新"（对应 last_updated）
  scrollToTop   = false          # 返回顶部按钮（对应 scroll_to_top）
  # ---- 页眉 ----
  logo       = ""                # 可选 logo 图片路径（静态目录）
  logoSize   = 168               # 对应 logo_size
  searchBar  = true              # 显示页眉搜索（对应 search_bar）
  # ---- 社交（对应 50+ 社交图标，用到的才配置）----
  [params.social]
    twitter   = "https://twitter.com/yourhandle"
    facebook  = "https://facebook.com/yourpage"
    instagram = "https://instagram.com/yourhandle"
    youtube   = "https://youtube.com/@yourchannel"
    rss       = ""               # 留空 = 不显示
  # ---- 侧栏组件（对应 WP widgets）----
  [params.sidebar]
    [params.sidebar.about]
      heading = "About"
      text    = "Your about text here."
    recentPosts = 5              # 最近文章数（0 = 不显示）
    categories  = true
    tags        = true
    archives    = true
  # ---- 评论（对应 comments_template）----
  [params.comments]
    provider   = "giscus"        # none | giscus | utterances
    repo       = "user/repo"
    repoId     = "R_kgXXXX"
    category   = "Comments"
    categoryId = "DIC_kwXXXX"
    theme      = "light"
  # ---- 搜索（对应 search-bar.php + search.php）----
  [params.search]
    provider    = "pagefind"     # none | pagefind
    placeholder = "Search..."
  # ---- 联系表单（对应 contact 页面）----
  [params.contactForm]
    provider = "formspree"       # none | formspree | netlify
    endpoint = "https://formspree.io/f/yourformid"
  # ---- 页脚 ----
  footerText = "Period Hugo Theme, inspired by the Period WordPress Theme by Compete Themes."
  # ---- 字体 ----
  googleFonts = true             # 加载 Google Fonts Roboto
  fontFamily  = "Roboto:300,300italic,400,700"
  fontSubsets = "latin,latin-ext"

[menu]
  [[menu.main]]
    name   = "Home"
    url    = "/"
    weight = 1
  [[menu.main]]
    name   = "About"
    url    = "/about/"
    weight = 2
  [[menu.main]]
    name   = "Contact"
    url    = "/contact/"
    weight = 3

[taxonomies]
  category = "categories"
  tag      = "tags"
```

所有参数在 `README.md` 中逐条说明。

---

## 5. 内容模型与示例内容

### 5.1 Front matter 约定（`archetypes/post.md`）

```yaml
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
description: ""          # 摘要（缺省用自动摘要）
featured: ""             # 特色图路径（Page Bundle 内优先自动匹配）
categories: ["News"]
tags: ["hugo"]
draft: false
---
```

### 5.2 示例内容清单（演示用，中文/英文待确认）

| 文件 | 用途 | 演示要点 |
|---|---|---|
| `content/posts/*.md` × 7 | 文章流（分页演示需 ≥7 篇） | 特色图、分类、标签、摘要 |
| `content/about/index.md` | 页面 | 页面渲染、无 byline |
| `content/contact/index.md` | 联系页 | `{{< contact-form >}}` 短代码 |
| `content/categories/news/_index.md` | 分类归档 | 归档标题条 + 描述 |
| `content/tags/hugo/_index.md` | 标签归档 | 标签 pill |
| `content/_index.md` | 首页元数据 | — |

### 5.3 页面类型行为差异（对应 WP）

| 类型 | 特色图 | byline | 分类/标签 | 前后篇 |
|---|---|---|---|---|
| posts（文章） | ✅ 有链接(列表)/无链接(详情) | ✅ | ✅ | ✅ |
| page（页面） | ✅ | ❌ | ❌ | ❌ |
| 归档（list） | 卡片式 | ✅ | ❌ | ❌ |

---

## 6. 第三方集成设计（替代 WP 动态功能）

| 功能 | 方案 | 集成点 | 文档要点 |
|---|---|---|---|
| 评论 | **Giscus**（默认）/ Utterances | `partials/comments.html` 注入 `<script>`；参数 `params.comments.*`；`provider=none` 时完全不加载 | 需要 GitHub 仓库公开 + Discussions 开启；README 给配置向导 |
| 搜索 | **Pagefind** | 页眉放大镜按钮展开输入框；提交跳转 `{{ .Site.BaseURL }}search/`；`layouts/search.html` 挂载 Pagefind UI；构建后 `npx pagefind --site public` | README 注明部署管线中追加 Pagefind 构建步骤 |
| 联系表单 | **Formspree**（默认）/ Netlify Forms | `shortcodes/contact-form.html`；`action={{ params.contactForm.endpoint }}` + `_subject` 隐藏域；样式复用主题 `_forms.scss` | README 说明如何建表、防垃圾邮件 |

---

## 7. JavaScript 设计（零依赖，原生）

`assets/js/main.js`（约 2KB，无 jQuery，对应原主题 `production.min.js` 的 4 个功能）：

1. **移动菜单**：`#toggle-navigation` 点击 → `.menu-primary-container` 在 `max-height:0 ↔ auto` 切换，同步 `aria-expanded`。
2. **子菜单手风琴**（移动端）：`.toggle-dropdown` 点击 → 父 `li.open` 展开子 `ul`（`max-height:999px`），箭头旋转 180°。
3. **搜索展开**：`.search-icon` 点击 → 容器 `.open`，输入框 focus；Esc 关闭。
4. **返回顶部**：`scrollY > 300` 时按钮加 `.visible`（滑入），点击平滑回顶。

加载方式：`head.html` 中 `{{ $js := resources.Get "js/main.js" | minify | fingerprint }}`，`defer` 加载。

---

## 8. 响应式与无障碍

- **响应式**：严格复刻 §1.7 三个断点行为；图片 `object-fit: cover` 自适应；触屏目标 ≥ 44px（汉堡按钮 36×23 视觉 + 内边距扩大）。
- **无障碍**：
  - 跳转链接 `skip-content`（"Press Enter to skip to content"）。
  - 语义化 landmark：`header/section[role=main]/aside[role=complementary]/footer`。
  - 菜单/搜索按钮带 `aria-expanded`、`aria-label`；汉堡按钮带 `screen-reader-text`。
  - 键盘导航：菜单链接 `:focus` 与 `:hover` 同款反色态；特色图链接 focus 显示白色遮罩（`opacity:.2`）。
  - 对比度：正文 `#333` on `#FFF`（≈12.6:1）远超标；页眉白字 on `#333`（≈12.6:1）。
  - `prefers-reduced-motion: reduce` 时禁用过渡动画。

---

## 9. 验收标准（90% 相似度核对清单）

**像素级核对（对照源码数值）：**

- [ ] 6 个颜色令牌与 §1.2 逐值一致（`#EDEDED`/`#333`/`#FFF`/`#D4D4D4`/`#242424`/`#F7F7F7`）
- [ ] Roboto 300/400/700 加载，正文 16px/1.5/300
- [ ] 1300px 最大宽度、`5.5556%` 页面留白、`-5.25em` 内容上叠
- [ ] ≥900px 双栏比例 62.5005% / 34.375275%
- [ ] 页眉深色 + 白字 tagline `#D4D4D4`，社交图标在右
- [ ] 菜单 hover 白底黑字反色块
- [ ] 文章卡片白底 + `0 0 2px rgba(58,58,58,.2)` 阴影
- [ ] 特色图 2:1 + cover
- [ ] 归档标题 `#242424` pill + FA 图标
- [ ] 标签 pill `1px solid #333` hover 反色
- [ ] more-link / 分页 / 侧栏组件 / 页脚样式一致
- [ ] 三个断点行为与 §1.7 一致

**功能核对：**

- [ ] 首页按时间倒序 + 分页（≥7 篇示例触发分页）
- [ ] 详情页完整内容 + 元数据 + 前后篇
- [ ] 分类/标签归档 + 术语页
- [ ] 自定义菜单（含嵌套子菜单）
- [ ] `hugo server` 构建零报错；`hugo` 生产构建零报错
- [ ] 移动端汉堡菜单 / 搜索 / 返回顶部可用

---

## 10. 实现计划（分阶段）

| 阶段 | 内容 | 验收 |
|---|---|---|
| P0 脚手架 | `hugo.toml`、`content/`、`archetypes/`、`package.json`（sass）、`.gitignore` | `npm run css` 产出 `assets/css/main.css` |
| P1 主题骨架 | `baseof.html`/`head.html`/`site-header.html`/`footer.html`、logo/menu/social 渲染 | 页面骨架 + 深色页眉可见 |
| P2 内容页 | `index.html`/`single.html`/`list.html`/`terms.html`/`404.html` + post-card/byline/categories/tags/further-reading/pagination/sidebar | 全页面类型可用 |
| P3 SCSS 移植 | 按 §3 文件逐个移植官方 CSS（令牌驱动） | 对照 §9 颜色/字号/阴影核对 |
| P4 交互 JS | 菜单/搜索/返回顶部原生 JS | 交互验收 |
| P5 第三方 | comments(Giscus)、search(Pagefind)、contact-form(Formspree) partial | 配置示例 + README |
| P6 示例内容 | 7 篇演示文章 + about/contact + 分类/标签术语 + 特色图 | 首页分页触发 |
| P7 构建与 QA | `hugo` 构建、`hugo server` 三宽度截图、对照 §9 清单逐项勾选 | ≥90% 清单通过 |

预计交付文件：`themes/period/` 全目录（模板 ≈ 22 个 partial、12 个 SCSS、1 个 JS）、`hugo.toml`、示例内容 ≈ 10 个文件、`README.md`、`package.json`。

---

## 11. 风险与备选方案

| 风险 | 影响 | 应对 |
|---|---|---|
| 演示站 Cloudflare 拦截，无法直接抓取 | 无法逐像素对比 demo 渲染 | 以官方主题源码 v1.750 为权威（demo 即其默认渲染）；必要时用户可本地跑 demo 截图回传核对 |
| 本机 Hugo 0.104 非 extended | Pipes 无法编译 SCSS | 预编译 CSS + npm 构建脚本；README 提供 `hugo-extended` 升级路径 |
| Font Awesome 授权 | 字体随主题分发需合规 | 保留原主题内 FA Free（SIL OFL 1.1 字体 / CC BY 4.0 图标），LICENSE 中注明出处与致谢；备选：内联 SVG 图标子集 |
| Google Fonts 需联网 | 离线环境字体回退 | `params.googleFonts=false` 时回退 `system-ui` 栈；README 说明自托管方案 |
| 原主题 JS 依赖 jQuery | 性能/体积 | 用原生 JS 重写 4 个交互，无依赖 |

---

*文档状态：v1 设计稿，待确认后进入 P0 实现。*
