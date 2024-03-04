const initMondayClient = require('monday-sdk-js');
const logService = require('../services/log-services');
const { Storage } = require('@mondaycom/apps-sdk');

/* get changed item value from monday */
const getChangedValue = async (token, itemId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);
    const query = `query {
      items (ids:[${itemId}]){
        name
        column_values {
        id
        type
        value
        ... on StatusValue {
          label
          value
        }
      }
      }
    }`;

    const response = await mondayClient.api(query);
    const value = response.data.items[0];
    return value;
  } catch (err) {
    logService.error(err);
    return {};
  }
};
/* check and handle duplicate values */

const handleDuplicates = async (token, values, itemId, columnId, groupId, boardId) => {
  try {
    let config = await getConfigurations(token);
    for (const conf of config) {
      if (conf.board.value == boardId && conf.column.value == columnId) {
        let isDup = await isDuplicate(token, values, columnId, itemId, boardId);
        if(isDup){
          await changeItemStatusAsConfig(token,values,itemId,boardId,conf.status);
          await moveItemToConfigGroup(token,itemId,conf.group.value);
        }
      }
    }
  } catch (err) {
    logService.error(err);
  }
}
/* check the status type column and change the value according to config  */
const changeItemStatusAsConfig = async (token,values,itemId,boardId,value)=>{

  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);
    let statusCol = getStatusColumn(values);
    const query = `mutation {
      change_simple_column_value (item_id:${itemId}, board_id:${boardId}, column_id:"${statusCol}", value: "${value}") {
        id
      }
    }`;
    let response = await mondayClient.api(query);

  } catch (error) {
    logService.error(error);
  }
}

/* move duplicate item to the group according to config  */

const moveItemToConfigGroup = async (token,itemId,moveGroupId)=>{
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    const query = `mutation {
      move_item_to_group (item_id: ${itemId}, group_id: "${moveGroupId}") {
        id
      }
    }`;
    await mondayClient.api(query);

  } catch (error) {
    logService.error(error);
  }
}
const isDuplicate = async (token, values, columnId, itemId, boardId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);
    let cVal = currentValue(values, columnId);
    const query = `query {
      items_page_by_column_values (limit: 100, board_id: ${boardId}, columns: [{column_id: "${columnId}", column_values: ["${cVal.value}"]}]) {
        cursor
        items {
          id
          name
        }
      }
    }`;
    const response = await mondayClient.api(query);
    console.log(itemId);
    let items = response.data.items_page_by_column_values.items;
    let dItems = items.filter(item => parseInt(item.id) != itemId);
    return dItems.length > 0 ? true : false;

  } catch (error) {
    logService.error(error);
    return false;
  }

}
const currentValue = (values, columnId) => {
  let data = values.column_values;
  let value = {};
  for (let i in data) {
    if (data[i].type == 'status' && data[i].id == columnId) {
      value['value'] = data[i].label
      value['type'] = data[i].type
    }
    else if (data[i].type == 'email' && data[i].id == columnId) {
      value['value'] = JSON.parse(data[i].value).email
      value['type'] = data[i].type
    }
    else if (data[i].type == 'numbers' && data[i].id == columnId) {
      value['value'] = parseInt(data[i].value.replace(/"/g, ''))
      value['type'] = data[i].type
    }
    else if (data[i].id == columnId) {
      value['value'] = data[i].value
      value['type'] = data[i].type
    }
  }
  return value;

}
const getStatusColumn = (values) => {
  let data = values.column_values;
  for (let i in data) {
    if (data[i].type == 'status') {
      return data[i].id;
    }
  }
  return '';

}

const getConfigurations = async (token) => {
  try {
    const storage = new Storage(token);
    let config = await storage.get('jetappConfig');
    config = JSON.parse(config.value);
    return config;

  }
  catch (err) {
    logService.error(err);
    return [];
  }

}

module.exports = {
  getChangedValue,
  handleDuplicates
};
