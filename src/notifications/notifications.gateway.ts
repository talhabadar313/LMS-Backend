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
    this.fetchMissedNotifications(client);
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected:', client.id);
    this.clients.delete(client);
  }

  private async fetchMissedNotifications(client: Socket) {
    const notifications = await this.notificationsService.findAll();
    client.emit('missedNotifications', notifications);
  }

  @SubscribeMessage('newAssignment')
  async handleNewAssignment(
    @MessageBody()
    { title, description }: { title: string; description: string },
  ) {
    const notification = await this.notificationsService.create(
      title,
      description,
    );

    this.clients.forEach((client) => {
      client.emit('assignmentNotification', {
        message: `${title}`,
        id: notification.id,
      });
    });
  }
}
