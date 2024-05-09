const UserLog = require('../../models/user-log');

const submitLog = async (req, res, next) => {
    const { name, information, logs } = req.body

    try {
        const data = new UserLog({
            name,
            information,
            logs
        })
        await UserLog.create(data);

        res.status(201).json({
            data: data
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            "submit fail",
            500
        );
        return next(error);
    }
}

module.exports = {
    submitLog
}