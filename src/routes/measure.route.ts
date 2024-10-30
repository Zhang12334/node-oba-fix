import express, { type Router } from 'express'
import type { Config } from '../config.js'
import { checkSign } from '../util.js'
import { getStorage } from '../storage/base.storage.js'

export default function MeasureRouteFactory(config: Config): Router {
  const router = express.Router()
  const storage = getStorage(config)

  router.get('/:size(\\d+)', async (req, res) => {
    const isSignValid = checkSign(req.baseUrl + req.path, config.clusterSecret, req.query as NodeJS.Dict<string>)
    if (!isSignValid) return res.sendStatus(403)

    const size = parseInt(req.params.size, 10)
    if (isNaN(size) || size > 200) return res.sendStatus(400)

    // 使用 this.storage 进行文件处理
    const filename = `${size}` // 可以根据需要自定义文件名
    const filePath = await storage.getFilePath(filename)

    // 检查文件是否存在
    if (!await storage.exists(filePath)) {
      const buffer = Buffer.alloc(1024 * 1024, '0066ccff', 'hex')
      await storage.writeFile(filePath, buffer, { size: size * 1024 * 1024 })
    }

    res.set('content-length', (size * 1024 * 1024).toString())
    res.sendFile(filePath)
  })

  return router
}
