import Jimp from 'jimp';
import { httpServer } from './src/http_server/index.js';
import robot from 'robotjs';
import { WebSocketServer } from 'ws';

const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log(`Connected to client`);
  ws.on('message', function incoming(data) {
    const [command, px] = data.toString().split(' ');
    //console.log(px);
    //Move up
    if (command === 'mouse_up') {
      const mouse = robot.getMousePos();
      robot.moveMouse(mouse.x, mouse.y - px);

      ws.send(`${command},${mouse.x},${mouse.y - px}`);
      //position of mouse
    } else if (command === 'mouse_position') {
      const mouse = robot.getMousePos();

      ws.send(`${command} ${mouse.x},${mouse.y}`);
      //Move down
    } else if (command === 'mouse_down') {
      const mouse = robot.getMousePos();
      robot.moveMouse(mouse.x, mouse.y + px);

      ws.send(`${command} ${mouse.x},${mouse.y}`);
      //Move left
    } else if (command === 'mouse_left') {
      const mouse = robot.getMousePos();
      robot.moveMouse(mouse.x - px, mouse.y);

      ws.send(`${command} ${mouse.x},${mouse.y}`);
      //Move right
    } else if (command === 'mouse_right') {
      const mouse = robot.getMousePos();
      robot.moveMouse(mouse.x + px, mouse.y);

      ws.send(`${command} ${mouse.x},${mouse.y}`);
    }

    console.log(data.toString());
  });

  ws.on('close', () => {
    console.log(`Disconnected from client`);
  });
});
