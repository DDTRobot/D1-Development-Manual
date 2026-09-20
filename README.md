

<p align="center"><strong>D1开发手册（Ubuntu）</strong></p>
<p align="center"><a href="https://github.com/DDTRobot/diablo_sdk_v2/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-orange"/></a>
<img alt="language" src="https://img.shields.io/badge/language-c++-red"/>
<img alt="platform" src="https://img.shields.io/badge/platform-linux-l"/>
</p>


---

![tita](./_static/tital.jpg)

## Installation 安装

| Installation method | Supported platform[s] |                       Development Docs                       |
| :-----------------: | :-------------------: | :----------------------------------------------------------: |
|       Source        |  Ubuntu , ros-humble   | [D1 开发文档源文件](index.md) |

## 本地预览

文档使用 Sphinx、MyST 与 Furo。固定依赖见 `docs/requirements.txt`，建议使用 Python 3.11。

中文搜索依赖 `jieba` 分词，已包含在上述依赖文件中；仅设置 `html_search_language = 'zh'` 不会自动安装分词库。调整搜索语言或分词依赖后，请在构建命令中同时使用 `-E -a`，从源文件重新生成搜索索引。

已安装 `uv` 时，在仓库根目录运行：

```bash
uv run --python 3.11 --with-requirements docs/requirements.txt sphinx-build -a -b html -n -W --keep-going . build/html
uv run --python 3.11 python -m http.server 8765 --bind 127.0.0.1 --directory build/html
```

浏览器打开 `http://127.0.0.1:8765`。修改内容后重新执行构建命令，再刷新页面。`-a` 会重新生成所有页面，确保导航或标题调整在全站同步，不留下旧侧栏。

预览服务器只展示生成的 HTML，不会自动编译 Markdown。编辑提示框时，`{admonition}` 后必须填写标题；不需要自定义标题时，使用 `{note}`、`{tip}` 或 `{warning}`。构建报错时先修正文档语法，避免提示框内容丢失。

也可在 Python 3.11 虚拟环境中运行 `python -m pip install -r docs/requirements.txt`，然后执行 `sphinx-build -a -b html -n -W --keep-going . build/html`。

### 按 Read the Docs 版本路径预览

需要检查部署路径下的页面、资源和站内跳转时，可单独生成一份完整构建，不覆盖日常预览：

```bash
uv run --isolated --python 3.11 --with-requirements docs/requirements.txt sphinx-build -E -a -b html -n -W --keep-going . build/rtd-preview/zh-cn/latest
uv run --python 3.11 python -m http.server 8766 --bind 127.0.0.1 --directory build/rtd-preview
```

打开 `http://127.0.0.1:8766/zh-cn/latest/`。修改源码后重新执行第一条命令，再刷新浏览器。输出位于已忽略的 `build/` 中，无需提交。

这仍是本地构建：使用与 Read the Docs 配置一致的 Python 主次版本、主要依赖及 `conf.py`，但不复现云端操作系统或平台注入的版本菜单等组件。`/zh-cn/latest/` 仅用于测试语言与版本前缀，真实地址以项目后台为准。真实云端效果需要推送后查看对应构建的站点。

## 发布到 Read the Docs

本站继续使用 Sphinx 生成静态 HTML，不需要额外部署 Node.js 或应用服务器。Read the Docs 使用仓库根目录的 `.readthedocs.yaml`，安装 `docs/requirements.txt` 中的依赖，并读取 `conf.py`，使用 Furo 和本仓库的定制样式构建网站。

发布时需要把文档、配置及新增的 `_templates/`、`_static/` 文件一起提交并推送到 Read the Docs 当前构建的分支，再在项目后台触发一次构建。不要遗漏新增的 CSS、JavaScript 和 WebP 图片；无需提交 `build/` 目录。

首页布局、深浅色切换、搜索、代码复制、图片放大和响应式导航均随静态站点发布。站内链接和资源采用相对路径，可用于 Read the Docs 的语言与版本路径，例如 `/zh-cn/latest/`。

配置已启用 `fail_on_warning`：构建出现警告时不会发布该次结果，应先根据构建日志修复问题。本地验证不能代替云端构建，发布后还需检查 Read the Docs 实际页面。

## 文档结构

- `pages/Quick_Start.md`：ROS 2 连接与只读验证。
- `pages/ROS2_Reference.md`：ROS 2 接口与控制示例。
- `pages/SDK_Development.md`：底层 C++ / CAN FD SDK。
- `pages/Control_Tuning.md`：策略与参数调优。
- `_templates/home.html`、`_static/styles/docs.css`：首页与站点样式。
- `_static/scripts/docs.js`：目录定位、移动端导航、搜索快捷键与图片放大。

首页按产品概览、开发入口、常用文档与辅助入口分组，具体内容在 `_templates/home.html` 中维护。首页宽度与响应式布局独立于正文页面，更新时间集中显示在页脚；修改后需重新构建预览。

左侧导航从文档标题生成，最多展示页面、二级标题、三级标题三层。当前页面默认展开，其余页面默认收起；点击文字跳转，点击箭头展开或收起，也可用 Tab 聚焦箭头、空格键切换。直接访问章节链接时会展开对应层级并高亮章节，移动端点击目录文字后自动关闭抽屉。页内章节已整合到左侧，不再重复显示右侧目录。导航由 `conf.py` 的 `configure_navigation` 配置，沿用 Furo 的原生折叠控件。

品牌导航固定为黑色，正文保留浅色、深色及跟随系统模式。桌面端的收起箭头在悬停或键盘聚焦时出现，当前页面与已展开项保持可见；触屏和高对比度模式始终显示箭头。配色与交互样式集中在 `_static/styles/docs.css`，无需额外前端依赖。

本地构建不会连接机器人，也不会执行手册中的实机控制命令。



