// CONFIG
var config = {
    type: Phaser.AUTO,
    width: Handler.WINDOW_WIDTH,
    height: Handler.WINDOW_HEIGHT,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload,
        create,
        update
    }
};

// GAME
const game = new Phaser.Game(config);

// PRELOAD
function preload()
{
    // Peças
    Piece.preload(this);
}

// CREATE
function create()
{
    // Jogo
    selectedPiece = null;
    turn = Handler.PLAYER_BLACK;

    var top = 0;
    var left = 0;

    // -------------------- COORDENADAS --------------------

    const add = this.add;

    // 1-8
    function renderVerticalCoords()
    {
        add.rectangle(
            left + Handler.COORDINATE_BAR_SIZE / 2,
            Handler.WINDOW_HEIGHT / 2,
            Handler.COORDINATE_BAR_SIZE,
            Handler.WINDOW_HEIGHT,
            0xdddddd
        );
    
        for(var i = 8; i >= 1; i--)
        {
            const coordText = add.text(null, null, i, {
                font: '20px sans-serif',
                fill: '#000',
            });
    
            // Posicionar textp
            coordText.setX(left + Handler.COORDINATE_BAR_SIZE / 2 - coordText.width / 2);
            coordText.setY(Handler.COORDINATE_BAR_SIZE + Handler.HOUSE_SIZE * ((i - 8) * -1) + Handler.HOUSE_SIZE / 2 - coordText.height / 2);
        }
    
        left += Handler.COORDINATE_BAR_SIZE;
    }
    
    // A-H
    function renderHorizontalCoords()
    {
        add.rectangle(
            Handler.COORDINATE_BAR_SIZE + Handler.BOARD_SIZE / 2,
            top + Handler.COORDINATE_BAR_SIZE / 2,
            Handler.BOARD_SIZE,
            Handler.COORDINATE_BAR_SIZE,
            0xdddddd
        );
    
        for(var i = 0; i < 8; i++)
        {
            // Pegar letra (A-H)
            const coord = String.fromCharCode(i + 65);
    
            const coordText = add.text(null, null, coord, {
                font: '20px sans-serif',
                fill: '#000',
            });
    
            // Posicionar textp
            coordText.setX(Handler.COORDINATE_BAR_SIZE + Handler.HOUSE_SIZE * i + Handler.HOUSE_SIZE / 2 - coordText.width / 2);
            coordText.setY(top + Handler.COORDINATE_BAR_SIZE / 2 - coordText.height / 2);
        }

        top += Handler.COORDINATE_BAR_SIZE;
    }

    renderVerticalCoords();
    renderHorizontalCoords();



    // -------------------- TABULEIRO --------------------
    const colors = /*[0xcbcbc5, 0xc08e3c];*/ [0xFFFFFF, 0x666666];

    Handler.X_OFFSET = top;
    Handler.Y_OFFSET = left;

    for(var i = 0; i < 8; i++)
        for(var j = 0; j < 8; j++)
        {
            const color = colors[(i + j) % 2];

            this.add.rectangle(
                left + Handler.HOUSE_SIZE * i + Handler.HOUSE_SIZE / 2,
                top + Handler.HOUSE_SIZE * j + Handler.HOUSE_SIZE / 2,
                Handler.HOUSE_SIZE,
                Handler.HOUSE_SIZE,
                color
            );
        }

    top += Handler.BOARD_SIZE;
    left += Handler.BOARD_SIZE;

    renderHorizontalCoords();
    renderVerticalCoords();



    // -------------------- BARRA LATERAL --------------------

    // Fundo
    this.add.rectangle(
        left + Handler.SIDEBAR_WIDTH / 2,
        Handler.WINDOW_HEIGHT / 2,
        Handler.SIDEBAR_WIDTH,
        Handler.WINDOW_HEIGHT,
        0xeeeeee
    );

    const margin = 18;

    // Título do turno
    const turnTitle = this.add.text(
        left + margin,
        margin,
        'TURN',
        {
            font: "32px sans-serif",
            fill: "#111111",
        }
    );

    // Turno
    turnText = this.add.text(
        left + margin,
        turnTitle.height + margin,
        '',
        {
            font: "22px sans-serif",
            fill: null,
        }
    ).setStroke(null, 2);

    function changeTurnText()
    {
        const turnTextProps = turn === Handler.PLAYER_BLACK
            ? { text: 'Black', color: '#111111', strokeColor: '#ffffff' }
            : { text: 'White', color: '#ffffff', strokeColor: '#111111' };

        //turnText.setText(turnTextProps.text);
        turnText.setText(turnTextProps.text);
        turnText.style.setColor(turnTextProps.color);
        turnText.style.setStroke(turnTextProps.strokeColor);
    }

    changeTurnText();



    // -------------------- PEÇAS --------------------

    // Criar matriz de 8x8 com null em todas as posições
    board = Array.from(
        Array(Handler.DIMENSION), () =>
            Array.from(
                Array(Handler.DIMENSION), () => null
            )
        );

    // Ordem das peças de trás
    const piecesOrder = [2, 3, 4, 0, 1, 4, 3, 2]; //[4, 3, 2, 1, 0, 2, 3, 4];

    // Peças pretas
    for(var i = 0; i < 8; i++)
        for(var j = 0; j < 2; j++)
            board[i][j] = new Piece(
                this,
                Handler.PLAYER_BLACK,
                j === 0 ? piecesOrder[i] : Piece.TIPO_PEAO,
                i, j
            );

    // Peças brancas
    for(var i = 0; i < 8; i++)
        for(var j = 0; j < 2; j++)
            board[i][j + 6] = new Piece(
                this,
                Handler.PLAYER_WHITE,
                j === 1 ? piecesOrder[i] : Piece.TIPO_PEAO,
                i, j + 6
            );



    // -------------------- DESTAQUES --------------------

    const self = this;
    selectableHouses = [];

    /**
     * Destaca as casas disponíveis do jogador da vez
     */
    function showSelectableHouses()
    {
        console.log(self);

        for(var i = 0; i < Handler.DIMENSION; i++)
            for(var j = 0; j < Handler.DIMENSION; j++)
                if(board[i][j] !== null
                && board[i][j].player === turn)
                    selectableHouses.push(
                        Handler.showHouse(self, i, j, Handler.COLORS.green)
                    );
    }

    /**
     * Remove os destaques das casas
     */
    function hideHouses()
    {
        for(var house of selectableHouses)
            house.destroy();

        selectableHouses = [];
    }

    showSelectableHouses();



    // -------------------- MECÂNICA --------------------

    // Ação do tabuleiro
    this.add.rectangle(
        Handler.BOARD_SIZE / 2 + Handler.COORDINATE_BAR_SIZE,
        Handler.BOARD_SIZE / 2,
        Handler.BOARD_SIZE,
        Handler.BOARD_SIZE
    )
    .setInteractive()
    .on('pointerdown', () =>
    {
        const i = Math.floor((game.input.mousePointer.x - Handler.X_OFFSET) / Handler.HOUSE_SIZE);
        const j = Math.floor((game.input.mousePointer.y - Handler.Y_OFFSET) / Handler.HOUSE_SIZE);

        // Se não tem peça selecionada:
        if(selectedPiece === null)
        {
            const piece = board[i][j];

            // Se a posição clicada for uma peça válida:
            if(piece !== null && piece.player === turn)
            {
                hideHouses();

                selectedPiece = piece;
                piece.drawSelected(board);
            }
        }
        // Se tem peça selecionada:
        else
        {
            // Se não é a própria casa:
            if(selectedPiece.i !== i || selectedPiece.j !== j)
            {
                var validHouse = false;

                // Roda as casas válidas
                for(var house of selectedPiece.getValidHouses(board))
                    // Se é a casa clicada:
                    if(house.i === i && house.j === j)
                    {
                        // Capturar peça
                        if(house.captureable)
                        {
                            board[i][j].destroy();
                        }

                        // En passant
                        if(house.enPassant)
                        {
                            board[house.enPassant.i][house.enPassant.j].destroy();
                        }

                        // Atualizar tabuleiro
                        board[i][j] = selectedPiece;
                        board[selectedPiece.i][selectedPiece.j] = null;

                        // Roque
                        if(house.roque)
                        {
                            var oldCoord = { i: null, j: selectedPiece.j };
                            var newCoord = { i: null, j: selectedPiece.j };

                            // Esquerda
                            if(house.i < selectedPiece.i)
                            {
                                oldCoord.i = 0;
                                newCoord.i = selectedPiece.i - 1;
                            }
                            // Direita
                            else
                            {
                                oldCoord.i = Handler.DIMENSION - 1;
                                newCoord.i = selectedPiece.i + 1;
                            }

                            const tower = board[oldCoord.i][oldCoord.j];

                            board[newCoord.i][newCoord.j] = tower;
                            board[oldCoord.i][oldCoord.j] = null;

                            tower.moveTo(newCoord.i, newCoord.j);
                        }

                        // Mover peça e remover marcações
                        selectedPiece.moveTo(i, j);
                        selectedPiece.removeMarkations();

                        // Peão move 2 casas
                        if(house.longMoviment)
                            selectedPiece.longMoviment = true;

                        // Atualizar status
                        selectedPiece = null;
                        validHouse = true;

                        // Mudar turno
                        turn = (turn + 1) % 2;
                        changeTurnText();

                        showSelectableHouses();

                        break;
                    }

                // Se casa for inválida:
                if(!validHouse)
                {
                    selectedPiece.removeMarkations();

                    // Se o jogador clicou em outra peça válida: troca a peça selecionada
                    if(board[i][j] !== null
                    && board[i][j].player === turn)
                    {
                        selectedPiece = board[i][j];
                        selectedPiece.drawSelected(board);
                    }
                    // Senão: remove a seleção
                    else
                    {
                        selectedPiece = null;
                        showSelectableHouses();
                    }
                }
            }
            // Se for a própria casa: remove a seleção
            else
            {
                selectedPiece.removeMarkations();
                selectedPiece = null;
                showSelectableHouses();
            }
        }
    });
}

// UPDATE
function update()
{
    
}