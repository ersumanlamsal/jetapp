const mondayService = require('../services/monday-service');
const transformationService = require('../services/transformation-service');

async function executeAction(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;
    const { boardId, itemId, sourceColumnId, targetColumnId } = inputFields;

    const text = await mondayService.getColumnValue(shortLivedToken, itemId, sourceColumnId);
    // if (!text) {
    //   return res.status(200).send({});
    // }
    // const transformedText = transformationService.transformText(
    //   text,
    //   transformationType ? transformationType.value : 'TO_UPPER_CASE'
    // );

    // await mondayService.changeColumnValue(shortLivedToken, boardId, itemId, targetColumnId, transformedText);

    return res.status(200).send({text:text});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}

module.exports = {
  executeAction
};
