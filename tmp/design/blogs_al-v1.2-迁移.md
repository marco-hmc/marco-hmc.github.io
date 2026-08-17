# blogs_al 切到 v1.2 + 迁移 5_blogs 内容(已审批方案,2026-08-17)

用户决策:48 篇旧博文不迁移;gallery 压缩后迁移;resume.json → `_data/cv.yml`;双 remote。

## Phase A — Git 切换

1. 留底 snapshot commit(master 分支),**用户目录不进入 commit**(保持 untracked):`git reset -q .agents .claude .codex .gemini readme_preview lighthouse_results`
2. `git remote add upstream https://github.com/alshedivat/al-folio.git` + `git remote add origin git@github.com:marco-hmc/marco-hmc.github.io.git`
3. `git fetch upstream --tags`(tag v1.2 = commit b95d6d61)
4. 核对:`git diff --stat master v1.2` + 关键文件 diff(_config.yml/Gemfile/Gemfile.lock/package.json)
5. `git checkout -b main v1.2`(建分支,不 detached;`_books/_teachings` 在 tag 内自动保留)
6. `git tag pre-migration-snapshot master`(永久回滚点)

## Phase B — 内容迁移

- **B1 _config.yml 合并**(以 v1.2 为基座只覆盖用户值):title/first_name/last_name/contact_note/description/footer_text/keywords/lang=cn/icon=mc_logo.ico/url/baseurl 置空/rss_icon=false/blog_name/blog_description/display_tags/display_categories;**middle_name 清空**(否则显示 Marco R. Huang)。契约键(theme/plugins/al_folio.*/third_party_libraries/jekyll_get_json 块)一律不动
- **B2 _pages**:cp 用户版 about/blog/projects;cv.md 以 v1.2 为基座改造(cv_format: rendercv);404 任意;删除 8 个演示页(about_einstein/books/dropdown/news/plugins/profiles/repositories/publications)
- **B3 collections 清理**:删 33 演示帖、9 演示项目、3 news、papers.bib;保留 _books/_teachings
- **B4 _projects**:cp 4 个 handbook-*
- **B5 _data**:socials.yml 只改 email+github_username;repositories.yml 清空模板值
- **B6 assets**:cp avatar.jpg、mc_logo.ico;1-12.jpg 与模板 md5 一致跳过;resume.json 替换为用户版;**toc-custom.css 不迁移**(tocbot 时代失效,_sass 会挂 CI)
- **B7 gallery**:Pillow 脚本压缩(thumbnail 2000x2000、quality 82、optimize、progressive、exif_transpose),产物先落 /tmp 校验(68 个、~25-40MB)再搬入

## Phase C — CV 转换(resume.json → _data/cv.yml)

- 以 v1.2 模板 `_data/cv.yml`(RenderCV 格式)为骨架手写:basics→cv.name/label/email/summary;education→sections.Education;work→sections.Experience;publications→sections.Publications(**论文 title 缺失,json 里只有引用串,需问用户**);skills→sections.Skills(keywords join 成字符串)
- 删除模板 sections(Volunteer/Awards 等);yaml.safe_load 校验
- resume.json 原件保留在 assets/json(替换演示版),cv_format: jsonresume 备用

## Phase D — 验证

```bash
bundle install && npm ci
npm run lint:prettier
npm run lint:style-contract        # 七路径未出现
bundle exec jekyll build --baseurl /al-folio   # 官方契约构建
bundle exec al-folio upgrade audit --no-fail
bundle exec al-folio upgrade overrides audit
bundle exec jekyll serve           # baseurl 已空 → http://localhost:4000/ 逐页检查
```

- readme_preview/、lighthouse_results/ 加入 .gitignore 不提交
- 收尾:`git commit` → `git branch -d master`(回滚点=tag pre-migration-snapshot)→ 不推送(部署是独立步骤,旧站 gh-pages 在线作灰度回滚)

## 风险缓解

- master snapshot + tag 双保险,`git checkout master` 一键恢复;用户目录全程 untracked 不被分支切换影响
- gallery 源在 5_blogs 不动,产物先落 /tmp 校验
- 契约键只改列出的用户键,lint:style-contract + upgrade audit 把关
