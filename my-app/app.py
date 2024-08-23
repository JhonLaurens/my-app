from flask import Flask, render_template, request, jsonify
from web3 import Web3

app = Flask(__name__)

# Configure the connection to the Ganache network
ganache_url = "http://127.0.0.1:7545"
w3 = Web3(Web3.HTTPProvider(ganache_url))

# Main route of the application
@app.route("/")
def index():
    return render_template("index.html")

# Route to get the balance of the connected wallet
@app.route("/balance")
def get_balance():
    address = request.args.get("address")
    if not address:
        return jsonify({"error": "Address not provided"}), 400
    balance = w3.eth.getBalance(address)
    return jsonify({"balance": w3.fromWei(balance, "ether")})

# Route to send a transaction
@app.route("/send", methods=["POST"])
def send_transaction():
    recipient = request.form.get("recipient")
    amount = request.form.get("amount")
    sender = request.form.get("sender")
    
    # Verify that all fields are filled
    if not all([recipient, amount, sender]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        # Create a transaction
        nonce = w3.eth.getTransactionCount(sender)
        tx = {
            'nonce': nonce,
            'to': recipient,
            'value': w3.toWei(amount, 'ether'),
            'gas': 21000,
            'gasPrice': w3.eth.gasPrice
        }

        # Sign the transaction with the private key of the wallet
        signed_txn = w3.eth.account.sign_transaction(tx, private_key=sender)

        # Send the transaction to the network
        tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return jsonify({"message": "Transaction sent successfully", "tx_hash": tx_hash.hex()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)