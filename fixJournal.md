# 修复日志

> 每次成功修复或任务复盘后记录。按日期倒序排列,最新在上。

---

### 2026-08-17(周日)

#### [11:55] [修复] Docker 构建 Jekyll 验证镜像反复网络失败,最终用国内镜像源+DaoCloud 解决

- **问题(根因):** 三层网络问题叠加:① 容器内没有宿主机代理配置,直连 deb.debian.org/rubygems.org 超时;② 通过 `--build-arg` 传入 `host.docker.internal:7890` 后代理可达,但代理本身对 deb.debian.org 持续 502;③ Docker daemon 配置的网易 hub 镜像(`hub-mirror.c.163.com`)解析 `ruby:slim` 时 EOF
- **修复:** 临时 Dockerfile(不修改仓库文件)三处替换:`sed` 把 apt 源换阿里云镜像、gem 源换清华/阿里镜像、`pip install -i https://mirrors.aliyun.com/pypi/simple/`;基础镜像改从 `docker.m.daocloud.io/library/ruby:slim` 拉取后 `docker tag` 成本地 `ruby:slim`。另外容器启动时入口脚本 `bin/entry_point.sh` 无执行位,用 `bash /tmp/entry_point.sh` 覆盖 CMD 启动
- **文件:**
  - `$CLAUDE_JOB_DIR/tmp/Dockerfile.cn` — 临时构建文件,apt/gem/pip 三源换国内镜像(仓库 Dockerfile 未动)
  - `bin/entry_point.sh` — 未修改(仅运行时以 `bash` 显式执行绕过权限位)
- **验证:** `docker build` exit=0;容器启动后 `curl http://127.0.0.1:8080/` 返回 200,标题 `Marco's blog`;`bundle exec al-folio upgrade audit --no-fail` 输出 Blocking: 0
- **教训:** ① 网络受限环境下,`docker build --build-arg` 传代理是第一步,但代理本身可能对特定 CDN 不稳定,国内镜像源是更可靠的第二手;② `pkill -f "docker compose up"` 的模式匹配到了自身命令行把 shell 杀了(exit 144),pkill 模式必须避免出现在同一条命令里;③ 前台管道 `cmd | tail` 的退出码是 tail 的,判断失败要用 `${PIPESTATUS[0]}` 或落日志文件

#### [12:10] [复盘] 任务:blogs_al 切到 al-folio v1.2 并迁移 5_blogs 内容

- **初始理解:** 以为"切到 tag v1.2"需要从上游 fetch(git 仓库是空历史)。实际:本地工作树本身就是 v1.2 内容(用户中断并澄清"我当前下载得这个就是 v1.2 的,不需要 git clone 远端的"),简化为主线:本地打 tag + 内容迁移。另发现用户已自行 `git commit -m tmp` 留底(我执行留底 commit 时报 nothing to commit)
- **决策树:** ① fetch 上游 v1.2 vs 本地即 v1.2 → 用户澄清后放弃 fetch,直接打 tag;② 建 main 分支 vs detached HEAD → 建 main(对齐 origin 默认分支,保留回滚 tag);③ ImageMagick vs Pillow 压缩 gallery → Pillow(未装 convert,已装 Pillow);④ toc-custom.css 迁移 vs 丢弃 → 丢弃(旧选择器针对 bootstrap-toc,v1.2 用 tocbot 且 `_sass` 覆盖会挂 style-contract CI);⑤ resume.json 双通道:转 `_data/cv.yml`(rendercv 主)+ 保留 jsonresume 备用;⑥ Docker 验证 vs 本地装 ruby → Docker(用户主动开了 daemon),网络踩坑后靠国内镜像源解决
- **替代方案:** ① `git fetch --depth 1` 浅拉取(网络不稳被放弃);② 安装 ruby 系统包做本地验证(作为备选保留,未执行);③ slim 预构建镜像(入口路径与 v1 不兼容被放弃);④ 整文件替换 `_config.yml`(违反"合并值、保留契约键"原则被否决)
- **事后反思:** ① 第一次 `git fetch` 就超时 5 分钟,应更早检查代理环境变量并意识到 git 不读 http_proxy,而不是反复重试;② 探索阶段已发现"工作树 mtime 与 v1.2 发布相近、内容为 v1.2 时代",却仍坚持走 fetch 路径,直到用户打断才接受"本地即 v1.2"——事后看 A3 diff 核对本来就能低成本验证这一点;③ Docker 构建反复失败时没有第一时间想到国内镜像源,浪费了两轮构建
- **Skill 反馈:** 本次核心流程遵循项目内 `al-folio-v1-migration` skill(只搬 site-owned 内容、契约键不动、overrides audit)——该 skill 与文档均未提及"验证构建在国内网络环境下的镜像/代理策略",若文档有这一段可省约 40 分钟;`journal` skill 的"实时记录模式"执行不足,关键分叉(Docker 网络)未在发生当下记录,靠事后回忆补写

---

## 遗留待办

- `_data/cv.yml` 中论文标题为 `TODO-论文标题(原 resume.json 中仅有作者引用串)`,用户稍后自行填写
- 未推送 origin(部署是独立步骤,旧站 gh-pages 在线作灰度回滚窗口);推 main 后在 GitHub 仓库 Settings → Pages 选 GitHub Actions 部署
- 上游 remote 已配置但 tag 未 fetch 成功(网络),以后网络恢复可 `git fetch upstream --tags` 建立对象级关联
