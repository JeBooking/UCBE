"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLES = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please check your .env file.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// 数据库表名常量
exports.TABLES = {
    USERS: 'users',
    COMMENTS: 'comments',
    LIKES: 'likes'
};
//# sourceMappingURL=database.js.map