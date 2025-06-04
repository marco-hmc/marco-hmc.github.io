FROM ruby:slim

# 彻底替换所有源为国内镜像
RUN rm -rf /etc/apt/sources.list.d/* && \
    echo "deb http://mirrors.ustc.edu.cn/debian bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    echo "deb http://mirrors.ustc.edu.cn/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.ustc.edu.cn/debian bookworm-backports main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.ustc.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list

# uncomment these if you are having this issue with the build:
# /usr/local/bundle/gems/jekyll-4.3.4/lib/jekyll/site.rb:509:in `initialize': Permission denied @ rb_sysopen - /srv/jekyll/.jekyll-cache/.gitignore (Errno::EACCES)
# ARG GROUPID=901
# ARG GROUPNAME=ruby
# ARG USERID=901
# ARG USERNAME=jekyll

ENV DEBIAN_FRONTEND noninteractive

LABEL authors="Amir Pourmand,George Araújo" \
      description="Docker image for al-folio academic template" \
      maintainer="Amir Pourmand"

# uncomment these if you are having this issue with the build:
# /usr/local/bundle/gems/jekyll-4.3.4/lib/jekyll/site.rb:509:in `initialize': Permission denied @ rb_sysopen - /srv/jekyll/.jekyll-cache/.gitignore (Errno::EACCES)
# add a non-root user to the image with a specific group and user id to avoid permission issues
# RUN groupadd -r $GROUPNAME -g $GROUPID && \
#     useradd -u $USERID -m -g $GROUPNAME $USERNAME

# 将多个 RUN 命令合并为一个，减少层数，加速构建
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git \
        imagemagick \
        inotify-tools \
        locales \
        nodejs \
        procps \
        python3-pip \
        zlib1g-dev && \
    pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ && \
    pip --no-cache-dir install --upgrade --break-system-packages nbconvert && \
    # 清理在同一层中完成
    apt-get clean && \
    apt-get autoremove && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* && \
    # 设置区域语言
    sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen

# set environment variables
ENV EXECJS_RUNTIME=Node \
    JEKYLL_ENV=production \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

# create a directory for the jekyll site
RUN mkdir /srv/jekyll

# 使用 COPY 代替 ADD（推荐做法）
COPY Gemfile.lock Gemfile /srv/jekyll/

# set the working directory
WORKDIR /srv/jekyll

# 使用可靠的 RubyGems 镜像源
RUN gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/ && \
    gem install --no-document jekyll bundler && \
    bundle config mirror.https://rubygems.org https://gems.ruby-china.com && \
    bundle install --no-cache || \
    (gem sources --clear-all && \
     gem sources --add https://rubygems.org/ && \
     bundle install --no-cache)

EXPOSE 8080

COPY bin/entry_point.sh /tmp/entry_point.sh

# uncomment this if you are having this issue with the build:
# /usr/local/bundle/gems/jekyll-4.3.4/lib/jekyll/site.rb:509:in `initialize': Permission denied @ rb_sysopen - /srv/jekyll/.jekyll-cache/.gitignore (Errno::EACCES)
# set the ownership of the jekyll site directory to the non-root user
# USER $USERNAME

CMD ["/tmp/entry_point.sh"]
