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

    // Definir graphics
    graphics = this.add.graphics();
    this["graphics"] = graphics;



    // BARRA LATERAL

    // Fundo
    this.add.rectangle(
        Handler.BOARD_SIZE + Handler.SIDEBAR_WIDTH / 2,
        Handler.WINDOW_HEIGHT / 2,
        Handler.SIDEBAR_WIDTH,
        Handler.WINDOW_HEIGHT,
        0xdddddd
    );

    const margin = 10;

    // Título do turno
    const turnTitle = this.add.text(
        Handler.BOARD_SIZE + margin,
        margin,
        'TURN',
        {
            font: "32px sans-serif",
            fill: "#111111",
        }
    );

    // Turno
    turnText = this.add.text(
        Handler.BOARD_SIZE + margin,
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

    // TABULEIRO
    const colors = [0x666666, 0xFFFFFF];

    for(var i = 0; i < 8; i++)
        for(var j = 0; j < 8; j++)
        {
            const color = colors[(i + j) % 2];

            graphics.fillStyle(color, 1);
            graphics.fillRect(
                Handler.HOUSE_SIZE * i,
                Handler.HOUSE_SIZE * j,
                Handler.HOUSE_SIZE,
                Handler.HOUSE_SIZE
            );
        }

    // Criar matriz de 8x8 com null em todas as posições
    board = Array.from(
        Array(Handler.DIMENSION), () =>
            Array.from(
                Array(Handler.DIMENSION), () => null
            )
        );

    // PEÇAS
    const piecesOrder = [4, 3, 2, 1, 0, 2, 3, 4]; // <- Ordem das peças de trás

    // Peças pretas
    for(var i = 0; i < 8; i++)
        for(var j = 0; j < 2; j++)
        {
            board[i][j] = new Piece(
                this,
                Handler.PLAYER_BLACK,
                j === 0 ? piecesOrder[i] : Piece.TIPO_PEAO,
                i, j
            );
        }

    // Peças brancas
    for(var i = 0; i < 8; i++)
        for(var j = 0; j < 2; j++)
        {
            board[i][j + 6] = new Piece(
                this,
                Handler.PLAYER_WHITE,
                j === 1 ? piecesOrder[i] : Piece.TIPO_PEAO,
                i, j + 6
            );
        }

    // Ação do tabuleiro
    this.add.rectangle(
        Handler.BOARD_SIZE / 2,
        Handler.BOARD_SIZE / 2,
        Handler.BOARD_SIZE,
        Handler.BOARD_SIZE
    )
    .setInteractive()
    .on('pointerdown', () =>
    {
        //txt.setText(Number(txt.text) + 1);

        const i = Math.floor(game.input.mousePointer.x / Handler.HOUSE_SIZE);
        const j = Math.floor(game.input.mousePointer.y / Handler.HOUSE_SIZE);

        // Se não tem peça selecionada:
        if(selectedPiece === null)
        {
            const piece = board[i][j];

            // Se a posição clicada for uma peça válida:
            if(piece !== null && piece.player === turn)
            {
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
                        // Atualizar tabuleiro
                        board[i][j] = selectedPiece;
                        board[selectedPiece.i][selectedPiece.j] = null;

                        // Mover peça e remover marcações
                        selectedPiece.moveTo(i, j);
                        selectedPiece.removeMarkations();

                        // Atualizar status
                        selectedPiece = null;
                        validHouse = true;

                        // Mudar turno
                        turn = (turn + 1) % 2;
                        changeTurnText();

                        break;
                    }

                // Se casa for inválido:
                if(!validHouse)
                {
                    selectedPiece.removeMarkations();
                    selectedPiece = null;
                }
            }
            else
            {
                selectedPiece.removeMarkations();
                selectedPiece = null;
            }
        }
    });
}

// UPDATE
function update()
{
    
}