###
 # @Author: your name
 # @Date: 2022-01-21 17:23:25
 # @LastEditTime: 2022-01-21 17:33:07
 # @LastEditors: Please set LastEditors
 # @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 # @FilePath: /marco-hmc.github.io/MYBLOG/test.sh
### 

h=`date +%H:%M:%S`
n=`date +%Y-%m-%d`
d=`date -d"yesterday $d" +%Y-%m-%d`
echo $n + $h
echo $d