import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name)

  @WebSocketServer()
  server: Server

  // Map userId -> Set<socketId>
  private userSockets = new Map<string, Set<string>>()

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client)
      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token)
      const userId = payload.sub

      client.data.userId = userId
      client.join(`user:${userId}`)

      // Track user sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set())
      }
      this.userSockets.get(userId)!.add(client.id)

      this.logger.log(`用户 ${userId} 已连接通知 WebSocket (${client.id})`)
    } catch (error) {
      this.logger.warn(`WebSocket 认证失败: ${(error as Error).message}`)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (userId) {
      const sockets = this.userSockets.get(userId)
      if (sockets) {
        sockets.delete(client.id)
        if (sockets.size === 0) {
          this.userSockets.delete(userId)
        }
      }
      this.logger.log(`用户 ${userId} WebSocket 已断开 (${client.id})`)
    }
  }

  /**
   * Send a notification to a specific user
   */
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification)
  }

  /**
   * Notify that a notification was read
   */
  sendReadStatus(userId: string, notificationId: string) {
    this.server.to(`user:${userId}`).emit('notification:read', { id: notificationId })
  }

  /**
   * Check if a user is connected
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
  }

  /**
   * Get online user count
   */
  getOnlineCount(): number {
    return this.userSockets.size
  }

  private extractToken(client: Socket): string | null {
    // Try query param first, then headers
    const token =
      (client.handshake.query.token as string) ||
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '')

    return token || null
  }
}
