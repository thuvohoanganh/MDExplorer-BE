const HttpError = require('../../models/http-error');
const Csv = require('../../models/csv');

const SUBJECT_IDS = [1,4,5,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]

const getSubjectMultiModalData = async (req, res, next) => {
    const subject_id = req.params.subject_id
    if (!subject_id || !SUBJECT_IDS.includes(subject_id)) {
        const error = new HttpError(
            'Could not find subject with this id ' + req.params.subject_id,
            500
        );
        return next(error);
    }

    const returnData = {
        subject_id: subject_id,
        data_types: [],
        time_range: {
	        min: Date.parse(new Date()), 
            max: 0
        },
        multimodal_data: []
    }

    const csv = await Csv.find({ subject_id });

    csv.forEach((csv) => {
        const data = {
            data_type: "",
            columns: [],
            rows: [],
            category: ""
        }
        if (!returnData.data_types.includes(csv.data_type)) {
            returnData.data_types.push(csv.data_type)
        }
        
        data.data_type = csv.data_type
        data.category = csv.category
        data.columns = JSON.parse(csv.columns)
        data.rows = JSON.parse(csv.rows)

        returnData.multimodal_data.push(data)
    })
    res.status(201).json({
        data: returnData
    });
}

const getSubjectList = (req, res, next) => {
    res.status(201).json({
        data: SUBJECT_IDS
    });
}

const getDataTypeOverview = (req, res, next) => {

}

const getVideo = (req, res, next) => {

}

const getOneDataType = (req, res, next) => {

}

module.exports = {
    getSubjectMultiModalData,
    getSubjectList,
    getDataTypeOverview,
    getVideo,
    getOneDataType
}