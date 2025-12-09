"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var body_parser_1 = require("body-parser");
var cheerio = require("cheerio");
var node_fetch_1 = require("node-fetch");
var fs_1 = require("fs");
var path_1 = require("path");
var app = (0, express_1.default)();
var PORT = 5000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
var RAFFLE_ADDRESS = 'QXMRTGRTCNFTPFQQKLEZGUQSQVLBBCWACWJVSNAHDCEADGKGGCCXGDSDBDSG';
var MIN_ENTRY_AMOUNT = 1000;
var RAFFLE_DATA_PATH = path_1.default.join(__dirname, 'src', 'pages', 'api', 'raffle', 'raffle_data.json');
function loadState() {
    return __awaiter(this, void 0, void 0, function () {
        var data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs_1.promises.readFile(RAFFLE_DATA_PATH, 'utf-8')];
                case 1:
                    data = _b.sent();
                    return [2 /*return*/, JSON.parse(data)];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, { roundEndsAt: Date.now() + 3600 * 1000, winner: null, entryPool: [] }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function saveState(state) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.writeFile(RAFFLE_DATA_PATH, JSON.stringify(state, null, 2))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function verifyTransaction(wallet, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, data, txs, total, _i, txs_1, tx, entries, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://explorer.qubic.org/network/address/".concat(wallet);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        return [2 /*return*/, { valid: false, entries: 0, msg: 'Failed to fetch explorer data.' }];
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    txs = (data.transactions || []).filter(function (tx) { return tx.recipient === RAFFLE_ADDRESS && Number(tx.amount) >= MIN_ENTRY_AMOUNT; });
                    total = 0;
                    for (_i = 0, txs_1 = txs; _i < txs_1.length; _i++) {
                        tx = txs_1[_i];
                        total += Number(tx.amount);
                    }
                    if (total < MIN_ENTRY_AMOUNT) {
                        return [2 /*return*/, { valid: false, entries: 0, msg: 'No valid transaction found.' }];
                    }
                    entries = Math.floor(total / MIN_ENTRY_AMOUNT);
                    return [2 /*return*/, { valid: true, entries: entries, msg: 'Transaction(s) verified.' }];
                case 4:
                    e_1 = _a.sent();
                    return [2 /*return*/, { valid: false, entries: 0, msg: e_1 instanceof Error ? e_1.message : String(e_1) }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
app.post('/api/raffle/entry', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, txId, amount, wallet, TXID_REGEX, verification, resp, html, $, amountText, txAmount, recipient, dateText, txDate, state, raffleStart, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, txId = _a.txId, amount = _a.amount, wallet = _a.wallet;
                TXID_REGEX = /^[a-z]{60}$/;
                if (!txId || typeof txId !== 'string' || !TXID_REGEX.test(txId)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid transaction ID format. Must be 60 lowercase letters.' })];
                }
                if (!amount || isNaN(Number(amount)) || Number(amount) < MIN_ENTRY_AMOUNT || Number(amount) % MIN_ENTRY_AMOUNT !== 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'Amount must be a multiple of 1000 QXMR' })];
                }
                if (!wallet || typeof wallet !== 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'Wallet address is required.' })];
                }
                // DEV MODE: skip explorer and transaction validation
                try {
                    const state = await loadState();
                    if (state.entryPool.includes(txId)) {
                        return res.status(400).json({ error: 'Transaction already used for entry' });
                    }
                    state.entryPool.push(txId);
                    await saveState(state);
                    // Google Sheets logging
                    try {
                        const { google } = require('googleapis');
                        const path = require('path');
                        const fs = require('fs');
                        const SHEET_ID = '1D4tSl_fCPA0bgR5mzECSGR_V8YBkTjA4R0one3w3ChI';
                        const SHEET_NAME = 'Sheet1';
                        const CREDENTIALS_PATH = path.resolve(process.cwd(), 'google-credentials.json');
                        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
                        const auth = new google.auth.GoogleAuth({
                            credentials,
                            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                        });
                        const sheets = google.sheets({ version: 'v4', auth });
                        const row = [new Date().toISOString(), wallet, txId, amount];
                        await sheets.spreadsheets.values.append({
                            spreadsheetId: SHEET_ID,
                            range: `${SHEET_NAME}!A:D`,
                            valueInputOption: 'USER_ENTERED',
                            requestBody: { values: [row] },
                        });
                    } catch (sheetErr) {
                        console.error('Google Sheets append error:', sheetErr);
                        // Do not fail the entry if sheet logging fails
                    }
                    return res.status(200).json({ success: true });
                } catch (e) {
                    console.error('Raffle entry error (dev mode):', e);
                    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
                }
        }
    });
}); });
app.listen(PORT, function () {
    console.log("API server running at http://localhost:".concat(PORT));
});
