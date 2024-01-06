import { v4 } from "uuid";

export const createTestEntity = (req, res) => {
  return req.namespace.models.testEntity
    .create(req.body)
    .then((entity) => res.status(200).json(entity));
};

export const getTestEntity = (req, res) => {
  return req.namespace.models.testEntity
    .get(req.params.id)
    .then((entity) => {
      if(entity) {
        res.status(200).json(entity);
      } else {
        res.error(404, 'Not Found');
      }
    });
};

export const updateTestEntity = (req, res) => {
  return req.namespace.models.testEntity
    .update(req.params.id, req.body)
    .then((entity) => res.status(200).json(entity));
};

export const deleteTestEntity = (req, res) => {
  return req.namespace.models.testEntity
    .delete(req.params.id)
    .then(() => res.status(200).json({}));
};

export const listTestEntities = (req, res) => {
  return req.namespace.models.testEntity
    .list(req.query.limit, req.query.offset)
    .then((data) => res.status(200).json(data));
};