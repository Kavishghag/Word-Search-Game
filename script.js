document.getElementById('generate').addEventListener('click', generatePuzzle);

async function generatePuzzle() {
    const gridSize = 21;
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));

    const words = await fetchRandomWords(30);
    const selectedWords = [];

    // Function to place a word in the grid
    function placeWord(word) {
        const directions = [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: -1 },
        ];

        for (const dir of directions) {
            const startX = Math.floor(Math.random() * gridSize);
            const startY = Math.floor(Math.random() * gridSize);

            if (canPlaceWord(word, startX, startY, dir)) {
                for (let i = 0; i < word.length; i++) {
                    const x = startX + i * dir.x;
                    const y = startY + i * dir.y;
                    grid[y][x] = word[i];
                }
                selectedWords.push(word);
                return true;
            }
        }
        return false;
    }

    // Check if the word can be placed in the specified direction
    function canPlaceWord(word, x, y, dir) {
        for (let i = 0; i < word.length; i++) {
            const newX = x + i * dir.x;
            const newY = y + i * dir.y;
            if (newX < 0 || newY < 0 || newX >= gridSize || newY >= gridSize || grid[newY][newX] !== '') {
                return false;
            }
        }
        return true;
    }

    // Fill the grid with words
    words.forEach(word => placeWord(word.toUpperCase()));

    // Fill remaining cells with random letters
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === '') {
                grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }

    // Render the grid
    const wordGrid = document.getElementById('word-grid');
    wordGrid.innerHTML = '';
    grid.forEach(row => {
        row.forEach(cell => {
            const cellDiv = document.createElement('div');
            cellDiv.textContent = cell;
            wordGrid.appendChild(cellDiv);
        });
    });

    // Render the word list
    const wordList = document.getElementById('words');
    wordList.innerHTML = '';
    selectedWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        wordList.appendChild(li);
    });

    // Add drag selection functionality
    let isDragging = false;
    let startCell = null;
    let endCell = null;
    let dragCells = [];

    wordGrid.addEventListener('mousedown', event => {
        if (event.target.tagName === 'DIV') {
            isDragging = true;
            startCell = event.target;
            dragCells = [startCell];
            startCell.classList.add('drag-highlight');
            event.preventDefault(); // Prevent text selection
        }
    });

    wordGrid.addEventListener('mousemove', event => {
        if (isDragging && event.target.tagName === 'DIV') {
            endCell = event.target;
            if (!dragCells.includes(endCell)) {
                dragCells.push(endCell);
                endCell.classList.add('drag-highlight');
            }
        }
    });

    wordGrid.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            const formedWord = dragCells.map(cell => cell.textContent).join('');
            const reversedFormedWord = dragCells.map(cell => cell.textContent).reverse().join('');

            if (selectedWords.includes(formedWord) || selectedWords.includes(reversedFormedWord)) {
                dragCells.forEach(cell => cell.classList.add('highlighted'));
                // Mark the word as found in the list
                const wordItem = Array.from(wordList.getElementsByTagName('li')).find(li => li.textContent === formedWord || li.textContent === reversedFormedWord);
                if (wordItem) {
                    wordItem.classList.add('found');
                }
            } else {
                dragCells.forEach(cell => cell.classList.remove('drag-highlight'));
            }

            dragCells = [];
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            dragCells.forEach(cell => cell.classList.remove('drag-highlight'));
            dragCells = [];
        }
    });
}

async function fetchRandomWords(count) {
    const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${count}`);
    return await response.json();
}

// Initial puzzle generation
generatePuzzle();
