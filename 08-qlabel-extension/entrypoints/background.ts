import {browser} from 'wxt/browser';
import {genImgTaskId, getImgTaskResult} from "@/api";

export default defineBackground(() => {
  let backgroundPort: any = null;
  // 服务器处理函数
  // 生成任务
  async function processTaskId(data: any) {
    try {
      const result = await browser.storage.local.get(`processed_taskId_${data.taskId}`);
      if (result[`processed_taskId_${data.taskId}`]?.taskId) {
        return result[`processed_taskId_${data.taskId}`].taskId;
      }

      const response = await genImgTaskId({
        image_url: data.imageUrl,
        prompt: data.text,
        image_id: data.taskId,
        priority: 0,
        editor: data.user
      })

      if (!response?.data?.task_id) {
        throw new Error(`服务器响应错误: ${response.message}`);
      }
      const taskId = response.data.task_id;
      browser.storage.local.set({[`processed_taskId_${data.taskId}`]: {
          taskId: taskId,
          timestamp: Date.now(),
        }});
      return taskId;
    } catch (error) {
      console.error('生成任务失败:', error);
      throw error;
    }
  }

  async function handleMessages(message: any) {
    try {
      const taskId = await processTaskId(message.data);

      // 创建一个Promise来等待轮询结果
      const result = await new Promise((resolve, reject) => {
        startPolling(
          taskId,
          message?.data,
          (data: any) => {
            resolve(data);
          },
          (error: string) => {
            reject(error);
          }
        );
      });

      console.log("轮询结果：", result)

      backgroundPort?.postMessage({type: 'TASK_RESULT', success: true, data: result});
    } catch (error: unknown) {
      backgroundPort?.postMessage({type: 'TASK_RESULT',success: false, error: '任务处理失败'});
    }
  }

// 轮询状态
  const pollStatus = {
    activePolls: new Map(), // 存储所有活跃的轮询任务
    DEFAULT_TIMEOUT: 45 * 1000, // 45秒超时
    POLL_INTERVAL: 2 * 1000     // 1秒轮询间隔
  };

  /**
   * 开始轮询任务状态
   * @param {string} taskId - 任务ID
   * @param msgData
   * @param {function} onSuccess - 成功回调
   * @param {function} onError - 失败回调
   * @param {number} [timeout] - 可选自定义超时时间(毫秒)
   */
  function startPolling(taskId: string, msgData: any, onSuccess: Function, onError: Function, timeout: number = pollStatus.DEFAULT_TIMEOUT) {
    // 如果已有相同taskId的轮询，先清除
    if (pollStatus.activePolls.has(taskId)) {
      clearPolling(taskId);
    }

    const startTime = Date.now();

    // 创建轮询计时器
    const pollTimer = setInterval(async () => {
      try {
        // 检查是否超时
        if (Date.now() - startTime > timeout) {
          clearPolling(taskId);
          onError(new Error(`轮询超时 (${timeout}ms)`));
          return;
        }

        // 调用API查询任务状态
        const result = await getImgTaskResult(taskId);

        const data = result.data;
        if (!data || !data.status) {
          clearPolling(taskId);
          clearLocalCache(msgData.taskId)
          onError(new Error(`任务结果错误`));
          console.error(`任务结果错误: ${JSON.stringify(result)}`);
          return;
        }

        const status = data?.status
        // 根据状态处理
        switch (status) {
          case 'completed':
            clearPolling(taskId);
            console.log('[task completed]', result.data)
            onSuccess(result.data);
            break;
          case 'failed':
            clearPolling(taskId);
            clearLocalCache(msgData.taskId)
            console.error(`[task failed] ${result}`)
            onError('任务失败请重试');
            break;
          // 其他状态继续轮训
          default:
            console.log('[task pending]', result.data)
            break;
        }
      } catch (error) {
        clearPolling(taskId);
        onError(error);
      }
    }, pollStatus.POLL_INTERVAL);

    // 存储轮询任务
    pollStatus.activePolls.set(taskId, pollTimer);
  }

  /**
   * 清除指定任务的轮询
   * @param {string} taskId - 任务ID
   */
  function clearPolling(taskId: string) {
    if (pollStatus.activePolls.has(taskId)) {
      clearInterval(pollStatus.activePolls.get(taskId));
      pollStatus.activePolls.delete(taskId);
    }
  }

  // 清除本地失败任务ID的缓存
  function clearLocalCache(taskId: string) {
    browser.storage.local.remove(`processed_taskId_${taskId}`)
  }

  /**
   * 清除所有轮询任务
   */
  function clearAllPolling() {
    for (const [taskId, timer] of pollStatus.activePolls) {
      clearInterval(timer);
    }
    pollStatus.activePolls.clear();
  }

  // 监听调用使用
  browser.runtime.onMessage.addListener(async (message) => {
    // 处理来自popup的处理请求

    // 获取数据后自动处理
    if (message.type === 'DATA_READY') {
      console.log('[Popup DATA_READY]', message.data, backgroundPort?.postMessage)
      await handleMessages(message);
    }

    // 手动请求处理
    if (message.type === 'PROCESS_DATA') {
      console.log('[PROCESS_DATA]', message.data)
      await handleMessages(message);
    }

    // 保持消息端口开放
    return true;
  });

  // 插件卸载时清理所有轮询
  browser.runtime.onSuspend.addListener(() => {
    clearAllPolling();
  });

  browser.runtime.onConnect.addListener((port) => {
    if (port.name === 'POPUP_BG_CHANNEL') {
      backgroundPort = port;
    }
    port.onMessage.addListener((msg) => {
      console.log("[In background script], received message from content script:");
      console.log(msg.data);
    });

    port.onDisconnect.addListener(clearAllPolling);
  })

  // Get command ID from environment variable
  const VITE_QLABEL_COMMAND_ID = import.meta.env.VITE_QLABEL_COMMAND_ID

  // Listen for keyboard shortcut commands
  browser.commands?.onCommand.addListener((command: string) => {
    if (command === VITE_QLABEL_COMMAND_ID) {
      // Open the popup when the shortcut is pressed
      browser.action?.openPopup()
    }
  })
});
