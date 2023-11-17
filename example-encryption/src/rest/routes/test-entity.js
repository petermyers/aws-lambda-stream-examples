import { v4 } from "uuid";

export const createTestEntity = (req, res) => {
  return req.namespace.models.testEntity
    .save(v4, req.body)
    .then(() => res.status(200).json({}));
};