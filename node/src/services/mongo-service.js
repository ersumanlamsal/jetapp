const logService = require('../services/log-services');
const mondayData = require('../models/monday-data');

const syncWithMongo = (values, boardId, itemId) => {
    let value = { 'name': values.name };
    let data = values.column_values;
    for (let i in data) {
        switch (data[i].type) {
            case 'status':
                value[data[i].id] = data[i].label
                break;
            case 'subtasks':
                break;
            default:
                value[data[i].id] = data[i].value
                break;
        }
    }

    let fData = {
        itemId:itemId,
        boardId:boardId,
        itemData:value
    }
    const options = {
        upsert: true,
    };
    const filter = { itemId: itemId };
    mondayData.findOneAndUpdate(filter, fData, options)
        .then(updatedData => {
            console.log('Data updated successfully');
        })
        .catch(error => {
            logService.error('Error updating/adding data:', error);
        });
}

module.exports = {
    syncWithMongo
};