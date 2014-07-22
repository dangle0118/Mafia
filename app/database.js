var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Mafia');

exports.User = require('../app/db/userProfile')(mongoose);
exports.Game = require('../app/db/gameProfile')(mongoose);
exports.GameProcess = require('../app/db/gameProcess');
