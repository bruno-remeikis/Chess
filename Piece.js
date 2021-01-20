class Piece extends /*Phaser.GameObjects.Image*/ Phaser.Physics.Arcade.Sprite
{
    // Static
    static TIPO_RAINHA = 0;
    static TIPO_REI = 1;
    static TIPO_BISPO = 2;
    static TIPO_CAVALO = 3;
    static TIPO_TORRE = 4;
    static TIPO_PEAO = 5;

    static NAME = 'pieces';

    static SCALE = 0.4;

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

    // Construtor
    constructor(scene, player, tipo, i, j)
    {
        super(
            scene,            // Scene
            0,                // x
            0,                // y
            Piece.NAME,       // Nome da imagem
            tipo + 6 * player // Index do sprite
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
    }

    moveTo(i, j)
    {
        this.i = i;
        this.j = j;
        this.x = Handler.HOUSE_SIZE * i + Handler.HOUSE_SIZE / 2;
        this.y = Handler.HOUSE_SIZE * j + Handler.HOUSE_SIZE / 2;
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
                    break;
            // Baixo
            for(var i = self.i + 1; i < Handler.DIMENSION; i++)
                if(board[i][self.j] === null)
                    validHouses.push({ i, j: self.j });
                else
                    break;
            // Direita
            for(var j = self.j + 1; j < Handler.DIMENSION; j++)
                if(board[self.i][j] === null)
                    validHouses.push({ i: self.i, j });
                else
                    break;
            // Esquerda
            for(var j = self.j - 1; j >= 0; j--)
                if(board[self.i][j] === null)
                    validHouses.push({ i: self.i, j });
                else
                    break;
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
                    break;
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
                    break;
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
                    break;
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
                    break;
            }
        }

        switch(this.tipo)
        {
            // PEÃO
            case Piece.TIPO_PEAO:
                // ---------- REMOVER ----------
                const direcao = this.player === Handler.PLAYER_BLACK ? 1 : -1;
                if(board[this.i][this.j + direcao] === null)
                    validHouses.push({ i: this.i, j: this.j + direcao });
                // ---------- REMOVER ----------
                break;

            // TORRE
            case Piece.TIPO_TORRE:
                getOrthogonal();
                break;

            // CAVALO
            case Piece.TIPO_CAVALO:
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
                for(var i = this.i - 1; i <= this.i + 1; i++)
                    for(var j = this.j - 1; j <= this.j + 1; j++)
                        if(i >= 0 && i < Handler.DIMENSION
                        && j >= 0 && j < Handler.DIMENSION
                        && board[i][j] === null)
                            validHouses.push({ i, j });
                break;
        }

        return validHouses;
    }

    // Desenhar caso selecionado
    drawSelected(board)
    {
        const piece = this;

        function drawInHouse(i, j)
        {
            const lineWidth = 3;

            const markation = piece.scene.add.rectangle(
                i * Handler.HOUSE_SIZE + Handler.HOUSE_SIZE / 2,
                j * Handler.HOUSE_SIZE + Handler.HOUSE_SIZE / 2,
                Handler.HOUSE_SIZE - lineWidth,
                Handler.HOUSE_SIZE - lineWidth,
                0x25b350,
                0.14
            )
            .setStrokeStyle(lineWidth, /*0xe34242*/ 0x25b350);

            piece.markations.push(markation);

            /*
            graphics.lineStyle(lineWidth, 0x42eff5);
            const a = graphics.strokeRect(
                i * Handler.HOUSE_SIZE + lineWidth / 2,
                j * Handler.HOUSE_SIZE + lineWidth / 2,
                Handler.HOUSE_SIZE - lineWidth,
                Handler.HOUSE_SIZE - lineWidth
            );

            console.log(a);
            a.visible = false;
            */
        }

        // This
        drawInHouse(this.i, this.j);
        
        // Casas válidas
        for(var house of this.getValidHouses(board))
            drawInHouse(house.i, house.j);

        /*
        console.log(this.markations);
        for(var i = 0; i < this.markations.length; i++)
            this.markations[i].destroy();
        this.markations = [];
        */
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