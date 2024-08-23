const connectButton = document.getElementById('connectButton');
const walletInfo = document.getElementById('wallet-info');
const walletAddress = document.getElementById('wallet-address');
const walletBalance = document.getElementById('wallet-balance');
const refreshBalanceButton = document.getElementById('refreshBalance');
const transactionForm = document.getElementById('transaction-form');
const sendForm = document.getElementById('send-form');
const recipientInput = document.getElementById('recipient');
const amountInput = document.getElementById('amount');

let web3;

// Function to connect the wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      walletAddress.textContent = accounts[0];
      walletInfo.style.display = 'block';
      transactionForm.style.display = 'block';
      updateBalance();
    } catch (error) {
      console.error(error);
    }
  } else {
    alert('Please install MetaMask!');
  }
}

// Function to update the balance
async function updateBalance() {
  try {
    const address = walletAddress.textContent;
    const balance = await fetch(`/balance?address=${address}`);
    const balanceData = await balance.json();
    walletBalance.textContent = balanceData.balance;
  } catch (error) {
    console.error(error);
  }
}

// Function to send a transaction
async function sendTransaction(event) {
  event.preventDefault();
  try {
    const recipient = recipientInput.value;
    const amount = amountInput.value;
    const sender = walletAddress.textContent;
    const response = await fetch('/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `recipient=${recipient}&amount=${amount}&sender=${sender}`
    });
    const data = await response.json();
    if (data.message) {
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
  }
}

// Event listeners
connectButton.addEventListener('click', connectWallet);
refreshBalanceButton.addEventListener('click', updateBalance);
sendForm.addEventListener('submit', sendTransaction);