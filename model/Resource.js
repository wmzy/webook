var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResourceSchema = new Schema({
    url: String,
    dom: String,
    state: String,
    suffix: String,
    depth: Number
});

mongoose.model('Resource', ResourceSchema);