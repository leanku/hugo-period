# Period Hugo Theme — 示例站

本分支是 [hugo-period](https://github.com/leanku/hugo-period) 主题的**独立示例站**
（参照 PaperMod 的 `exampleSite` 分支做法），部署在
https://leanku.github.io/hugo-period/ 。

主题通过 git submodule 引入（`themes/period/`），由主仓库 `master` 分支维护。

## 本地运行

```bash
git clone --branch exampleSite https://github.com/leanku/hugo-period.git
cd hugo-period
git submodule update --init --recursive   # 拉取主题 submodule
hugo server -D                            # http://localhost:1313
```

## 构建与搜索

```bash
hugo --minify
npx pagefind --site public
```

## 部署

主仓库的 `.github/workflows/deploy-demo.yml` 会检出本分支、拉取 submodule 并部署到
GitHub Pages；本分支自身不包含 workflow，避免重复部署。
