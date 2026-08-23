---
title: "主题定制：设计令牌与样式"
slug: "theme-customize"
date: 2024-11-15
description: "SCSS 设计令牌全量说明与修改方法：配色、字号、间距、断点；换 logo、切换字体、改界面文案。"
featured: "images/covers/theme-customize.svg"
categories: ["设计"]
tags: ["主题", "定制", "scss"]
author: "Period"
---

所有视觉属性都收敛在 `themes/period/assets/scss/_variables.scss` 这一个文件里——改颜色、
字号、间距、断点不需要碰任何规则文件。

## 设计令牌全量说明

```scss
// ---- Colors（对应设计文档 §1.2）----
$c-page:              #EDEDED;   // 页面背景
$c-text:              #333333;   // 正文 / 链接 / 标题
$c-text-hover:        #757575;   // 正文链接悬停
$c-header:            #333333;   // 页眉 / 页脚背景
$c-header-text:       #FFFFFF;   // 页眉 / 菜单文字
$c-header-text-hover: #D4D4D4;   // tagline、页眉链接悬停
$c-credit:            #242424;   // credit 条 / 归档标题 / 菜单选中态
$c-card:              #FFFFFF;   // 卡片背景
$c-card-shadow:       rgba(58,58,58,0.2);
$c-input-bg:          #F7F7F7;   // 输入框 / 代码背景
$c-input-border:      #D4D4D4;   // 输入框描边
$c-muted:             #666666;   // 次要文字

// ---- Typography ----
$font-family: "Roboto", "Open Sans", sans-serif;
$font-light: 300;  $font-regular: 400;  $font-bold: 700;
$fs-base: 16px;
$lh-base: 1.5;

// ---- Layout ----
$max-width:      1300px;         // 页面最大宽度
$header-overlap: 5.25em;         // 内容上叠压头高度（签名特征）
$page-gutter:    5.5556%;        // 页面左右留白
$col-main: 62.5005%;  $col-side: 34.375275%;  $col-gap: 3.125025%;

// ---- Breakpoints（对应原主题媒体查询）----
$bp-600:  37.5em;   // 600px
$bp-900:  56.25em;  // 900px
$bp-1100: 68.75em;  // 1100px
```

### 示例：改成墨绿页眉

```scss
$c-header: #1F3A34;
```

保存即生效：**extended Hugo 用 Pipes 自动编译**（`hugo server` 下改完刷新即可）；
普通版 Hugo 用户需 `npm run css` 重新编译预编译 CSS。

### 示例：加宽页面

```scss
$max-width: 1440px;
```

### 示例：调整断点

```scss
$bp-900: 62.5em;   // 双栏从 1000px 才开始
```

## 样式文件结构

```text
assets/scss/
├── main.scss          # 入口，按序引入
├── _variables.scss    # ★ 设计令牌（改这里）
├── _mixins.scss       # 断点/阴影/过渡混合
├── _base.scss         # 基础样式、代码块
├── _layout.scss       # 网格、内容上叠
├── _header.scss       # 页眉、社交图标、搜索
├── _nav.scss          # 菜单（移动手风琴 + 桌面下拉）
├── _cards.scss        # 文章卡片、特色图、归档标题
├── _single.scss       # 详情页、归档页
├── _sidebar.scss      # 侧栏组件（含关于组件）
├── _pagination.scss   # 分页
├── _footer.scss       # 页脚、返回顶部
├── _forms.scss        # 表单
└── _utilities.scss    # 无障碍辅助类
```

## 改 logo 与字体

```toml
[params]
  logo      = "images/my-logo.png"        # static/ 下路径；留空用文字标题
  logoSize  = 168                         # logo 宽度 px
  googleFonts = true
  fontFamily  = "Noto Sans SC:300,400,700"   # 换成任意 Google Fonts
  fontSubsets = "latin,latin-ext"
```

## 界面文案（i18n）

- 中文文案：`themes/period/i18n/zh-cn.toml`；英文：`en.toml`；
- 切换语言：改 `config.toml` 的 `locale`（旧版 Hugo 用 `languageCode`）；
- 新增文案键：在两个文件同步加同键条目。

## 代码块配色

代码高亮配色在 `themes/period/assets/css/chroma.css`（Chroma 生成物），换风格方法见
[代码高亮与 Markdown 进阶排版](/post/theme-code/)。

## 定制原则

1. **优先改参数**（config.toml）而非模板：菜单、侧栏、社交、评论、搜索、表单都有开关；
2. **视觉改令牌**（_variables.scss）而非规则：颜色、字号、断点全覆盖；
3. 需要改结构时才动 `layouts/`：partials 已按职责拆分，单点修改互不影响。
