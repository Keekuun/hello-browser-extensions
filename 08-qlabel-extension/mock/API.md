
# PS 任务 API 文档

本文档描述了用于提交和查询图像处理任务的 API 接口。

## 1. 通用响应结构

所有 API 接口的响应都遵循以下 JSON 结构：

### 成功响应

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    // 具体的业务数据
  }
}
```

### 失败响应

```json
{
  "code": 500, // 或其他错误码，如 400, 404 等
  "msg": "错误消息",
  "data": {}
}
```

## 2. 提交任务

### 2.1. /ps_tasks/submit

用于提交一个新的图像处理任务。

*   **HTTP 方法:** `POST`
*   **URL:** `/ps_tasks/submit`
*   **请求体 (JSON):**

    | 参数名              | 类型    | 是否必填 | 默认值 | 描述                                       |
    | :------------------ | :------ | :------- | :----- | :----------------------------------------- |
    | `image_url`         | `string` | 是       | `无`   | 需要处理的图片URL或本地路径                  |
    | `prompt`            | `string` | 是       | `无`   | 用于修改图片的提示词                       |
    | `image_id`          | `string` | 否       | `自动生成` | 可选的图片ID，不提供则自动生成             |
    | `priority`          | `integer` | 否       | `无`   | 任务优先级，值越小优先级越高 (例如：`0` 最高) |
    | `editor`            | `string` | 否       | `无`   | 编辑用户，用于追踪任务来源                   |

*   **请求示例:**

    ```json
    {
        "image_url": "http://example.com/images/source.jpg",
        "prompt": "将背景改为赛博朋克风格",
        "keep_size": true,
        "priority": 10,
        "editor": "user123"
    }
    ```

*   **响应 (成功):**

    *   **状态码:** `200 OK`
    *   **数据结构:** `data` 字段包含 `task_id`。

    ```json
    {
      "code": 200,
      "msg": "success",
      "data": {
        "task_id": "a1b2c3d4e5f6g7h8i9j0"
      }
    }
    ```

*   **响应 (失败):**

    *   参照通用失败响应结构。

## 3. 查询任务结果

### 3.1. /ps_tasks/result/{task_id}

用于查询指定任务的当前状态和结果。

*   **HTTP 方法:** `GET`
*   **URL:** `/ps_tasks/result/{task_id}`
*   **URL 参数:**

    | 参数名     | 类型    | 描述         |
    | :--------- | :------ | :----------- |
    | `task_id` | `string` | 要查询的任务ID |

*   **响应中的 `status` 可能值:**
    *   `pending`: 任务等待中
    *   `ai_submitted`: 提交任务到AI
    *   `processing`: 任务正在处理中
    *   `completed`: 任务已完成
    *   `failed`: 任务失败

*   **响应 (成功):**

    *   **状态码:** `200 OK`
    *   **数据结构:** `data` 字段根据任务状态不同而不同。

    **当任务未完成 (`status` != `completed`) 时:**

    ```json
    {
      "code": 200,
      "msg": "success",
      "data": {
        "status": "PROCESSING",
        "error_message": "" // 如果有错误（如FAILED状态），将包含错误信息
      }
    }
    ```

    **当任务完成 (`status` == `completed`) 时:**

    ```json
    {
      "code": 200,
      "msg": "success",
      "data": {
        "status": "completed",
        "image_url": "http://example.com/images/generated_image_final.jpg",
        "image_rid": "unique_resource_id_for_final_image"
      }
    }
    ```
    *   `image_url`: 完成后的图片URL。
    *   `image_rid`: 图像资源的唯一标识符（可选）。

*   **响应 (失败):**

    *   参照通用失败响应结构。例如，`task_id` 不存在时可能返回 404 或 500。

