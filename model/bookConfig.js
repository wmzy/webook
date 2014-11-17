var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookConfigSchema = new Schema({
   name: String,
   contents: [String],
   depth: Number,
   queries: [String]
});

mongoose.model('BookConfig', BookConfigSchema);