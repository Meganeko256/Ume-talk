let deck;
let userHand = [];
let aiHand = [];
let userScore = 0;
let aiScore = 0;
let gameActive = false;
let aiVisibleCards = 1; // 最初はAIの1枚だけ見える

// デッキを作成
function createDeck() {
  const suits = ['♥', '♦', '♣', '♠'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value: value, suit: suit });
    }
  }
  return deck;
}

// デッキをシャッフル
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
  }
  return deck;
}

// カードを1枚引く
function dealCard(hand) {
  const card = deck.pop();
  hand.push(card);
}

// 手札のスコアを計算
function calculateScore(hand) {
  let score = 0;
  let aceCount = 0;

  for (let card of hand) {
    if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;  // 'J', 'Q', 'K' はすべて 10 点
    } else if (card.value === 'A') {
      score += 11;  // 'A' は最初 11 点として計算
      aceCount++;
    } else {
      score += parseInt(card.value);  // 数字カードはその値を加算
    }
  }

  // エースを調整
  while (score > 21 && aceCount > 0) {
    score -= 10;  // エースを 11 点から 1 点に調整
    aceCount--;
  }

  return score;
}


// UIを更新
function updateUI() {
  // ユーザーの手札表示
  document.getElementById('user-cards').innerText = 'あなたの手: ' + userHand.map(card => card.value + card.suit).join(' ');
  document.getElementById('user-score').innerText = 'あなたのスコア: ' + userScore;

  // AIの手札表示（AIの最初のカードのみ表示）
  let aiCardsToShow = aiHand.slice(0, aiVisibleCards); // 表示するAIのカード
  document.getElementById('ai-cards').innerText = 'AIの手: ' + aiCardsToShow.map(card => card.value + card.suit).join(' ');

  document.getElementById('ai-score').innerText = 'AIのスコア: ' + (aiVisibleCards === 1 ? '?' : aiScore);
}

// ゲームを開始
function startGame() {
  deck = shuffleDeck(createDeck());
  userHand = [];
  aiHand = [];
  userScore = 0;
  aiScore = 0;
  gameActive = true;
  aiVisibleCards = 1; // AIのカード表示を最初は1枚に設定

  // 最初のカードを配る
  dealCard(userHand);
  dealCard(aiHand);
  dealCard(userHand);
  dealCard(aiHand);

  userScore = calculateScore(userHand);
  aiScore = calculateScore(aiHand);

  // UI更新
  updateUI();
  document.getElementById('game-container').style.display = 'block';
  document.getElementById('hit-btn').disabled = false;
  document.getElementById('stand-btn').disabled = false;
  document.getElementById('new-game-btn').style.display = 'none';  // 新しいゲームボタンを非表示
  document.getElementById('exit-game-btn').style.display = 'inline-block'; // 終了ボタンを表示
}

// ヒット（カードを引く）
function hit() {
  if (gameActive) {
    dealCard(userHand);
    userScore = calculateScore(userHand);
    updateUI();

    if (userScore > 21) {
      endGame("あなたの負け!");
    }
  }
}

// スタンド（カードを引かない）
function stand() {
  if (gameActive) {
    // ユーザーがスタンドしたら、AIのターンを開始
    aiVisibleCards = aiHand.length; // スタンドしたタイミングでAIの全てのカードを表示
    aiScore = calculateScore(aiHand);

    // AIのターン: AIが17以上になるまでカードを引く
    while (aiScore < 17) {
      dealCard(aiHand);
      aiScore = calculateScore(aiHand);
    }

    updateUI();  // AIのカードが全て見えるように更新

    // 勝敗の判定
    if (aiScore > 21) {
      endGame("AIの負け! AIはバーストしました。");
    } else if (userScore > aiScore) {
      endGame("あなたの勝ち!");
    } else if (userScore < aiScore) {
      endGame("あなたの負け!");
    } else {
      endGame("引き分け!");
    }
  }
}

// ゲームの終了
function endGame(message) {
  gameActive = false;
  alert(message);
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
  document.getElementById('new-game-btn').style.display = 'inline-block';
  document.getElementById('exit-game-btn').style.display = 'none'; // 終了ボタンを非表示
}

// 終了ボタンが押されたときの処理
function exitGame() {
  if (gameActive) {
    gameActive = false;
    alert("ゲームを終了しました。");
    document.getElementById('game-container').style.display = 'none';  // ゲームUIを非表示
    document.getElementById('exit-game-btn').style.display = 'none';  // 終了ボタンを非表示
  }
}

// AIのメッセージ表示
function aiMessage(message) {
  const aiMessageElement = document.createElement("div");
  aiMessageElement.classList.add("message", "ai-message");
  aiMessageElement.innerHTML = `<p class="message-text">${message}</p>`;
  document.querySelector(".chat-box").appendChild(aiMessageElement);
  document.querySelector(".chat-box").scrollTop = document.querySelector(".chat-box").scrollHeight;
}

// ユーザーのメッセージをチェック
document.querySelector(".send-btn").addEventListener("click", function() {
  const inputField = document.querySelector(".input-field");
  const userMessage = inputField.value.trim();
  if (userMessage) {
    // ユーザーのメッセージを画面に表示
    const userMessageElement = document.createElement("div");
    userMessageElement.classList.add("message", "user-message");
    userMessageElement.innerHTML = `<p class="message-text">${userMessage}</p>`;
    document.querySelector(".chat-box").appendChild(userMessageElement);
    inputField.value = "";
    document.querySelector(".chat-box").scrollTop = document.querySelector(".chat-box").scrollHeight;

    // ユーザーが「ブラックジャック」と言った場合にゲームを開始
    if (userMessage.includes("/ブラックジャック")) {
      aiMessage("ブラックジャックのゲームを開始します。");
      startGame();
    }
  }
});