# 万铭诚网站 CMS 使用说明

## 启动后台

在本项目目录运行：

```bash
PORT=4174 /Users/Mannmo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.js
```

然后打开：

```text
http://localhost:4174/admin.html
```

前台预览：

```text
http://localhost:4174/index.html
```

## 可管理内容

- 品牌资料：网站名称、电话、电邮、Logo、公司名称、标语
- 首页内容：首屏标题、介绍、按钮、主图、数字卖点
- 服务项目：新增、删除、修改服务标题、简介、服务要点
- 关于我们：公司介绍、优势亮点、服务覆盖说明和路线图
- 联系资料：深圳/香港地址、地图关键词、微信二维码
- FAQ：新增、删除、修改常见问题
- JSON 进阶：直接编辑完整 `cms-data.json`

## 图片上传

每个图片字段可以：

- 直接填写现有路径，例如 `assets/hero-trucks-clean.jpg`
- 选择本地图片上传，CMS 会保存到 `assets/` 并自动更新路径

## 保存机制

后台按「保存修改」会写入：

```text
cms-data.json
```

网站前台刷新后会读取最新内容。

「备份 JSON」可下载当前内容作备份。
