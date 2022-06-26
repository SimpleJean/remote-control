import Jimp from 'jimp';
import { httpServer } from './src/http_server/index.js';
import robot from 'robotjs';
import { WebSocketServer } from 'ws';
import fs from 'fs';

const HTTP_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log(`Connected to client`);
  ws.on('message', function incoming(data) {
    const [command, px1] = data.toString().split(' ');

    let px = parseInt(px1);
    const mouse = robot.getMousePos();
    //Move up
    if (command === 'mouse_up') {
      robot.moveMouse(mouse.x, mouse.y - px);
      console.log(`${command}: x ${mouse.x} px, y ${mouse.y} px`);
      ws.send(`${command}`);
      //Position of mouse
    } else if (command === 'mouse_position') {
      console.log(`${command}: x ${mouse.x} px, y ${mouse.y} px`);
      ws.send(`${command} ${mouse.x},${mouse.y}`);
      //Move down
    } else if (command === 'mouse_down') {
      robot.moveMouse(mouse.x, mouse.y + px);
      console.log(`${command}: x ${mouse.x} px, y ${mouse.y} px`);
      ws.send(`${command}`);
      //Move left
    } else if (command === 'mouse_left') {
      robot.moveMouse(mouse.x - px, mouse.y);
      console.log(`${command}: x ${mouse.x} px, y ${mouse.y} px`);
      ws.send(`${command}`);
      //Move right
    } else if (command === 'mouse_right') {
      robot.moveMouse(mouse.x + px, mouse.y);
      console.log(`${command}: x ${mouse.x} px, y ${mouse.y} px`);
      ws.send(`${command}`);
      //Drawing circle
    } else if (command === 'draw_circle') {
      const circles = [{ x: `${mouse.x}`, y: `${mouse.y}`, radius: px }];
      const drawCircle = (radius) => {
        const mousePos = robot.getMousePos();

        for (let i = 0; i <= Math.PI * 2; i += 0.01) {
          // Convert polar coordinates to cartesian
          const x = mousePos.x + radius * Math.cos(i);
          const y = mousePos.y + radius * Math.sin(i);
          robot.dragMouse(x, y);
        }
      };
      console.log(`${command}: x ${mouse.x} px, y ${mouse.y} px`);

      circles.forEach((circle) => {
        robot.moveMouse(circle.x, circle.y);
        robot.mouseToggle('down');

        drawCircle(circle.radius);

        robot.mouseToggle('up');
      });
      ws.send(`${command}`);
      //Drawing square
    } else if (command === 'draw_square') {
      const squares = [px];

      squares.forEach((square) => {
        robot.moveMouse(mouse.x, mouse.y);
        robot.mouseToggle('down');

        robot.moveMouseSmooth(mouse.x + square, mouse.y);
        robot.moveMouseSmooth(mouse.x + square, mouse.y + square);
        robot.moveMouseSmooth(mouse.x, mouse.y + square);
        robot.moveMouseSmooth(mouse.x, mouse.y);

        robot.mouseToggle('up');
      });

      ws.send(`${command}`);
      //Draw rectangle
    } else if (command === 'draw_rectangle') {
      const [command, px1, px2] = data.toString().split(' ');
      const px = parseInt(px1);
      const px3 = parseInt(px2);
      const rectangles = [
        { x: `${mouse.x}`, y: `${mouse.y}`, width: px, height: px3 },
      ];
      const drawRectangle = (width, height) => {
        const mousePos = robot.getMousePos();

        robot.moveMouse(mousePos.x, mousePos.y);
        robot.mouseToggle('down');

        robot.moveMouseSmooth(mousePos.x + width, mousePos.y);
        robot.moveMouseSmooth(mousePos.x + width, mousePos.y + height);
        robot.moveMouseSmooth(mousePos.x, mousePos.y + height);
        robot.moveMouseSmooth(mousePos.x, mousePos.y);

        robot.mouseToggle('up');
      };
      console.log(`${command}: x ${mouse.x} px, y ${mouse.y} px`);

      rectangles.forEach((rectangle) => {
        robot.moveMouse(rectangle.x, rectangle.y);
        robot.mouseToggle('down');

        drawRectangle(rectangle.width, rectangle.height);

        robot.mouseToggle('up');
      });

      ws.send(`${command}`);
      //Take screenshot
    } else if (command === 'prnt_scrn') {
      const image = robot.screen.capture(mouse.x, mouse.y, 100, 100);
      const img = new Jimp(image.width, image.height, (err, image) => {
        if (err) {
          console.error(err);
        }
        image.bitmap.data.set(image.bitmap.data);
        image.write('screenshot.png');
        const base64 = img.getBase64Async(img.getMIME());
        const data = base64.then((base64) => {
          ws.send(`${command} ${base64}`);
        })
      });
    }
    //console.log(data.toString().split(' '));
  });

  ws.on('close', () => {
    console.log(`Disconnected from client`);
  });
});
