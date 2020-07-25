var startButton = document.getElementById('start-button');
var itemsInput = document.getElementById('items-input');
var warningAlert = document.getElementById('warning-alert');

var button0 = document.getElementById('button0');
var button1 = document.getElementById('button1');

var buttonColours = [['#286090', '#204d74'], ['#800080', '#540054'], ['#289045', '#195e2d'], ['#f0ad4e', '#eea236'], ['#5bc0de', '#46b8da'], ['#dd1be0', '#b316b5'], ['#16c792', '#15a177']];

var ranking = false;

var scores = {};
var previous_opponents = {};

var pairings = [];
var currentPairing;

var resultsTable = document.getElementById('results-table');
var resultsTableBody = document.getElementById('results-table-body');
var resetButton = document.getElementById('resetButton');

function fadeInOut (uiIn, uiOut, afterFadeOut) {

    $(uiOut).fadeOut('slow');

    setTimeout(function () {

        $(uiIn).fadeIn('slow');

        if (afterFadeOut) {

            afterFadeOut();

        }

    }, 1000);

}

function displayWarning () {

    $('#warning-alert').fadeIn('slow');

    setTimeout(function () {

        $('#warning-alert').fadeOut('slow');

    }, 5000);

}

function checkBlank (v) {

    return v != '';

}

function createPairings () {

    var sorted_items, first_item, second_item, opponent_found, pairings;

    pairings = [];

    sorted_items = Object.keys(scores).sort(function(first, second) {
        return scores[second] - scores[first];
    });

    if (sorted_items.length % 2 === 1) {

        pairings.push([sorted_items.shift(), null]);

    }

    while (sorted_items.length > 0) {

        first_item = sorted_items.shift();

        opponent_found = false;

        for (var i=0; i < sorted_items.length; i++) {

            second_item = sorted_items[i];

            if (!previous_opponents[first_item].includes(second_item)) {

                opponent_found = true;
                sorted_items.splice(i, 1);
                break;

            }

        }

        if (opponent_found) {

            pairings.push([first_item, second_item]);

        } else {

            return false;

        }

    }

    return pairings;

}

function updateButtons (pairing) {

    var randomIndex0, randomIndex1, colours0, colours1;

    button0.innerText = pairing[0];
    button1.innerText = pairing[1];

    button0.style.fontSize = (pairing[0].length > 9) ? "20px" : "40px";
    button1.style.fontSize = (pairing[1].length > 9) ? "20px" : "40px";

    randomIndex0 = Math.floor(Math.random() * (buttonColours.length - 1));
    randomIndex1 = Math.floor(Math.random() * (buttonColours.length - 1));

    while (randomIndex0 === randomIndex1) {

        randomIndex1 = Math.round(Math.random() * buttonColours.length);

    }

    colours0 = buttonColours[randomIndex0];
    colours1 = buttonColours[randomIndex1];

    console.log(randomIndex0, randomIndex1);
    console.log(colours0, colours1);

    button0.style.backgroundColor = colours0[0];
    button0.style.borderColor = colours0[1];

    button1.style.backgroundColor = colours1[0];
    button1.style.borderColor = colours1[1];

    previous_opponents[pairing[0]].push(pairing[1]);
    previous_opponents[pairing[1]].push(pairing[0]);

    currentPairing = pairing;

}

function finishRanking () {

    var sorted_items, row, rankCell, nameCell, item, current_score, previous_score, rank, backgroundColors;

    ranking = false;

    sorted_items = Object.keys(scores).sort(function(first, second) {
        return scores[second] - scores[first];
    });

    previous_score = scores[sorted_items[0]];
    rank = 1;

    backgroundColors = ['lightgrey', 'white'];

    for (var i = 0; i < sorted_items.length; i++) {

    	item = sorted_items[i];

        row = resultsTableBody.insertRow();
        rankCell = row.insertCell(0);
        nameCell = row.insertCell(1);

        current_score = scores[item];

        if (current_score < previous_score) {

        	rank += 1;

        }

        row.style.backgroundColor = backgroundColors[rank % 2];

        previous_score = current_score;

        rankCell.innerHTML = '<b>' + rank + '</b>';
        nameCell.innerText = item;

    }

    fadeInOut('#results-ui', '#rank-ui');

}

function startRound () {

    if (!ranking) {

        return;

    }

    pairings = createPairings();

    if (!pairings) {

        console.log('Everyone has faced everyone else');
        console.log(scores);

        finishRanking();

        return;

    }

    for (var p = 0; p < pairings.length; p++) {

        pairing = pairings.shift();

        if (pairing[1] === null) {

            scores[pairing[0]] += 1;

        } else {

            updateButtons(pairing);

            break;

        }

    }

}

function shuffle(array) {

    var currentIndex, temporaryValue, randomIndex;

    currentIndex = array.length

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;

}

startButton.addEventListener('click', function () {

    var items;

    startButton.disabled = true;

    items = itemsInput.value.split('\n').filter(checkBlank);

    if (itemsInput.value === '') {

        displayWarning();
        return;

    }

    ranking = true;

    shuffle(items);

    scores = {}
    previous_opponents = {}

    for (var i=0; i < items.length; i++) {

        item = items[i];
        scores[item] = 0;
        previous_opponents[item] = [];

    }


    startRound();

    fadeInOut('#rank-ui', '#entry-ui');

});

function rank (choice) {

    scores[currentPairing[choice]] += 1;

    if (pairings.length > 0) {

        updateButtons(pairings.shift());

    } else {

        console.log('Round complete');
        console.log(scores);

        startRound();

    }

}

document.addEventListener('keydown', function (e) {

    if (ranking) {

        if (e.code === 'ArrowLeft') {

            rank(0);

        } else if (e.code === 'ArrowRight') {

            rank(1);

        }

    }

});

button0.addEventListener('click', function () {

    rank(0);

});

button1.addEventListener('click', function () {

    rank(1);

});

resetButton.addEventListener('click', function () {

    scores = {};
    previous_opponents = {};

    pairings = [];
    currentPairing = null;

    fadeInOut('#entry-ui', '#results-ui', function () {

        var newTableBody = document.createElement('tbody');
        resultsTableBody.parentNode.replaceChild(newTableBody, resultsTableBody);
        newTableBody.id = 'results-table-body';
        resultsTableBody = document.getElementById('results-table-body');

        startButton.disabled = false;

    });

});
