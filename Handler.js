class Handler
{
    // Dados do jogo
    static DIMENSION = 8;

    // Elementos do jogo
    static HOUSE_SIZE = 80; // Casa
    static PIECE_SIZE = 213; // Peça

    // Elementos da tela
    static BOARD_SIZE = Handler.HOUSE_SIZE * Handler.DIMENSION; // Tabuleiro
    static SIDEBAR_WIDTH = 240; // Barra lateral

    // Janela
    static WINDOW_WIDTH = Handler.BOARD_SIZE + Handler.SIDEBAR_WIDTH;
    static WINDOW_HEIGHT = Handler.BOARD_SIZE;

    // Player
    static PLAYER_WHITE = 0;
    static PLAYER_BLACK = 1;
}