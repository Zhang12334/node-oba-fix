import express, { type Router } from 'express';
import { join } from 'path';
import { Buffer } from 'buffer'; // 引入 Buffer
import type { Config } from '../config.js';
import { checkSign } from '../util.js';
import { getStorage } from '../storage/base.storage.js';
import { logger } from '../logger.js'

export default function MeasureRouteFactory(config: Config): Router {
  const router = express.Router();
  const storage = getStorage(config);

  router.get('/:size(\\d+)', async (req, res) => {
    const isSignValid = checkSign(req.baseUrl + req.path, config.clusterSecret, req.query as NodeJS.Dict<string>);
    if (!isSignValid) return res.sendStatus(403);

    const size = parseInt(req.params.size, 10);
    if (isNaN(size) || size > 200) return res.sendStatus(400);

    const filename = `${size}`; // 文件名直接为1-200
    const filePath = join('/measure', filename); // 结合路径

    // 检查文件是否存在
    const fileExists = await storage.exists(filePath);
    if (!fileExists) {
      // 随机生成内容
      const buffer = Buffer.alloc(size * 1024 * 1024, '0066ccff', 'hex');
      await storage.writeFile(filePath, buffer, {
        path: filePath,
        hash: filename, // 可以根据需要自定义 hash
        size: size * 1024 * 1024,
        mtime: Date.now(),
      });
      logger.info(`已生成测速文件: ${filePath}`);
    }

    res.set('content-length', (size * 1024 * 1024).toString());
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`发送文件失败: ${filePath}`, err);
        res.status(500).end(); // 确保使用默认状态码
      }
    });
  });

  return router;
}
