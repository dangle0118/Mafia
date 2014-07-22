module.exports = function (mongoose) {
  var Schema = mongoose.Schema;
  var gameProfileSchema = new Schema({
    roomName: String,
    gameCap: Number,
    currentPlayers: Array,
    gameRoles: Array,
    mafiaAmount: Number
  })
  return mongoose.model('Game', gameProfileSchema);
}