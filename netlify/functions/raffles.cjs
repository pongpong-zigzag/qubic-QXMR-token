exports.handler = async function(event, context) {
    const raffles = [{"id":"0","title":"100,000 Qubic Raffle","description":"Win 100,000 Qubic!","imageUrl":"/assets/prize 1.jpeg","raffleAddress":"RAFFLEYKTWEOVAFFTHXUITASVSSAUUMNMWXQPQOGZECBVQZWHFNHNYFHJNKO","prizeType":"Qubic","prizeValue":100000,"selectedToken":"Qubic","entryAmount":1,"status":"pending","entries":[]},{"id":"1","title":"10,000,000 Qubic Raffle","description":"Win 10,000,000 Qubic!","imageUrl":"/assets/prize 2.jpeg","raffleAddress":"RAFFLEYKTWEOVAFFTHXUITASVSSAUUMNMWXQPQOGZECBVQZWHFNHNYFHJNKO","prizeType":"Qubic","prizeValue":10000000,"selectedToken":"Qubic","entryAmount":1000,"status":"pending","entries":[]},{"id":"2","title":"100,000,000 Qubic Raffle","description":"Win 100,000,000 Qubic!","imageUrl":"/assets/prize 3.jpeg","raffleAddress":"RAFFLEYKTWEOVAFFTHXUITASVSSAUUMNMWXQPQOGZECBVQZWHFNHNYFHJNKO","prizeType":"Qubic","prizeValue":100000000,"selectedToken":"Qubic","entryAmount":10000,"status":"pending","entries":[]},{"id":"3","title":"100,000,000 Qubic Raffle","description":"Win 100,000,000 Qubic!","imageUrl":"/assets/prize 4.jpeg","raffleAddress":"RAFFLEYKTWEOVAFFTHXUITASVSSAUUMNMWXQPQOGZECBVQZWHFNHNYFHJNKO","prizeType":"Qubic","prizeValue":100000000,"selectedToken":"Qubic","entryAmount":50000,"status":"pending","entries":[]},{"id":"4","title":"Qswap Share Raffle","description":"Win 1 Qswap Share!","imageUrl":"/assets/prize 5.jpeg","raffleAddress":"RAFFLEYKTWEOVAFFTHXUITASVSSAUUMNMWXQPQOGZECBVQZWHFNHNYFHJNKO","prizeType":"Qubic Asset","selectedQubicAsset":"QSWAP","prizeValue":1000000,"selectedToken":"Qubic","entryAmount":100000,"status":"pending","entries":[]},{"id":"5","title":"HASHWallet Raffle","description":"Win 1 HASHWallet!","imageUrl":"/assets/prize 6.jpeg","raffleAddress":"RAFFLEYKTWEOVAFFTHXUITASVSSAUUMNMWXQPQOGZECBVQZWHFNHNYFHJNKO","prizeType":"Actual Item","actualItemDescription":"HASHWallet","prizeValue":500000,"selectedToken":"CfB","entryAmount":10,"status":"pending","entries":[]}];

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(raffles),
    };
};
