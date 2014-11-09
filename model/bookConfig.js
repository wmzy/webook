var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookConfigSchema = new Schema({
   name: String,
   seeds: [String]
});