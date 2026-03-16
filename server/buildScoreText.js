export const buildScoreText = (player1, player2) => {
    return `${player1.playerName}: ${player1.score} | ${player2.playerName}: ${player2.score}`;
}