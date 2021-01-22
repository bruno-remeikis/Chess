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
        for(var i = 0; i < Handler.DIMENSION; i++)
            for(var j = 0; j < Handler.DIMENSION; j++)
                if(board[i][j] !== null                          // Se existir peça naquela coordenada
                && board[i][j].player === turn                   // E esta peça for do jogador da vez
                && board[i][j].getValidHouses(board).length > 0) // E existirem jogadas possíveis para ela:
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



    // -------------------- PROMOÇÃO DO PEÃO --------------------
    const promoItens = [];
    const promoImages = [];

    const promoMargin = 10;
    const promoScale = 1.3;

    var pawnToPromote = null;

    const promoRect = this.add.rectangle(
        Handler.X_OFFSET + Handler.BOARD_SIZE / 2,
        Handler.Y_OFFSET + Handler.BOARD_SIZE / 2,
        Handler.HOUSE_SIZE * promoScale * 4 + promoMargin * 5,
        Handler.HOUSE_SIZE * promoScale + promoMargin * 2,
        0xcccccc
    )
    .setDepth(91)
    .setStrokeStyle(1, 0x888888);

    promoItens.push(promoRect);

    const piecesPromoOrder = [Piece.TIPO_TORRE, Piece.TIPO_CAVALO, Piece.TIPO_BISPO, Piece.TIPO_RAINHA];

    for(var i = 0; i < 4; i++)
    {
        const tipo = piecesPromoOrder[i];

        const promoHouse = this.add.rectangle(
            (promoRect.x - promoRect.width  / 2) + (promoMargin * (i + 1)) + (Handler.HOUSE_SIZE * promoScale) / 2 + (Handler.HOUSE_SIZE * promoScale) * i,
            (promoRect.y - promoRect.height / 2) +  promoMargin            + (Handler.HOUSE_SIZE * promoScale) / 2,
            Handler.HOUSE_SIZE * promoScale,
            Handler.HOUSE_SIZE * promoScale,
            0xdddddd
        )
        .setDepth(92)
        .setInteractive()
        .on('pointerdown', () =>
        {
            pawnToPromote.tipo = tipo;
            pawnToPromote.setFrame(
                Piece.getFrame(pawnToPromote.player, tipo)
            );

            hidePromo();
        });

        promoItens.push(promoHouse);

        const promoPiece = this.add.image(
            promoHouse.x,
            promoHouse.y,
            'pieces',
            //Piece.getFrame(turn, tipo)
        )
        .setDepth(93);
        console.log(promoPiece)
        promoPiece.setScale(promoScale);

        promoImages.push({ img: promoPiece, tipo });
    }

    // Funções

    function showPromo()
    {
        promoItens .forEach(item => item.setVisible(true));
        promoImages.forEach(item =>
        {
            item.img.setVisible(true);
            item.img.setFrame(
                Piece.getFrame(turn, item.tipo)
            );
        });
    }

    function hidePromo()
    {
        promoItens .forEach(item => item.setVisible(false));
        promoImages.forEach(item => item.img.setVisible(false));
    }

    hidePromo();



    // -------------------- MECÂNICA --------------------
    // Variáveis usadas para remover o Piece.enPassantAble
    var enPassantTurn = null;
    var enPassantPiece = null;

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

            // Se a posição clicada for uma peça válida e existirem jogadas possíveis:
            if(piece !== null
            && piece.player === turn
            && piece.getValidHouses(board).length > 0)
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

                        // En passant (execussão)
                        if(house.enPassant)
                        {
                            board[house.enPassant.i][house.enPassant.j].destroy();
                            board[house.enPassant.i][house.enPassant.j] = null;
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
                        {
                            // Movimento longo do peão
                            selectedPiece.longMoviment = true;

                            // En passant (possibilidade)
                            for(var dI = -1; dI <= 1; dI += 2)
                            {
                                const i = house.i + dI;

                                if(i >= 0
                                && i < Handler.DIMENSION
                                && board[i][house.j] !== null
                                && board[i][house.j].player !== turn
                                && board[i][house.j].tipo === Piece.TIPO_PEAO)
                                {
                                    selectedPiece.enPassantAble = true;

                                    enPassantTurn = turn;
                                    enPassantPiece = selectedPiece;
                                    break;
                                }
                            }
                        }

                        // Remover en passant
                        if(enPassantPiece !== null
                        && enPassantTurn !== turn)
                        {
                            enPassantPiece.enPassantAble = false;

                            enPassantTurn = null;
                            enPassantPiece = null;
                        }

                        // Promoção do peão
                        if(house.promotion)
                        {
                            pawnToPromote = selectedPiece;
                            showPromo();
                        }

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