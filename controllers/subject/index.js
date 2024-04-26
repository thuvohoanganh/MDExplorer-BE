const HttpError = require('../../models/http-error');
const Csv = require('../../models/csv');
const Video = require('../../models/video');
const BetweenDistribution = require('../../models/between-distribution');

const SUBJECT_IDS = [1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]

const getSubjectMultiModalData = async (req, res, next) => {
    const subject_id = parseInt(req.params.subject_id || -1)
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

    try {
        const csv = await Csv.find({ subject_id });
        
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
    res.status(200).json({
        data: SUBJECT_IDS
    });
}

const getVideo = async (req, res, next) => {
    const subject_id = req.params.subject_id
    if (!subject_id || !SUBJECT_IDS.includes(subject_id)) {
        const error = new HttpError(
            'Could not find subject with this id ' + req.params.subject_id,
            500
        );
        return next(error);
    }

    try {
        const videos = await Video.find({ subject_id });

        res.status(200).json({
            data: videos.map(record => record.toObject({ getters: true }))
        })
    } catch (err) {
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

    if (!subject_id || !SUBJECT_IDS.includes(subject_id)) {
        const error = new HttpError(
            'Could not find subject with this subject_id',
            500
        );
        return next(error);
    }

    const returnData = {
        subject_id: subject_id,
        data_type: "",
        within_distribution: {},
        between_distribution: {},
        missingness: {}

    }
    try {
        const csv = await Csv.findOne({ subject_id, data_type });
        const betweenDistribution = await BetweenDistribution.findOne({ data_type });

        if (!csv) {
            const error = new HttpError(
                'Could not find statistic',
                500
            );
            return next(error);
        }

        returnData.data_type = csv.data_type
        returnData.within_distribution = JSON.parse(csv.within_distribution)
        returnData.missingness = JSON.parse(csv.missingness)

        if (betweenDistribution) {
            returnData.between_distribution = JSON.parse(betweenDistribution.data)
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
    try {
        const returnData = {
            data_type: data_type,
            category: "",
            subjects: [],
            columns: [],
            data: []

        }
        const csvList = await Csv.find({ data_type });
        if (csvList.lenght === 0) {
            throw ("Can not find data type " + data_type)
        }

        returnData.category = csvList[0].category
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