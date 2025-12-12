# Git Submodule 和 Subtree 使用指南

本指南将详细介绍如何使用 Git 的 submodule 或 subtree 功能，将 `10-xhs-download` 目录作为独立的 Git 仓库进行管理。

## 一、Git Submodule 方法

Submodule 是 Git 提供的一种将外部仓库作为子目录嵌入到当前仓库的方法，保持相对独立。

### 1. 创建独立仓库

首先，在 GitHub 上创建一个新的仓库（例如 `xhs-download`），用于存放 `10-xhs-download` 目录的内容。

### 2. 初始化 10-xhs-download 目录

```bash
# 进入 10-xhs-download 目录
cd 10-xhs-download

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 添加远程仓库（替换为你创建的仓库地址）
git remote add origin https://github.com/your-username/xhs-download.git

# 推送代码到远程仓库
git push -u origin main
```

### 3. 在主仓库中添加子模块

```bash
# 返回主仓库目录
cd ..

# 删除原有的 10-xhs-download 目录（确保已备份或已推送到新仓库）
rm -rf 10-xhs-download

# 添加子模块
git submodule add https://github.com/your-username/xhs-download.git 10-xhs-download

# 提交更改
git add .
git commit -m "Add 10-xhs-download as submodule"

# 推送更改到主仓库
git push
```

### 4. 克隆包含子模块的仓库

```bash
git clone https://github.com/your-username/hello-browser-extensions.git

# 初始化并更新子模块
git submodule update --init --recursive
```

### 5. 子模块的日常维护

```bash
# 进入子模块目录
cd 10-xhs-download

# 进行正常的 Git 操作
git add .
git commit -m "Update submodule"
git push

# 返回主仓库并提交子模块的更新
git add 10-xhs-download
git commit -m "Update submodule reference"
git push
```

## 二、Git Subtree 方法

Subtree 是一种将外部仓库的内容合并到当前仓库的一个子目录中的方法，更加集成。

### 1. 创建独立仓库

与 Submodule 方法的步骤 1 和 2 相同，创建独立的 `xhs-download` 仓库并推送代码。

### 2. 在主仓库中添加 subtree

```bash
# 确保已删除原有的 10-xhs-download 目录
rm -rf 10-xhs-download

# 添加 subtree
git subtree add --prefix=10-xhs-download https://github.com/your-username/xhs-download.git main --squash

# 推送更改到主仓库
git push
```

### 3. 从 subtree 仓库拉取更新

```bash
git subtree pull --prefix=10-xhs-download https://github.com/your-username/xhs-download.git main --squash
```

### 4. 向 subtree 仓库推送更新

```bash
git subtree push --prefix=10-xhs-download https://github.com/your-username/xhs-download.git main
```

## 三、两种方法的比较

| 特性 | Submodule | Subtree |
|------|-----------|---------|
| **独立性** | 完全独立的仓库 | 内容合并到主仓库 |
| **克隆方式** | 需要额外初始化子模块 | 普通克隆即可 |
| **推送更新** | 需要分别推送子模块和主仓库 | 可以一次性推送 |
| **复杂性** | 较高，需要了解子模块的特殊操作 | 较低，使用普通 Git 命令 |
| **历史记录** | 子模块历史独立 | 可以选择是否保留子仓库历史 |

## 四、注意事项

1. 使用 Submodule 时，克隆仓库后需要额外执行 `git submodule update --init --recursive` 命令。
2. 使用 Subtree 时，建议使用 `--squash` 参数来减少主仓库的历史记录复杂性。
3. 无论使用哪种方法，都需要在 GitHub 上创建独立的仓库来存放 `10-xhs-download` 目录的内容。
4. 在团队协作中，需要确保所有成员都了解所使用的方法及其操作流程。

## 五、恢复到原状态（如果需要）

如果在使用过程中遇到问题，可以按照以下步骤恢复到原状态：

```bash
# 删除子模块相关文件（仅 Submodule 方法）
rm -rf .git/modules/10-xhs-download
rm .gitmodules

# 删除 10-xhs-download 目录
rm -rf 10-xhs-download

# 重新添加 10-xhs-download 目录的内容
git add .
git commit -m "Restore 10-xhs-download directory"
git push
```

## 六、实际操作记录

### 使用 Submodule 管理 10-xhs-download 的实际操作

#### 1. 准备工作
- 已在 GitHub 上创建了独立的 `xhs-download` 仓库
- 原 `10-xhs-download` 目录的内容已推送到新仓库

#### 2. 在主仓库中添加子模块

```bash
# 查看当前 Git 状态
git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        deleted:    10-xhs-download/.github/workflows/release.yml
        deleted:    10-xhs-download/.github/workflows/submit.yml
        deleted:    10-xhs-download/.gitignore
        # ... 其他被删除的文件 ...

# 提交删除操作
git commit -am "Remove 10-xhs-download directory"
[main 2d3d8cd] Remove 10-xhs-download directory
 18 files changed, 7803 deletions(-)
 delete mode 100644 10-xhs-download/.github/workflows/release.yml
 delete mode 100644 10-xhs-download/.github/workflows/submit.yml
 delete mode 100644 10-xhs-download/.gitignore
 # ... 其他删除的文件 ...

# 添加子模块
git submodule add https://github.com/Keekuun/xhs-download.git 10-xhs-download
Cloning into 'D:/code/github/hello-browser-extensions/10-xhs-download'...
remote: Enumerating objects: 23, done.
remote: Counting objects: 100% (23/23), done.
remote: Compressing objects: 100% (21/21), done.
remote: Total 23 (delta 1), reused 23 (delta 1), pack-reused 0 (from 0)
Receiving objects: 100% (23/23), 1.03 MiB | 1.12 MiB/s, done.
Resolving deltas: 100% (1/1), done.

# 查看 Git 状态确认子模块已添加
git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

#### 3. 子模块配置文件

子模块添加后，自动创建了 `.gitmodules` 文件，内容如下：

```ini
[submodule "10-xhs-download"]
	path = 10-xhs-download
	url = https://github.com/Keekuun/xhs-download.git
```

#### 4. 确认子模块已正确添加

- 目录结构中 `10-xhs-download` 已恢复，但现在作为子模块管理
- 使用 `git submodule status` 可以查看子模块状态

```bash
git submodule status
5f909c49bcd823965058ec2562c80a9ddac98880 10-xhs-download (heads/main)
```

### 注意事项

1. 成功将 `10-xhs-download` 目录转换为子模块管理
2. 子模块指向独立的 GitHub 仓库 `https://github.com/Keekuun/xhs-download.git`
3. 主仓库现在只存储子模块的引用，实际代码存储在独立仓库中
4. 后续对子模块的修改需要在子模块目录内进行 Git 操作，并在主仓库中提交子模块引用的更新
