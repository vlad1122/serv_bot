const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Токены ботов из переменных окружения
const userBotToken = process.env.USER_BOT_TOKEN;
const adminBotToken = process.env.ADMIN_BOT_TOKEN;

// Настройка для Express
app.use(bodyParser.json());

// Вебхук для получения сообщений от пользователей через первого бота
app.post('/webhook', (req, res) => {
  const message = req.body.message;
  const userChatId = message.chat.id;
  const text = message.text;

  console.log(`Получено сообщение от пользователя: ${text}`);

  // Пересылаем сообщение администратору через второй бот
  fetch(`https://api.telegram.org/bot${adminBotToken}/sendMessage?chat_id=${process.env.ADMIN_CHAT_ID}&text=${encodeURIComponent(`Сообщение от пользователя: ${text}`)}`)
    .then(response => response.json())
    .then(data => {
      console.log('Сообщение отправлено администратору: ', data);
    })
    .catch(error => {
      console.error('Ошибка отправки сообщения администратору:', error);
    });

  res.status(200).send('OK');
});

// Настройка webhook для первого бота
app.get('/setWebhook', (req, res) => {
  const webhookUrl = process.env.WEBHOOK_URL;
  fetch(`https://api.telegram.org/bot${userBotToken}/setWebhook?url=${webhookUrl}`)
    .then(response => response.json())
    .then(data => {
      res.send(data);
    })
    .catch(error => {
      res.send({ error: 'Ошибка настройки webhook' });
    });
});

// Обработка запроса от администратора через второй бот
app.post('/admin-reply', (req, res) => {
  const { message, chatId } = req.body;  // Сообщение и ID чата для ответа пользователю
  fetch(`https://api.telegram.org/bot${adminBotToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    .then(response => response.json())
    .then(data => {
      res.send('Сообщение отправлено пользователю');
    })
    .catch(error => {
      res.status(500).send('Ошибка отправки сообщения');
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
