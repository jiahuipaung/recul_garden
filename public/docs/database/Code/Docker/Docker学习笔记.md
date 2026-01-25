# docker架构理解

- Docker 使用 C/S （客户端/服务器）体系的架构。
    
- Docker 客户端（命令行`CLI`接口）与 Docker 守护进程通信（Dockerd） 通过REST API Server进行交互
    
- Docker **守护进程**负责构建，运行和分发 Docker 容器。监听 Docker API 的请求和管理 Docker 对象
    
- Docker 客户端和守护进程可以在同一个系统上运行，也可以将 Docker 客户端连接到远程 Docker 守护进程
    
- Docker Registry：用来存储 Docker 镜像的仓库，使用 docker pull 或者 docker run 命令时，就会从我们配置的 Docker 镜像仓库中去拉取镜像，使用 docker push 命令时，会将我们构建的镜像推送到对应的镜像仓库中。
    
- Images：镜像，镜像是一个只读模板，带有创建 Docker 容器的说明，一般来说的，镜像会基于另外的一些基础镜像并加上一些额外的自定义功能。比如，你可以构建一个基于 Centos 的镜像，然后在这个基础镜像上面安装一个 Nginx 服务器，这样就可以构成一个属于我们自己的镜像了。
    
- Containers：容器，容器是一个镜像的可运行的实例，可以使用 Docker REST API 或者 CLI 来操作容器，容器的实质是进程，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的[命名空间](https://en.wikipedia.org/wiki/Linux_namespaces)。因此容器可以拥有自己的 **root 文件系统、自己的网络配置、自己的进程空间，甚至自己的用户 ID 空间**。容器内的进程是运行在一个隔离的环境里，使用起来，就好像是在一个独立于宿主的系统下操作一样。这种特性使得容器封装的应用比直接在宿主运行更加安全。
    
- 底层技术支持：Namespaces（做隔离）、CGroups（做资源限制）、UnionFS（镜像和容器的分层） the-underlying-technology Docker 底层架构分析
    

  

# 镜像和容器的操作

## 获取镜像

```Shell
docker pull [选项] [Docker Registry 地址[:端口]/]仓库名[:标签]
```

- Docker 镜像仓库地址：地址的格式一般是 <域名/IP>[:端口号]，默认地址是 Docker Hub。
    
- 仓库名：这里的仓库名是两段式名称，即 <用户名>/<软件名>。对于 Docker Hub，如果不给出用户名，则默认为 library，也就是官方镜像。
    

## 运行

```Shell
docker run -it --rm \
    ubuntu:16.04 \
    /bin/bash
```

- -it：这是两个参数，一个是 -i：交互式操作，一个是 -t 终端。我们这里打算进入 bash 执行一些命令并查看返回结果，因此我们需要交互式终端。
    
- --rm：这个参数是说容器退出后随之将其删除。默认情况下，为了排障需求，退出的容器并不会立即删除，除非手动 docker rm。我们这里只是随便执行个命令，看看结果，不需要排障和保留结果，因此使用`--rm`可以避免浪费空间。
    
- ubuntu:16.04：这是指用 ubuntu:16.04 镜像为基础来启动容器。
    
- bash：放在镜像名后的是命令，这里我们希望有个交互式 Shell，因此用的是 bash
    

当利用`docker run`来创建容器时，Docker 在后台运行的标准操作包括：

- 检查本地是否存在指定的镜像，不存在就从公有仓库下载
    
- 利用镜像创建并启动一个容器
    
- 分配一个文件系统，并在只读的镜像层外面挂载一层可读写层
    
- 从宿主主机配置的网桥接口中桥接一个虚拟接口到容器中去
    
- 从地址池配置一个 ip 地址给容器
    
- 执行用户指定的应用程序
    
- 执行完毕后容器被终止
    

## 列出镜像

```Shell
docker image ls
```

## 启动已终止容器

利用`docker container start`命令，直接将一个已经终止的容器启动运行

## 后台运行

更多的时候，需要让 Docker 在后台运行而不是直接把执行命令的结果输出在当前宿主机下。此时，可以通过添加`-d`参数来实现。

使用`-d`参数启动后会返回一个唯一的 id，也可以通过`docker container ls`命令来查看容器信息。

> 容器是否会长久运行，是和 docker run 指定的命令有关，和 -d 参数无关。

## 终止容器

使用`docker container stop`来终止一个运行中的容器；此外，当 Docker 容器中指定的应用终结时，容器也自动终止。

## 进入容器

在使用`-d`参数时，容器启动后会进入后台。某些时候需要进入容器进行操作：**exec 命令 -i -t 参数**

```Shell
$ docker run -dit ubuntu:16.04
69d137adef7a8a689cbcb059e94da5489d3cddd240ff675c640c8d96e84fe1f6

$ docker container ls
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
69d137adef7a        ubuntu:16.04       "/bin/bash"         18 seconds ago      Up 17 seconds                           zealous_swirles

$ docker exec -i 69d1 bash
ls
bin
boot
dev
...

$ docker exec -it 69d1 bash
root@69d137adef7a:/#
```

## 删除容器

使用`docker container rm`来删除一个处于终止状态的容器

用下面的命令可以清理掉所有处于终止状态的容器。

```Plain
$ docker container prune
```

或者

```Plain
$ docker ps -aq
```

## 删除本地镜像

```Shell
$ docker image rm [选项] <镜像1> [<镜像2> ...]

$ docker rmi 镜像名   //或者用 ID、镜像名、摘要删除镜像
```

## docker commit定制镜像

# docker三驾马车