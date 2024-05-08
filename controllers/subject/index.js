const HttpError = require('../../models/http-error');
const Csv = require('../../models/csv');
const Video = require('../../models/video');
const BetweenDistribution = require('../../models/between-distribution');
const { SUBJECT_IDS } = require('../../constant')
const WithinDistribution = require('../../models/within-distribution')
const Missingness = require('../../models/missingness');

const getSubjectMultiModalData = async (req, res, next) => {
    const subject_id = parseInt(req.body.subject_id || -1)
    const dataset_name = req.body.dataset_name
    const datatypes = req.body.data_types

    if (!subject_id) {
        const error = new HttpError(
            'Could not find subject with given subject_id and dataset_name ',
            500
        );
        return next(error);
    }

    const returnData = {
        dataset_name,
        subject_id: subject_id,
        data_types: [],
        time_range: {
            min: Date.parse(new Date()),
            max: 0
        },
        multimodal_data: []
    }

    try {
        const filter = datatypes? ({ 
                subject_id, 
                dataset_name, 
                data_type: { $in: datatypes }
            }) : ({
                subject_id, 
                dataset_name,
            })
        const csv = await Csv.find(filter);
        
        csv.forEach((csv) => {
            const data = {
                data_type: "",
                columns: [],
                rows: [],
                category: "",
            }
            if (!returnData.data_types.includes(csv.data_type)) {
                returnData.data_types.push(csv.data_type)
            }

            data.data_type = csv.data_type
            data.category = csv.category
            data.columns = JSON.parse(csv.columns)
            data.rows = JSON.parse(csv.rows)

            //START - Find Min, Max of time range
            const rowNumber = data.rows.length
            if (rowNumber > 0) {
                if (data.rows[0]["timestamp"] < returnData.time_range.min) {
                    returnData.time_range.min = data.rows[0]["timestamp"]
                }
                if (data.rows[rowNumber - 1]["timestamp"] > returnData.time_range.max) {
                    returnData.time_range.max = data.rows[rowNumber - 1]["timestamp"]
                }
            }
            //END - Find Min, Max of time range

            returnData.multimodal_data.push(data)
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            "Parse data fail",
            500
        );
        return next(error);
    }

    res.status(200).json({
        data: returnData
    });
}

const getSubjectList = (req, res, next) => {
    const dataset_name = req.body.dataset_name

    res.status(200).json({
        data: SUBJECT_IDS?.[dataset_name] || []
    });
}

const getVideo = async (req, res, next) => {
    const subject_id = req.body.subject_id
    const dataset_name = req.body.dataset_name

    if (!subject_id) {
        const error = new HttpError(
            'Could not find subject with this id ' + req.params.subject_id,
            500
        );
        return next(error);
    }

    try {
        const videos = await Video.find({ subject_id, dataset_name });

        res.status(200).json({
            data: videos.map(record => record.toObject({ getters: true }))
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            "Get video fail",
            500
        );
        return next(error);
    }
}

const getStatistic = async (req, res, next) => {
    const subject_id = parseInt(req.body.subject_id || -1)
    const data_type = req.body.data_type
    const dataset_name = req.body.dataset_name

    if (!subject_id) {
        const error = new HttpError(
            'Could not find subject with this subject_id',
            500
        );
        return next(error);
    }

    const returnData = {
        dataset_name,
        subject_id: subject_id,
        data_type: "",
        within_distribution: {},
        between_distribution: {},
        missingness: {}

    }
    try {
        const withinDistribution = await WithinDistribution.findOne({ subject_id, data_type, dataset_name });
        const betweenDistribution = await BetweenDistribution.findOne({ data_type, dataset_name });
        const missingness = await Missingness.findOne({ subject_id, data_type, dataset_name });

        if (betweenDistribution) {
            returnData.between_distribution = JSON.parse(betweenDistribution.data)
        }
        if (withinDistribution) {
            returnData.within_distribution = JSON.parse(withinDistribution.data)
        }
        if (missingness) {
            returnData.missingness = JSON.parse(missingness.data)
        }

        res.status(200).json({  
            data: returnData
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            "Get statistic fail",
            500
        );
        return next(error);
    }
}

const getOneDataType = async (req, res, next) => {
    const data_type = req.body.data_type
    const dataset_name = req.body.dataset_name
    const subject_ids = req.body.subject_ids

    try {
        const returnData = {
            data_type: data_type,
            category: "",
            subjects: [],
            columns: [],
            data: [],
            dataset_name
        }

        const filter = subject_ids? ({ 
            data_type, dataset_name, subject_id: { $in: subject_ids }
        }) : ({
            data_type, dataset_name,
        })

        const csvList = await Csv.find(filter);

        if (csvList.length > 0) {
            returnData.category = csvList[0].category || ""
            returnData.columns = JSON.parse(csvList[0].columns)
    
            csvList.forEach((csv) => {
                if (!returnData.subjects.includes(csv.subject_id)) {
                    returnData.subjects.push(csv.subject_id)
                }
    
                returnData.data.push({
                    subject_id: csv.subject_id,
                    rows: JSON.parse(csv.rows)
                })
            })
        }

        res.status(200).json({
            data: returnData
        })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            "Get data type fail",
            500
        );
        return next(error);
    }
}

module.exports = {
    getSubjectMultiModalData,
    getSubjectList,
    getVideo,
    getOneDataType,
    getStatistic,
}