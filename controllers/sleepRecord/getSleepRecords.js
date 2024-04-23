const SleepRecord = require("../../models/sleep-record");
const HttpError = require("../../models/http-error");


const getSleepRecords = async (req, res, next) => {
  const { userId } = req.userData;

  if (!req.body.start_at || !req.body.end_at) {
    const error = new HttpError("Provide start_at, end_at", 403);
    return next(error);
  }
  let records = [];
  try {
    records = await SleepRecord.find({
      time: { $gte: req.body.start_at, $lte: req.body.end_at },
      user: userId,
    }).exec();
  } catch (err) {
    console.log(err)
    const error = new HttpError("Failed to get Record", 500);
    return next(error);
  }

  res.status(200).json(records);
};

module.exports = getSleepRecords;

/**
 * @swagger
 * /api/factor/record:
 *   post:
 *     summary: get record in a range of timestamp
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               start_at: 
 *                  type: timestamp
 *               end_at:
 *                 type: timestamp
 *             example:   # Sample object
 *               start_at: 2023-07-10T13:19:13.146Z
 *               end_at: 2023-07-10T20:19:13.146Z
 *     responses:
 *          '200':
 *              description: OK
*/