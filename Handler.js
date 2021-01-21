class Handler
{
    // Dados do jogo
    static DIMENSION = 8;

    // Elementos do jogo
    static HOUSE_SIZE = 80; // Casa
    static PIECE_SIZE = 64; //213; // Peça

    // Elementos da tela
    static BOARD_SIZE = Handler.HOUSE_SIZE * Handler.DIMENSION; // Tabuleiro
    static SIDEBAR_WIDTH = 240; // Barra lateral
    static COORDINATE_BAR_SIZE = 30;

    // Janela
    static WINDOW_WIDTH = Handler.BOARD_SIZE + Handler.SIDEBAR_WIDTH + Handler.COORDINATE_BAR_SIZE * 2;
    static WINDOW_HEIGHT = Handler.BOARD_SIZE + Handler.COORDINATE_BAR_SIZE * 2;

    // Player
    static PLAYER_WHITE = 1;
    static PLAYER_BLACK = 0;

    // Deslocamento
    static X_OFFSET = 0;
    static Y_OFFSET = 0;

    // Cores
    static COLORS = {
        blue: 0x3b87eb,
        green: 0x25b350,
        yellow: 0xd6e813
    };

    static showHouse(scene, i, j, color)
    {
        const lineWidth = 1;

        return scene.add.rectangle(
            Handler.X_OFFSET + i * Handler.HOUSE_SIZE + Handler.HOUSE_SIZE / 2,
            Handler.Y_OFFSET + j * Handler.HOUSE_SIZE + Handler.HOUSE_SIZE / 2,
            Handler.HOUSE_SIZE - lineWidth,
            Handler.HOUSE_SIZE - lineWidth,
            color,
            0.2
        )
        .setStrokeStyle(lineWidth, color);
    }
}