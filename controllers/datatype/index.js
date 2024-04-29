const Metadata = require('../../models/metadata');
const DATA_TYPES = ['E4_ACC', 'E4_BVP', 'E4_EDA', 'E4_HR', 'E4_IBI', 'E4_TEMP', 'Polar_HR']

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
        returndata = await Metadata.findOne({ data_type });
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

const getDataTypeList = async (req, res, next) => {
    res.status(200).json({
        data: DATA_TYPES
    });
}

module.exports = {
    getDataTypeMetadata,
    getDataTypeList
}