# 万铭诚物流科技网站

这是万铭诚物流科技的中文响应式企业网站，包含首页、服务、关于我们、联系我们、FAQ 及内容管理后台。

## 页面

- `index.html`：首页
- `services.html`：服务项目
- `about.html`：关于我们
- `contact.html`：联系我们
- `faq.html`：常见问题
- `admin.html`：CMS 内容管理后台

## GitHub Pages 部署

如果只需要展示前台网站，可直接上传整个项目到 GitHub，并在仓库设置中开启 GitHub Pages：

1. 进入 GitHub 仓库 `Settings`
2. 打开 `Pages`
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main` 和 `/root`
5. 保存后等待 GitHub 生成网址

GitHub Pages 会直接读取 `index.html`。

## 本地预览

可以使用任何静态服务器预览，也可以使用项目内的 Node server：

```bash
npm start
```

默认网址：

```text
http://localhost:4174/index.html
```

## CMS 后台

后台网址：

```text
http://localhost:4174/admin.html
```

后台可修改品牌资料、首页内容、服务项目、关于我们、联系资料、FAQ 和图片路径。

注意：GitHub Pages 是纯静态托管，不能执行 `server.js`，所以线上 GitHub Pages 版本无法直接保存 CMS 内容。CMS 保存功能需要在本地或支持 Node.js 的服务器运行：

```bash
npm start
```

保存后会更新：

```text
cms-data.json
```

再将更新后的 `cms-data.json` 上传或 push 到 GitHub，即可更新线上内容。

## 图片

图片素材位于：

```text
assets/
```

CMS 上传的新图片也会保存到 `assets/`。
