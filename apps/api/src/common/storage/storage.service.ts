import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name)
  private client: Minio.Client
  private defaultBucket: string

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost')
    const port = this.configService.get<number>('MINIO_PORT', 9000)
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin')
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin')
    this.defaultBucket = this.configService.get<string>('MINIO_BUCKET', 'team-share')

    try {
      this.client = new Minio.Client({
        endPoint: endpoint,
        port,
        useSSL: false,
        accessKey,
        secretKey,
      })

      // Ensure default buckets exist
      await this.ensureBucket(this.defaultBucket)
      await this.ensureBucket(`${this.defaultBucket}-avatars`)
      await this.ensureBucket(`${this.defaultBucket}-templates`)

      this.logger.log(`MinIO 连接成功 (${endpoint}:${port})`)
    } catch (error) {
      this.logger.warn(`MinIO 连接失败，文件存储功能将不可用: ${(error as Error).message}`)
    }
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    if (!this.client) return
    try {
      const exists = await this.client.bucketExists(bucketName)
      if (!exists) {
        await this.client.makeBucket(bucketName)
        this.logger.log(`Bucket "${bucketName}" 已创建`)
      }
    } catch (error) {
      this.logger.warn(`Bucket "${bucketName}" 检查失败: ${(error as Error).message}`)
    }
  }

  isReady(): boolean {
    return !!this.client
  }

  async uploadFile(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    metadata?: Record<string, string>,
  ): Promise<string> {
    if (!this.client) throw new Error('MinIO 服务不可用')
    const b = bucket || this.defaultBucket
    await this.ensureBucket(b)
    await this.client.putObject(b, objectName, buffer, buffer.length, metadata)
    return objectName
  }

  async getFile(bucket: string, objectName: string): Promise<Buffer> {
    if (!this.client) throw new Error('MinIO 服务不可用')
    const dataStream = await this.client.getObject(bucket || this.defaultBucket, objectName)
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      dataStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      dataStream.on('end', () => resolve(Buffer.concat(chunks)))
      dataStream.on('error', reject)
    })
  }

  async getPresignedUrl(
    bucket: string,
    objectName: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    if (!this.client) throw new Error('MinIO 服务不可用')
    return this.client.presignedGetObject(bucket || this.defaultBucket, objectName, expirySeconds)
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    if (!this.client) throw new Error('MinIO 服务不可用')
    await this.client.removeObject(bucket || this.defaultBucket, objectName)
  }

  async deleteFiles(bucket: string, objectNames: string[]): Promise<void> {
    if (!this.client) throw new Error('MinIO 服务不可用')
    await this.client.removeObjects(bucket || this.defaultBucket, objectNames)
  }

  async listFiles(bucket: string, prefix?: string): Promise<Minio.BucketItem[]> {
    if (!this.client) throw new Error('MinIO 服务不可用')
    const stream = this.client.listObjects(bucket || this.defaultBucket, prefix, true)
    return new Promise((resolve, reject) => {
      const items: Minio.BucketItem[] = []
      stream.on('data', (item: Minio.BucketItem) => items.push(item))
      stream.on('end', () => resolve(items))
      stream.on('error', reject)
    })
  }

  async fileExists(bucket: string, objectName: string): Promise<boolean> {
    if (!this.client) return false
    try {
      await this.client.statObject(bucket || this.defaultBucket, objectName)
      return true
    } catch {
      return false
    }
  }

  getDefaultBucket(): string {
    return this.defaultBucket
  }
}
