const { DATA_TYPES } = require('../../constant');
const Metadata = require('../../models/metadata');
const HttpError = require('../../models/http-error');

const getDataTypeMetadata = async (req, res, next) => {
    const dataset_name = req.body.dataset_name

    const data_type = req.body.data_type
    if (!data_type) {
        const error = new HttpError("Provide data_type", 403);
        return next(error);
    }

    let returndata = {
        dataset_name,
        data_type: data_type,
        source: "",
        description: "",
        device: "",
        sampling_rate: "",
    }

    try {
        returndata = await Metadata.findOne({ data_type, dataset_name });
        if (!returndata) {
            const error = new HttpError(
                'Could not find metadata of given data_type or dataset_name',
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
    const datasetName = req.body.dataset_name
    const datatypes = DATA_TYPES[datasetName]

    if (!datatypes) {
        const error = new HttpError(
            'add file fail' + datasetName,
            500
        );
        return next(error);
    }

    res.status(200).json({
        data: datatypes
    });
}

module.exports = {
    getDataTypeMetadata,
    getDataTypeList
}