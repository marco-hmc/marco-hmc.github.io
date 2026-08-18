# 修复日志

> 每次成功修复或任务复盘后记录。按日期倒序排列，最新在上。

---

### 2026-08-17（周一）

#### [17:05] [修复] Docker 镜像拉取失败：USTC 加速器 blob 缓存损坏，绕道代理直连 Docker Hub 拉取

- **问题（根因）：** `docker compose pull` 报 `failed size validation: 7985 != 7662`。真实根因不是网络不通，而是 Docker Desktop 配置的 USTC 镜像加速器上 `amirpourmand/al-folio:latest` 的一个 blob 缓存损坏——上游正在频繁推送新 tag，每次拉取 manifest 引用的层大小都在变（7662→7634→7660），USTC 同步始终滞后，返回新旧混合数据；且每次重试拿到的大小都不一样（7985/7957/7983），确认是缓存端问题。其余公共加速器（DaoCloud、1Panel、ketches）403/502，1ms.run 超时，全部不可用。
- **修复：** 发现 WSL 内 curl 走 7890 代理直连 Docker Hub 可达，但 Docker Desktop 的 daemon（Windows 侧 VM）不走该代理。编写 `tmp/pull_image.py`：经代理从 Docker Hub 拉 manifest + config + 15 层，组装 docker load 格式 tar（380.8MB），`docker load` 导入。脚本迭代了三次修复：
  1. 代理剥离 `Range` 请求头（206 响应但 `Content-Range` 从 0 开始），导致 append 错乱、文件越写越大——改为校验 `Content-Range` 起始位置，不符即重写
  2. Docker Hub 匿名 token 5 分钟过期，过期后 401 死循环重试 430+ 次——加 token 自动刷新
  3. 代理对 open-ended Range（`bytes=N-`）只返回 1-1.5MB 就 EOF——改为显式 4MB 分块（`bytes=N-(N+4MB)`），收多少算多少，短块继续
- **文件：**
  - `tmp/pull_image.py` — 新建临时工具：断点续传 + token 刷新 + 4MB 显式分块的镜像拉取脚本（临时产物，不入库）
  - `tmp/pull.log` — 下载日志（临时产物）
- **验证：** 15 层全部 sha256 校验通过；`docker load -i tmp/al-folio.tar` 成功输出 `Loaded image: amirpourmand/al-folio:latest`；`docker compose up -d` 容器启动、Jekyll 开始构建。事后 USTC 恢复，`docker compose pull` 直接成功，印证缓存问题已自然消失。
- **教训：** ① 排查 Docker pull 失败先看 daemon 网络路径与 curl 网络路径是否一致——本例 daemon 在 Windows VM 直连加速器，而 WSL 的 curl 走代理，两者网络环境完全不同；② 代理会静默篡改 Range 请求，断点续传必须校验 `Content-Range` 起始位置；③ 公共 Docker 加速器（2026-08 时点）基本全部关闭匿名拉取，`docker load` + 代理直连是可靠的兜底方案。

#### [17:10] [修复] `bin/entry_point.sh` 缺少可执行位导致容器启动失败

- **问题（根因）：** `docker compose up` 报 `exec: "/srv/jekyll/bin/entry_point.sh": permission denied`。文件在工作区和 git index 中均为 `100644`（无 +x 位），bind-mount 进容器后 OCI runtime 直接拒绝执行——不是内容问题，是 mode 问题。
- **修复：** `chmod +x bin/entry_point.sh`（git 中 mode 100644 → 100755，下次 commit 随变更提交）
- **文件：**
  - `bin/entry_point.sh` — 加可执行位
- **验证：** chmod 后 `docker compose up -d` 容器成功启动，Jekyll 开始构建（日志正常输出 Imagemagick 转换）
- **教训：** 被容器/compose 直接 exec 的脚本必须带 +x 位；从旧仓库迁移文件时 mode 位容易丢失，迁移后应检查 `git ls-files -s` 的 mode 是否为 100755。
