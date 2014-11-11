var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var resourceSchema = new Schema({
    url: String,
    dom: String,
    state: String,
    suffix: String
})