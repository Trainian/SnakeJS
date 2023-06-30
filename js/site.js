'use strict';

var SIZE_X = 20;
var SIZE_Y = 20;
var MAXFOOD = 3;
var STARTGAME = 1;
var PAUSEGAME = 2;
var RESUMEGAME = 3;
var LOSEGAME = 4;
var GAMESPEED1 = 600;
var GAMESPEED2 = 400;
var GAMESPEED3 = 200;

var game;
var currentSpeed = GAMESPEED1;
var points = 0;
var snake = [];
var moveTo = 'Up';
var food = [];

function init(){
    createGamePanel();
    createSnake();
    drawSnake();
    createFood();
}

//#region Инициализация
// Создание таблицы
function createGamePanel()
{
    var game = document.querySelector('.game');
    var table = document.createElement('table');
    table.classList.add('game-table');

    for(var i = 0; i < SIZE_X; i++)
    {
        var row = document.createElement('tr');
        row.classList.add('row-' + i);
        for(var j = 0; j < SIZE_Y; j++)
        {
            var col = document.createElement('td');
            col.classList.add('col-'+ j + '-' + i);
            row.appendChild(col);
        }
        table.appendChild(row);
    }

    game.appendChild(table);
}
// Создание змейки
function createSnake(){
    // Позиция головы
    var X = Math.round(SIZE_X / 2);
    var Y = Math.round(SIZE_Y / 2);
    var headPosition = {X, Y};

    // Позиция тела
    Y += 1;
    var bodyPosition = {X, Y};

    snake.push(headPosition, bodyPosition);
}
// Создание еды
function createFood(){
    for(var i = 0; i < MAXFOOD; i++)
        addFood();
}
//#endregion

//#region Логика
// Старт
function startGame(){
    game = setInterval(updateGame, GAMESPEED1);
    changeBtnStartTo(PAUSEGAME);
}
// Перезапустить
function restartGame(){
    if(game != null)
        clearInterval(game);
    clearMove();
    removeAllFood();
    snake = [];
    food = [];
    points = 0;
    moveTo = 'Up';
    createSnake();
    drawSnake();
    createFood();
    changeBtnStartTo(STARTGAME);
}
// Пауза
function pauseGame(){
    clearInterval(game);
    changeBtnStartTo(RESUMEGAME);
}
// Проигрыш
function loseGame(){
    clearInterval(game);
    changeBtnStartTo(LOSEGAME);
    alert("Вы проиграли!\nКол-во собранной еды: " + points);
}
// Обновление змейки
function updateGame(){
    var newPosition = getNextSnakePosition();
    if(checkHit(newPosition))
        loseGame();
    else
    {
        clearMove();
        var isEat = checkEat(newPosition);
        moveSnake(newPosition, isEat);
        drawSnake();
        updateGameSpeed();
    }
}
// Изминение скорости игры, при необходимых условиях сбора пищи
function updateGameSpeed(){
    if(points == 5)
        changeGameSpeed(GAMESPEED2);
    else if(points == 15)
        changeGameSpeed(GAMESPEED3);
}
//#endregion

//#region Вспомогательные функции
// Рисуем змейку
function drawSnake(){
    for (var i = 0; i < snake.length; i++)
    {
        var pos = document.querySelector('.col-' + snake[i].X + '-' + snake[i].Y);
        if(i == 0)
            pos.classList.add('snakeHead');
        else
            pos.classList.add('snakeBody');
    }
}
// Возвращает новую позицию змейки
function getNextSnakePosition(){
    var X = snake[0].X;
    var Y = snake[0].Y;
    switch(moveTo)
    {
        case 'Up':
            Y -= 1;
            break;
        case 'Down':
            Y += 1;
            break;
        case 'Left':
            X -= 1;
            break;
        case 'Right':
            X += 1;
            break;
    }
    return {X,Y};
}
// Очистка поля
function clearMove(){
    for(var i = 0; i < snake.length; i++)
    {
        var pos = document.querySelector('.col-' + snake[i].X + '-' + snake[i].Y);
        if(i == 0)
            pos.classList.remove('snakeHead');
        else
            pos.classList.remove('snakeBody');
    }
}
// Передвинуть змейку
function moveSnake(nextPosition, isEat){
    var X = nextPosition.X;
    var Y = nextPosition.Y;

    if(!isEat)
        snake.pop();

    snake.unshift({X, Y});
}
// Проверка на удар
function checkHit(newPosition){
    var isHit = false;

    // Проверка на выход из зоны квадрата
    if(newPosition.X > SIZE_X-1 || newPosition.X  < 0 
        || newPosition.Y > SIZE_Y-1 || newPosition.Y < 0)
        isHit = true;

    // Проверка на удар об своё тело
    for(var i = 1; i < snake.length; i++)
    {
        if(snake[i].X == newPosition.X && snake[i].Y == newPosition.Y)
            isHit = true;
    }

    return isHit;
}
// Проверка на съедение еды
function checkEat(newPosition){
    var isEat = false;
    for(var i = 0; i < food.length; i++)
    {
        if(food[i].X == newPosition.X && food[i].Y == newPosition.Y)
        {
            removeFood(i,food[i]);
            addFood();
            points++;
            isEat = true;
        }
    }
    return isEat;
}
// Добавление еды
function addFood(){
    var X = Math.floor(Math.random() * SIZE_X);
    var Y = Math.floor(Math.random() * SIZE_Y);
    var newFood = {X, Y};
    // Проверяем что еда не создалась в нутри змейки
    for(var i = 0; i < snake.length; i++)
    {
        // Если еда создалась в нутри змейки, вызываем рекурсию
        if(snake[i].X == food.X && snake[i].Y == food.Y)
            newFood = addFood();
    }
    food.push(newFood);
    var pos = document.querySelector('.col-' + newFood.X + '-' + newFood.Y);
    pos.classList.add('food');
}
// Удаление еды
function removeFood(index, foodPos){
    var pos = document.querySelector('.col-'+foodPos.X+'-'+foodPos.Y);
    pos.classList.remove('food');
    food.splice(index, 1);
}
// Очистка всей еды с поля
function removeAllFood(){
    for(var f of food)
    {
        var pos = document.querySelector('.col-' + f.X + '-' + f.Y);
        pos.classList.remove('food');
    }    
}
// Изменение направления движения
function changeMoveTo(event){
    var arrow = document.querySelector('.bi');
    switch(event.code)
    {
        case 'KeyW':
            moveTo = 'Up';
            arrow.classList = 'bi bi-arrow-up';
            break;
        case 'KeyS':
            moveTo = 'Down';
            arrow.classList = 'bi bi-arrow-down';
            break;
        case 'KeyA':
            moveTo = 'Left';
            arrow.classList = 'bi bi-arrow-left';
            break;
        case 'KeyD':
            moveTo = 'Right';
            arrow.classList = 'bi bi-arrow-right';
            break;
    }
}
// Изменение кнопки старт
function changeBtnStartTo(event){
    var start = document.querySelector('.game__start');
    switch(event)
    {
        case 1:
            start.textContent = 'Старт';
            start.setAttribute('onclick', 'startGame()');
            break;
        case 2:
            start.textContent = 'Пауза';
            start.setAttribute('onclick', 'pauseGame()');
            break;
        case 3:
            start.textContent = 'Продолжить';
            start.setAttribute('onclick', 'startGame()');
            break;
        case 4:
            start.textContent = 'Рестарт';
            start.setAttribute('onclick', 'restartGame()');
            break;
    }
}
// Изминение скорости игры
function changeGameSpeed(speed){
    currentSpeed = speed;
    if(game != null)
    {
        clearInterval(game);
        game = setInterval(updateGame, currentSpeed);
    }
}
//#endregion

document.addEventListener('keydown', changeMoveTo);

document.onload = init();