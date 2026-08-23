---
title: "SEO 优化与部署上线"
slug: "theme-seo"
date: 2024-10-05
description: "主题内置的 SEO 能力逐一说明（robots/OG/Twitter Cards/JSON-LD/验证 meta），以及 Netlify、Vercel、GitHub Pages 的部署与上线检查清单。"
featured: "images/covers/theme-seo.svg"
categories: ["技术"]
tags: ["hugo", "seo", "部署"]
author: "Period"
---

## 内置 SEO 层（移植自 PaperMod 思路）

全部由 Hugo 模板实现，零插件：

| 能力 | 说明 |
|---|---|
| robots 索引控制 | 生产构建 `index, follow`；`hugo server` 输出 `noindex, nofollow`；单篇 `robotsNoIndex: true` 屏蔽 |
| robots.txt | 主题自带模板：生产放行 + 指向 sitemap；开发环境 `Disallow: /` |
| 结构化数据 | 首页 `Organization`（含 sameAs 社交链接）、全站 `BreadcrumbList`、文章 `BlogPosting`（headline/全文/作者/publisher） |
| 分享卡片 | Open Graph（og:image 自动取 featured/封面/正文首图）与 Twitter Cards（summary_large_image） |
| 元数据 | `keywords`（回退 tags）、`author`、`canonical`（支持 `canonicalURL` 覆盖）、四种站长验证 meta |
| 性能 | CSS 指纹 + preload + SRI、favicon 家族 + theme-color |

关键开关：

```toml
[params.seo]
  enableOpenGraph    = true
  enableTwitterCards = true
  enableSchema       = true
  alwaysInclude      = false    # true = 开发环境也输出 OG/JSON-LD（调试用）
  [params.seo.verification]
    google = ""   # Google Search Console 验证码
    bing   = ""
    yandex = ""
    naver  = ""
```

> 默认仅在**生产环境**输出 OG/Twitter/JSON-LD，避免开发环境污染索引。
> 验证 meta 在 Google/Bing/Yandex/Naver 站长后台"添加站点"时获得，粘贴即生效。

## 部署

### Netlify（推荐）

```toml
# netlify.toml
[build]
  command = "hugo --minify && npx pagefind --site public"
  publish = "public"
```

### Vercel

Framework Preset 选 Hugo，构建命令同上，输出目录 `public`。

### GitHub Pages（Actions）

```yaml
# .github/workflows/hugo.yml（要点）
- uses: peaceiris/actions-hugo@v2
  with: { hugo-version: '0.165.0', extended: true }
- run: hugo --minify && npx pagefind --site public
- uses: peaceiris/actions-gh-pages@v3
  with: { github_token: ${{ secrets.GITHUB_TOKEN }}, publish_dir: ./public }
```

## 上线前检查清单

- [ ] `config.toml` 的 `baseURL` 改为正式域名（Pagefind 索引依赖）
- [ ] `params.seo.verification` 填入各搜索引擎验证码
- [ ] `params.social` 配置社交链接（供 sameAs 与 twitter:site 使用）
- [ ] `params.comments` 配置评论（如需）；替换示例图片；删除 `draft: true`
- [ ] 本地 `hugo --minify && npx pagefind --site public` 构建无报错
- [ ] 部署后访问 `/robots.txt`、`/sitemap.xml` 确认存在且指向正确域名

## 验证工具

- [Google Rich Results Test](https://search.google.com/test/rich-results) —— 检查 JSON-LD 与分享卡片；
- [PageSpeed Insights](https://pagespeed.web.dev/) —— Core Web Vitals；
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) —— og:image 预览；
- `curl https://你的域名/robots.txt` —— 确认索引放行与 sitemap 指向。
