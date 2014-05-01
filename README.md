# fotky

Просмотр галерей (фотоальбомов)
[fotki.yandex.ru](http://fotki.yandex.ru/)'s и/или
[picasaweb.google.com](https://picasaweb.google.com)
на любом сайте. Использует только Javascript и JSONP для доступа к API
вышеизложенных сайтов.

## Встраивание

``` html
<head>
  <link rel='STYLESHEET' type='text/css' href='fotky.css'>
  <script src='fotky.js'></script>
</head>
<body>
...
<div id='fotky'>
  <div class='info'>
    Пожалуйста, подождите загрузки данных
  </div>
  <script type='text/fotky'>
    stanislav-ukolov@y 422729 * 322233322
  </script>
</div>
...
</body>
```

1. Подключить [fotky.js](/fotky.js)
1. Подключить [fotky.css](/text/fotky.css)
1. Создать `<div>` с id=`fotky`
1. Добавить в этот `<div>` тэг `<script>` со списком альбомов
1. Открыть страницу в браузере!

## Указание альбомов

Список отображаемых альбомов берётся из тега `<script>` внутри основного `<div>`.
Чтобы браузер не попытался самостоятельно исполнить этот текст, рекомендуется задать
какой-нибудь type, как показано выше.

Внутри тега `<script>` указывается один или несколько пользователей и для каждого - один или несколько
номеров альбомов.

