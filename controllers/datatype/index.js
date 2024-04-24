const Metadata = require('../../models/metadata');

const getDataTypeMetadata = async (req, res, next) => {
    const data_type = req.body.data_type
    if (!data_type) {
        const error = new HttpError("Provide data_type", 403);
        return next(error);
    }

    let returndata = {
        data_type: data_type,
        source: "",
        description: "",
        device: "",
        sampling_rate: "",
    }

    try {
        const returndata = await Metadata.find({ data_type });
        if (!returndata) {
            const error = new HttpError(
                'Could not find metadata of data type' + req.params.data_type,
                500
            );
            return next(error);
        }
    } catch (err) {
        const error = new HttpError(
            'Get metadata fail',
            500
        );
        return next(error);
    }
    res.status(201).json({
        data: returndata.toObject({ getters: true })
    })
}

module.exports = {
    getDataTypeMetadata
}