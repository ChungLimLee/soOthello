### 🎮 [SO Othello – Unlimited Endgame Puzzle](https://github.com/ChungLimLee/soOthello)
A fully interactive Othello app in JS with unlimited endgame puzzles, study mode, puzzle sharing via link, and perfect-play solving.

- Generates **solvable endgame puzzles** from any board with 12 or more empty squares.
- Three versions of board representations:
  - A currently published version uses **1D-array** with unique optimized move generations.
  - A custom **bitboard** implementation enables compact binary operations, achieving up to **10× faster performance** than the 1D array.
  - A novel, self-developed **SO-board** that **outperforms** bitboards in certain metrics and shows potential for even greater overall speed.
- Allows **puzzle sharing via link** to LinkedIn, X (Twitter), WhatsApp, and Facebook — so users can easily share, discuss, and revisit specific puzzle states.
- Supports **undo/redo**, win/draw/loss outcome classification, and best-move exploration.
- Self-published and accepted by [https://worldothello.org.](https://www.worldothello.org/news/435/open-book-of-othello)

> ⚙️ Not just a game — a tool for strategy study and perfect-play exploration.
