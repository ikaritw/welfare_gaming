games = [];
$('#regular .game').map(function (i, g) {
    var currentGame = $(g);

    var game = {};

    game.id = currentGame.attr("id");

    game.time = new Date(currentGame.find("g").eq(0).find('text').text().trim()).toJSON();

    game.team = [];
    game.team[0] = currentGame.find("g").eq(1).find('text').text().trim();
    game.team[1] = currentGame.find("g").eq(2).find('text').text().trim();
    game.team[2] = currentGame.find("g").eq(3).find('text').text().trim();

    game.winner = [];

    games.push(game);
});
JSON.stringify(games);