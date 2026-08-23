# Period Hugo Theme

参考**Period** WordPress 主题（v1.750，GPL）复刻为 Hugo 静态站点主题。
深色页眉 + 浅灰背景 + 白色卡片，内容区上叠压住页眉下沿是它的标志性视觉。配色、字体、
间距、断点均逐值移植自原版 `style.css`。

> **⚠️ 发布前替换**：本仓库统一使用占位符 `github.com/yourname/period`（`README.md`、
> `theme.toml`、`go.mod` 三处）。把主题推到自己的仓库后，请全局搜索替换为真实地址。

- **字体**：Roboto（300/400/700）
- **布局**：1300px 最大宽度、可切换左右侧栏、三档断点（600/900/1100px）
- **零依赖 JS**：菜单/搜索/返回顶部/代码复制均为原生脚本
- **内置**：Chroma 代码高亮（One Dark）、SEO 层（OG/Twitter/JSON-LD）、Pagefind 搜索、Giscus 评论、Formspree 表单

---

## 一、安装

### 方式一：复制到站点（最简单）

```bash
mkdir -p themes && git clone https://github.com/yourname/period.git themes/period
# 然后复制配置模板并启动
copy themes/period/exampleSite/config.toml config.toml   # Windows
cp themes/period/exampleSite/config.toml config.toml     # macOS/Linux
hugo server -D
```

### 方式二：Git Submodule

```bash
git submodule add https://github.com/yourname/period.git themes/period
```

### 方式三：Hugo Module（推荐给新项目）

```bash
hugo mod init github.com/yourname/my-site
# config.toml 中：
# [module]
#   [[module.imports]]
#     path = "github.com/yourname/period"
```

## 二、快速开始（自带演示站）

主题仓库内包含可独立运行的 `exampleSite/`（7 篇主题说明文章 + 完整配置）：

```bash
cd themes/period
hugo server --source exampleSite        # 打开 http://localhost:1313
hugo --source exampleSite --minify && npx pagefind --site exampleSite/public   # 生产构建+搜索
```

> `exampleSite/config.toml` 用 `themesDir = "../.."` 定位主题本体；把主题复制到你自己的
> 站点后，删掉这一行即可。

## 三、环境要求

- **Hugo extended ≥ v0.128**（推荐：内置 dart-sass，SCSS 自动编译，零 Node 依赖）；
- 普通版 Hugo 也能用（回退到预编译 CSS），但改样式需要 Node：`npm install -D sass && npm run css`；
- 搜索功能需要 Node（pagefind）。

## 四、配置

完整注释版配置见 `exampleSite/config.toml`（开箱即用的演示配置，也是所有参数的活文档），
核心参数速览：

```toml
[params]
  tagline      = "站点标语"          # 页眉
  author       = "作者名"
  layout       = "right"             # right | left 侧边栏
  fullPost     = false               # 列表页显示全文
  excerptLength = 40                 # 自动摘要字数
  readMoreText  = "阅读更多"
  searchBar    = true                # 页眉搜索
  googleFonts  = true                # Google Fonts（false = 离线）

[params.sidebar]                     # 侧栏组件开关 + 关于组件 + 友情链接
                                     # recentPosts / categories(+Limit) / tags(+Limit) / archives
                                     # links: { limit, items: [{name,url}] } → /links/ 页
[params.comments]                    # none | giscus | utterances
[params.search]                      # none | pagefind
[params.contactForm]                 # none | formspree | netlify
[params.seo]                         # OG/Twitter/JSON-LD/站长验证
[menu]                               # 主菜单（支持嵌套，weight 排序）
```

**⚠️ TOML 陷阱**：子表表头（`[params.social]` 等）之后的键都归属该子表——顶层标量键必须写在所有子表之前（示例配置已按此排列）。

## 五、内容写作

- front matter 支持：`title/date/lastmod/description/featured/slug/categories/tags/author/sticky/draft/keywords/canonicalURL/robotsNoIndex/images`
- 特色图：`featured` 指向 `static/` 图片，或 Page Bundle 自动取图；列表页 2:1 裁切（建议 ≥1200×600）
- URL 结构：`[permalinks] post = "/:sections/:slug/"`，嵌套分区需 `_index.md`
- Markdown：表格/脚注/任务列表/定义列表/原始 HTML（unsafe 已开）
- 示例文章即使用说明：见 `exampleSite/content/post/theme-*.md`

## 六、定制

- **设计令牌**：`assets/scss/_variables.scss`（颜色/字体/间距/断点全覆盖）
- **代码高亮配色**：`assets/css/chroma.css`（`hugo gen chromastyles --style=<名>` 重新生成，并同步 `markup.highlight.style`）
- **界面文案**：`i18n/zh-cn.toml`、`i18n/en.toml`（`locale` 切换语言）
- **logo/字体**：`params.logo`、`params.fontFamily`

## 七、目录结构

```text
period/
├── theme.toml            # 主题元数据（含版本号）
├── go.mod                # Hugo Module 支持
├── README.md             # 本文档
├── LICENSE.md            # GPL-2.0 + Font Awesome 授权说明
├── .gitignore            # 不入库的构建产物/缓存
├── docs/DESIGN.md        # 设计文档（视觉令牌推导、结构对照）
├── layouts/              # baseof + partials + shortcodes
│   └── partials/
│       ├── seo/          # OpenGraph / TwitterCards / JSON-LD
│       └── widgets/      # 侧栏组件
├── assets/
│   ├── scss/             # 样式源码（_variables.scss 为设计令牌）
│   └── css/              # 预编译 main.css + chroma.css
├── assets/js/            # 原生交互脚本
├── i18n/                 # 中英文案
├── static/font-awesome/  # 图标字体
└── exampleSite/          # ★ 可独立运行的演示站
```

## 八、版本与发布

- 版本号以语义化版本（SemVer）为准，记录在 `theme.toml` 的 `version` 字段；
- 每次发布打 git tag：`git tag v1.0.0 && git push --tags`；
- 行为变更 / 破坏性变更 / 新功能分别对应 `major.minor.patch` 递增。

## 九、许可与致谢

- 主题代码：**GPL v2 or later**（移植自 [Period WordPress Theme](https://www.competethemes.com/period/) by Compete Themes）
- 内置 Font Awesome 5 Free（CC BY 4.0 / SIL OFL 1.1 / MIT）
- 示例图片为占位图，发布前请替换

设计过程与视觉令牌推导见 [`docs/DESIGN.md`](docs/DESIGN.md)。
