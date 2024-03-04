const mondayService = require('../services/monday-service');
const mongoServices = require('../services/mongo-service');

async function executeAction(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;
    const { boardId, itemId, columnId, groupId } = inputFields;

    //get changed value with respective column details
    const values = await mondayService.getChangedValue(shortLivedToken, itemId);

    // sync data with mongodb
    mongoServices.syncWithMongo(values,boardId,itemId);

    //handle duplicates
    const success = await mondayService.handleDuplicates(shortLivedToken,values,itemId,columnId,groupId,boardId);


    return res.status(200).send({message:'Action executed successfully'});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}


module.exports = {
  executeAction
};
