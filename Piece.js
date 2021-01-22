class Piece extends /*Phaser.GameObjects.Image*/ Phaser.Physics.Arcade.Sprite
{
    /*
        PONTUAÇÃO
        - Torre: 5
        - Bispo: 3
        - Rainha/dama: 9
        - Cavalo: 3
        - Rei: 
        - Peão: 1
    */

    // Static
    static TIPO_RAINHA = 0;
    static TIPO_REI = 1;
    static TIPO_BISPO = 4;
    static TIPO_CAVALO = 3;
    static TIPO_TORRE = 2;
    static TIPO_PEAO = 5;

    static NAME = 'pieces';

    static SCALE = 1; //0.4;

    // Pré-load
    static preload(scene)
    {
        scene.load.spritesheet(
            Piece.NAME,
            'assets/img/pieces.png',
            {
                frameWidth: Handler.PIECE_SIZE,
                frameHeight: Handler.PIECE_SIZE
            }
        );
    }

    static getFrame(player, tipo)
    {
        return tipo + 6 * player;
    }

    // Construtor
    constructor(scene, player, tipo, i, j)
    {
        super(
            scene,                       // Scene
            0,                           // x
            0,                           // y
            Piece.NAME,                  // Nome da imagem
            Piece.getFrame(player, tipo) // Frame do sprite
        );

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setInteractive();
        this.setScale(Piece.SCALE);

        this.width = this.width * Piece.SCALE;
        this.height = this.height * Piece.SCALE;

        this.player = player;
        this.tipo = tipo;

        this.markations = [];

        this.moveTo(i, j);
        this.walked = false;
        this.firstMovement = false;
        this.longMoviment = false; // <- true: se o peão andar 2 casas
        this.enPassantAble = false;
    }

    moveTo(i, j)
    {
        this.i = i;
        this.j = j;
        this.x = Handler.X_OFFSET + Handler.HOUSE_SIZE * i + Handler.HOUSE_SIZE / 2;
        this.y = Handler.Y_OFFSET + Handler.HOUSE_SIZE * j + Handler.HOUSE_SIZE / 2;

        this.firstMovement = !this.walked; // Será o primeiro movimento se ele ainda não tiver andado
        this.walked = true;
        this.longMoviment = false;
    }

    getValidHouses(board)
    {
        const validHouses = [];
        const self = this;

        function getOrthogonal()
        {
            // Cima
            for(var i = self.i - 1; i >= 0; i--)
                if(board[i][self.j] === null)
                    validHouses.push({ i, j: self.j });
                else
                {
                    if(board[i][self.j].player !== self.player)
                        validHouses.push({ i, j: self.j, captureable: true });
                    break;
                }
            // Baixo
            for(var i = self.i + 1; i < Handler.DIMENSION; i++)
                if(board[i][self.j] === null)
                    validHouses.push({ i, j: self.j });
                else
                {
                    if(board[i][self.j].player !== self.player)
                        validHouses.push({ i, j: self.j, captureable: true });
                    break;
                }
            // Direita
            for(var j = self.j + 1; j < Handler.DIMENSION; j++)
                if(board[self.i][j] === null)
                    validHouses.push({ i: self.i, j });
                else
                {
                    if(board[self.i][j].player !== self.player)
                        validHouses.push({ i:self.i, j, captureable: true });
                    break;
                }
            // Esquerda
            for(var j = self.j - 1; j >= 0; j--)
                if(board[self.i][j] === null)
                    validHouses.push({ i: self.i, j });
                else
                {
                    if(board[self.i][j].player !== self.player)
                        validHouses.push({ i:self.i, j, captureable: true });
                    break;
                }
        }

        function getDiagonal()
        {
            // Cima-esquerda
            for(var d = 1; ; d++)
            {
                const i = self.i - d;
                const j = self.j - d;

                if(i < 0
                || j < 0)
                    break;

                if(board[i][j] === null)
                    validHouses.push({ i, j });
                else
                {
                    if(board[i][j].player !== self.player)
                        validHouses.push({ i, j, captureable: true });
                    break;
                }
            }
            // Cima-direita
            for(var d = 1; ; d++)
            {
                const i = self.i + d;
                const j = self.j - d;

                if(i >= Handler.DIMENSION
                || j < 0)
                    break;

                if(board[i][j] === null)
                    validHouses.push({ i, j });
                else
                {
                    if(board[i][j].player !== self.player)
                        validHouses.push({ i, j, captureable: true });
                    break;
                }
            }
            // Baixo-esquerda
            for(var d = 1; ; d++)
            {
                const i = self.i - d;
                const j = self.j + d;

                if(i < 0
                || j >= Handler.DIMENSION)
                    break;

                if(board[i][j] === null)
                    validHouses.push({ i, j });
                else
                {
                    if(board[i][j].player !== self.player)
                        validHouses.push({ i, j, captureable: true });
                    break;
                }
            }
            // Baixo-direita
            for(var d = 1; ; d++)
            {
                const i = self.i + d;
                const j = self.j + d;

                if(i >= Handler.DIMENSION
                || j >= Handler.DIMENSION)
                    break;

                if(board[i][j] === null)
                    validHouses.push({ i, j });
                else
                {
                    if(board[i][j].player !== self.player)
                        validHouses.push({ i, j, captureable: true });
                    break;
                }
            }
        }

        switch(this.tipo)
        {
            // PEÃO
            case Piece.TIPO_PEAO:
                const direcao = this.player === Handler.PLAYER_BLACK ? 1 : -1;

                var j = this.j + direcao;

                if(j >= 0 && j < Handler.DIMENSION)
                {
                    console.log('\n\n\n');

                    for(var dI = -1; dI <= 1; dI++)
                    {
                        const i = this.i + dI;

                        // Movimento padrão (1 casa)
                        if(dI === 0)
                        {
                            if(board[i][j] === null)
                                validHouses.push({
                                    i, j,
                                    promotion: j === 0 || j === Handler.DIMENSION - 1
                                });
                        }
                        else
                        {
                            if(i >= 0 && i < Handler.DIMENSION)
                            {
                                // Captura
                                if(board[i][j] !== null
                                && board[i][j].player !== this.player)
                                    validHouses.push({
                                        i, j,
                                        captureable: true,
                                        promotion: j === 0 || j === Handler.DIMENSION - 1
                                    });

                                // En passant (execução)
                                if(board[i][this.j] !== null                 // Se casa ao lado não estiver vazia
                                && board[i][this.j].player !== this.player   // E a peça ao lado for do adversário
                                && board[i][this.j].tipo === Piece.TIPO_PEAO // E a peça ao lado for um peão
                                && board[i][this.j].enPassantAble            // E a peça tiver acabado de se mover (ou seja, se en passant estiver habilitado)
                                && board[i][j] === null)                     // E a casa atrás deste peão estiver vazia:
                                {
                                    console.log('en passant !');

                                    validHouses.push({
                                        i, j,
                                        enPassant: {
                                            i, j: this.j
                                        }
                                    });
                                }
                            }
                        }
                    }

                    // Movimento inicial (2 casas)
                    if(!this.walked
                    && j + direcao >= 0
                    && j + direcao < Handler.DIMENSION
                    && board[this.i][j + direcao] === null)
                        validHouses.push({
                            i: this.i,
                            j: j + direcao,
                            longMoviment: true
                        });
                }

                break;

            // TORRE
            case Piece.TIPO_TORRE:
                getOrthogonal();
                break;

            // CAVALO
            case Piece.TIPO_CAVALO:
                // Buscar em forma de L por todas as direções
                for(var dI = -2; dI <= 2; dI++)
                {
                    const i = this.i + dI;

                    if(i < 0
                    || i >= Handler.DIMENSION
                    || dI === 0)
                        continue;

                    for(var dJ = -2; dJ <= 2; dJ++)
                    {
                        const j = this.j + dJ;

                        if(j < 0
                        || j >= Handler.DIMENSION
                        || dJ === 0)
                            continue;

                        // Se (dI for -1 ou 1) xou (dJ for -1 ou 1):
                        if(((dI === -1 || dI === 1)
                        ||  (dJ === -1 || dJ === 1))
                        && ((dI !== -1 && dI !== 1)
                        ||  (dJ !== -1 && dJ !== 1)))
                        {
                            if(board[i][j] === null)
                                validHouses.push({ i, j });
                            else
                                if(board[i][j].player !== this.player)
                                    validHouses.push({ i, j, captureable: true });
                        }
                    }
                }
                break;

            // BISPO
            case Piece.TIPO_BISPO:
                getDiagonal();
                break;

            // RAINHA
            case Piece.TIPO_RAINHA:
                getOrthogonal();
                getDiagonal();
                break;

            // REI
            case Piece.TIPO_REI:
                // Buscar ao redor da peça
                for(var i = this.i - 1; i <= this.i + 1; i++)
                    for(j = this.j - 1; j <= this.j + 1; j++)
                        if(i >= 0 && i < Handler.DIMENSION
                        && j >= 0 && j < Handler.DIMENSION)
                        {
                            if(board[i][j] === null)
                                validHouses.push({ i, j });
                            else
                                if(board[i][j].player !== this.player)
                                    validHouses.push({ i, j, captureable: true });
                        }

                // Roque
                if(!this.walked)
                {
                    // Esquerda
                    const leftTower = board[0][this.j];

                    if(leftTower !== null
                    && leftTower.tipo === Piece.TIPO_TORRE // Se for uma torre
                    && leftTower.player === this.player    // E ela for do mesmo jogador
                    && !leftTower.walked                   // E ela não tiver se movimentado ainda
                    && board[this.i - 1][this.j] === null  // E as 2 casas à esquerda estiverem vazias
                    && board[this.i - 2][this.j] === null)
                    {
                        validHouses.push({
                            i: this.i - 2,
                            j: this.j,
                            roque: true
                        });
                    }

                    // Direita
                    const rightTower = board[Handler.DIMENSION - 1][this.j];

                    if(rightTower !== null
                    && rightTower.tipo === Piece.TIPO_TORRE // Se for uma torre
                    && rightTower.player === this.player    // E ela for do mesmo jogador
                    && !rightTower.walked                   // E ela não tiver se movimentado ainda
                    && board[this.i + 1][this.j] === null   // E as 2 casas à direita estiverem vazias
                    && board[this.i + 2][this.j] === null)
                    {
                        validHouses.push({
                            i: this.i + 2,
                            j: this.j,
                            roque: true
                        });
                    }
                }
                break;
        }

        return validHouses;
    }

    // Desenhar caso selecionado
    drawSelected(board)
    {
        const self = this;

        function showHouse(i, j, color)
        {
            self.markations.push(
                Handler.showHouse(self.scene, i, j, color)
            );
        }

        // This
        showHouse(this.i, this.j, Handler.COLORS.yellow);
        
        // Casas válidas
        for(var house of this.getValidHouses(board))
            showHouse(
                house.i,
                house.j,
                house.captureable || house.enPassant
                    ? Handler.COLORS.green
                    : Handler.COLORS.blue
            );
    }

    removeMarkations()
    {
        for(var i = 0; i < this.markations.length; i++)
            this.markations[i].destroy();

        this.markations = [];
    }

    // Update
    update()
    {
        
    }
}