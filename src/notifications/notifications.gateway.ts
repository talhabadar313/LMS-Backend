import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NotificationsService } from './notification.service';
import { NotificationType } from '../util/enum';

@WebSocketGateway(3002, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private clients: Set<Socket> = new Set();

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    console.log('New User Connected:', client.id);
    this.clients.add(client);
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected:', client.id);
    this.clients.delete(client);
  }

  @SubscribeMessage('joinBatch')
  async handleJoinBatch(
    client: Socket,
    { batchId, studentId }: { batchId: string; studentId: string },
  ) {
    console.log(
      `Client ${client.id} joined batch ${batchId} having studentId ${studentId}`,
    );
    client.data.batchId = batchId;
    client.data.studentId = studentId;

    await this.fetchMissedNotifications(client, batchId);
  }

  private async fetchMissedNotifications(client: Socket, batchId: string) {
    const studentId = client.data.studentId;

    const notifications =
      await this.notificationsService.findByBatchAndStudentId(
        batchId,
        studentId,
      );
    const filteredNotifications = notifications.filter(
      (notification) =>
        notification.student?.user_id === studentId ||
        notification.student === null,
    );
    client.emit('missedNotifications', filteredNotifications);
  }

  @SubscribeMessage('newNotification')
  async handleNewAssignment(
    @MessageBody()
    {
      title,
      description,
      type,
      batchId,
      studentId,
    }: {
      title: string;
      description: string;
      type: NotificationType;
      batchId?: string;
      studentId?: string;
    },
  ) {
    const notification = await this.notificationsService.create(
      title,
      description,
      type,
      batchId,
      studentId,
    );

    if (studentId) {
      const studentSocket = [...this.clients].find(
        (client) => client.data.studentId === studentId,
      );
      if (studentSocket) {
        studentSocket.emit('Notification', {
          message: title,
          id: notification.id,
          type,
        });
        console.log(`Notification sent to student client ${studentSocket.id}`);
      }
    } else {
      this.clients.forEach((client) => {
        if (client.data.batchId === batchId) {
          client.emit('Notification', {
            message: title,
            id: notification.id,
            type,
          });
          console.log(`Notification sent to client ${client.id}`);
        }
      });
    }
  }
}
