import feathers from '@feathersjs/feathers';
import '@feathersjs/transport-commons';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
let counter = 0;

interface Message {
  id: number;
  text: string;
}

class MessageService {
  messages: Message[] = [];

  async find() {
    return this.messages;
  }

  async create(data: Pick<Message, 'text'>) {
    const message: Message = {
      id: counter,
      text: data.text
    };

    counter++;
    this.messages.push(message);

    return message;
  }

  async remove(id: number) {
    console.log("ID : ", id);
    console.log("DELETE Request Coming.");
    this.messages = [];
    return "Done";
  }

  async hello(req :any, res: any) {
    res.send('Hello from route handler in class');
  }
}

const app = express(feathers());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + `/public`));

app.configure(express.rest());
app.configure(socketio());

app.use('/messages', new MessageService());

// Register the route handler for /hello from the MessageService class
const messageService = new MessageService();
app.use('/hello', messageService.hello.bind(messageService));

app.use(express.errorHandler());

app.on('connection', connection =>
  app.channel('everybody').join(connection)
);

app.publish(data => app.channel('everybody'));

app.listen(3030).on('listening', () =>
  console.log('Feathers server listening on localhost:3030')
);

app.service('messages').create({
  text: 'Hello world from the server'
});