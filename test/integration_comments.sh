#!/usr/bin/env bash
set -euo pipefail

tmp_dir="$(mktemp -d)"
tmp_override="${tmp_dir}/comments-test-override.yml"
tmp_site="${tmp_dir}/site"

# The posts under test are starter example content that a real site deletes;
# copy them into _posts only for the duration of this build.
fixture_posts=(
  2015-10-20-disqus-comments.md
  2022-12-10-giscus-comments.md
)
setup_fixtures() {
  mkdir -p _posts
  for name in "${fixture_posts[@]}"; do
    if [ -e "_posts/${name}" ]; then
      echo "refusing to overwrite existing _posts/${name}" >&2
      exit 1
    fi
    cp "test/fixtures/posts/${name}" "_posts/${name}"
  done
}
cleanup() {
  for name in "${fixture_posts[@]}"; do
    rm -f "_posts/${name}"
  done
  rmdir _posts 2>/dev/null || true
  rm -rf "${tmp_dir}"
}
trap cleanup EXIT
setup_fixtures

cat >"${tmp_override}" <<'YAML'
giscus:
  repo: alshedivat/al-folio
  repo_id: R_kgDOExample
  category: Comments
  category_id: DIC_kwDOExample
YAML

bundle exec jekyll build --config "_config.yml,${tmp_override}" -d "${tmp_site}" >/dev/null

giscus_page="${tmp_site}/blog/2022/giscus-comments/index.html"
disqus_page="${tmp_site}/blog/2015/disqus-comments/index.html"

grep -q 'https://giscus.app/client.js' "${giscus_page}"
if grep -q 'giscus comments misconfigured' "${giscus_page}"; then
  echo "unexpected giscus misconfiguration warning in ${giscus_page}" >&2
  exit 1
fi

grep -q 'id="disqus_thread"' "${disqus_page}"
grep -q '.disqus.com/embed.js' "${disqus_page}"

echo "comments integration checks passed"
