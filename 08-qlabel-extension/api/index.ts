const Base_URL = import.meta.env.VITE_API_URL

export interface BaseResp<T> {
  code: number;
  data: T;
  message: string;
}

export interface GenImgTaskIdParams {
  image_url: string; // 需要处理的图片URL
  prompt: string; // 用于修改图片的提示词、指令
  image_id?: string; // 可选的图片ID，不提供则自动生成
  priority?: number; // 任务优先级，值越小优先级越高 (例如：`0` 最高)
  editor?: string; // 编辑用户
}

/**
 * 生成图片任务ID
 * @param data
 * @returns 任务ID
 * @description
 * - 生成图片处理任务，返回任务ID，用于后续获取图片处理结果
 *
 * @example
 * ```ts
 * const taskId = await genImgTaskId({
 *         "image_url": "http://example.com/images/source.jpg",
 *         "prompt": "将背景改为赛博朋克风格",
 *         "keep_size": true,
 *         "priority": 10,
 *         "editor": "user123"
 *     })
 */
export const genImgTaskId = async (data: GenImgTaskIdParams): Promise<BaseResp<{task_id: string}>> => {
  const resp = await fetch(`${Base_URL}/ps_tasks/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return resp.json()
}

export interface GenImgResultParams {
  task_id: string; // 任务ID
}

export interface GenImgResultItem {
  image_id: string; // 图片ID
  status: 'pending' | 'processing' | 'completed' | 'failed'; // 任务状态
  result_url?: string; // 处理后的图片URL，任务完成后返回
  error_message?: string; // 任务失败时的错误信息
}

/**
 * 获取图片处理结果
 * @param task_id
 * @returns GenImgResultItem
 * @description
 * - 根据任务ID获取图片处理的状态和结果
 *
 * @example
 * ```ts
 * const result = await getImgResult({ task_id: 'task123' })
 *  if (result.data.status === 'completed') {
 *    console.log('处理后的图片URL:', result.data.result_url);
 *  }
 * ```
 */
export const getImgTaskResult = async (task_id: string): Promise<BaseResp<GenImgResultItem>> => {
  const resp = await fetch(`${Base_URL}/ps_tasks/result/${task_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return resp.json()
}