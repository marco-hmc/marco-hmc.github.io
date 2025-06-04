#!/bin/bash

# 启用 BuildKit 并限制网络使用 host 网络进行构建
DOCKER_CLI_EXPERIMENTAL=enabled DOCKER_BUILDKIT=1 docker build --network=host -t jekyll .
