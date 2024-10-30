import express, { type Router } from 'express';
import type { Config } from '../config.js';
import { checkSign } from '../util.js';
import type { IStorage } from '../storage/base.storage.js';
import { join } from 'path';
import axios, { AxiosError } from 'axios'; // 导入 AxiosError
import { logger } from '../logger.js';

async function getRedirectUrl(this: { storage: IStorage }, filename: string, size: number): Promise<string> {
  const basePath = process.env.CLUSTER_MEASURE_302PATH;
  const redirectUrl = `${basePath}/measure/${filename}`;
  
  // 检查文件是否存在
  const fileExists = await this.storage.exists(join('measure', filename));
  
  if (!fileExists) {
    const content = Buffer.alloc(size * 1024 * 1024, '0066ccff', 'hex'); // 生成指定大小的随机内容
    await this.storage.writeFile(join('measure', filename), content, { // 确保路径正确
      path: join('measure', filename),
      hash: '',
      size: size * 1024 * 1024,
      mtime: Date.now(),
    });
    logger.info(`已生成测速文件: ${size}MB`);
  }

  try {
    const response = await axios.get(redirectUrl, { maxRedirects: 0 });
    // axios 抛出错误时，捕获 302
    if (response.status === 302) {
      const newRedirectUrl = response.headers['location']; // 获取重定向的 URL
      return newRedirectUrl; // 返回重定向的新地址
    }
    return response.request.res.responseUrl; // 获取最终重定向的地址
  } catch (error) {
    // 当出现 302 错误时，axios会抛出一个AxiosError
    const axiosError = error as AxiosError; // 使用 AxiosError
    if (axiosError.isAxiosError && axiosError.response?.status === 302) {
      const newRedirectUrl = axiosError.response.headers['location'];
      return newRedirectUrl; // 返回重定向的新地址
    }
    logger.error(axiosError, '获取measure文件重定向地址失败');
    throw axiosError;
  }
}

export default function MeasureRouteFactory(config: Config, storage: IStorage): Router {
  const router = express.Router();

  router.get('/:size(\\d+)', async (req, res) => {
    const isSignValid = checkSign(req.baseUrl + req.path, config.clusterSecret, req.query as NodeJS.Dict<string>);
    if (!isSignValid) return res.sendStatus(403);
    
    const size = parseInt(req.params.size, 10); // 获取文件大小
    const filename = `${size}MB`; // 这里假设 filename 是以大小命名的

    try {
      const newUrl = await getRedirectUrl.call({ storage }, filename, size);
      // 返回302重定向
      res.redirect(newUrl);
    } catch (error) {
      res.status(500).send('获取重定向地址失败');
    }
  });

  return router;
}
