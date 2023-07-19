const db = require('../models/index');

exports.getList = async (model, condition, attributes, limit, offset, order) => {
  try {
    const list = await model.findAndCountAll({
      ...condition !== undefined && {
        where: condition
      },
      ...attributes !== undefined && {
        attributes
      },
      ...limit !== undefined && {
        limit
      },
      ...offset !== undefined && {
        offset
      },
      ...order !== undefined && {
        order
      }

    });
    return list ? JSON.parse(JSON.stringify(list)) : false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.addDetail = async (model, data, transaction) => {
  try {
    //   console.log(data);
    const addAuthInfo = await model.create(data, { transaction });
    return addAuthInfo ? JSON.parse(JSON.stringify(addAuthInfo)) : false;
  } catch (error) {
    console.log(error);
    return false;
  }
};
exports.addComplaintDetail = async (model, data , transaction ) => {

try{
const addComplaintDetail = await model.create(data, {transaction});
return addComplaintDetail ? JSON.parse(JSON.stringify(addComplaintDetail)) : false;

 } catch(error){
  console.log(error)
  return false;
 }

}

exports.updateData = async (model, data, condition, transaction) => {
  try {
    const result = await model.update(data, { where: condition }, { transaction });
    return result || false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.findByCondition = async (model, condition) => {
  try {
    const data = await model.findOne(
      { where: condition }
    );
    return data ? JSON.parse(JSON.stringify(data)) : false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.deleteQuery = async (model, condition, transaction, force = false) => {
  try {
    const data = await model.destroy(
      { where: condition, force },
      { transaction }
    );

    return data ? JSON.parse(JSON.stringify(data)) : false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.count = async (model, condition) => {
  try {
    const total = await model.count({ where: condition });
    return total ? JSON.parse(JSON.stringify(total)) : 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.getAuthDetail = async (model, condition) => {
  try {
    const { Auth } = await db.models;
    const result = await model.findOne({
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
      include: [
        {
          model: Auth,
          attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
        }
      ],
      where: condition
      // raw: true
    }
    );

    return result ? JSON.parse(JSON.stringify(result)) : false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

//for repeated data fetching or else queries