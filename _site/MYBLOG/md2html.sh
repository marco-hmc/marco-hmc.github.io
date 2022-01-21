# 目标功能
###
 # @Author: your name
 # @Date: 2022-01-21 13:50:27
 # @LastEditTime: 2022-01-21 18:31:44
 # @LastEditors: Please set LastEditors
 # @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 # @FilePath: /MYBLOG/md2html.sh
### 
# ./md2html.sh MDFILE
# 将in.md转成 out.html
# n=`date +%Y-%m-%d`
# d=`date -d"yesterday $d" +%Y-%m-%d`
# h=`date +%H:%M:%S`  
# echo $d + $h
# targeFile=../_posts/$d'-'${1:0:-3}.html
# typora-export -g tags.txt -o $targeFile $1;
# mytitle=${1:0:-3};
# mytag=$2;
# echo -e "---\nlayout: post\ntitle: "$mytitle"\nsubtitle: "$mytag"\ndate: $d $h \nbackground: '/img/posts/01.jpg'\n---\n\n$(cat $targeFile)" > $targeFile
# echo "typora-export -g tags.txt -o $targeFile $1";

n=`date +%Y-%m-%d`
d=`date -d"yesterday $d" +%Y-%m-%d`
h=`date +%H:%M:%S`  
echo " the time that push to blog is: "$d + $h

styleFile=/home/marco/hmc/myScripts/tags.txt
echo " style file is in here: "$styleFile

targetDir=/home/marco/文档/我的坚果云/marco-hmc.github.io/_posts
targeFile=$targetDir/$d'-'${1:0:-3}.html
echo " html is generated to : "$targeFile

typora-export -g $styleFile -o $targeFile $1
echo "typora-export -g tags.txt -o $targeFile $1";

mytitle=${1:0:-3}
mytag=$2
prefix="---\nlayout: post\ntitle: "$mytitle"\nsubtitle: "$mytag"\ndate: $d $h \nbackground: '/img/posts/01.jpg'\n---\n\n$(cat $targeFile)"
echo -e $prefix > $targeFile
