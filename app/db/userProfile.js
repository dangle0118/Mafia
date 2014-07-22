module.exports = function (mongoose) {
  var Schema = mongoose.Schema;
  var userSchema = new Schema({
    userName: String,
    password: String,
    inState: String,
    inGame: String,
    socket: String
  });



  return mongoose.model('User', userSchema);
}