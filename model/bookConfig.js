var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookConfigSchema = new Schema({
   name: String,
   seeds: [String],
   depth: Number,
   queries: [String]
});

mongoose.model('BookConfig', BookConfigSchema);