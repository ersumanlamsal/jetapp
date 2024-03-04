const mongoose = require('mongoose');
const mondayDataSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true
      },
    boardId: {
        type: String,
        required: true
      },
  itemData: mongoose.Schema.Types.Mixed
});

const mondayData = mongoose.model('mondayData', mondayDataSchema);

module.exports = mondayData;
