const HttpError = require('../../models/http-error');
const Csv = require('../../models/csv');
const Video = require('../../models/video');
const fs = require('fs');
const path = require('path');
const SUBJECT_IDS = [1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]

const getSubjectMultiModalData = async (req, res, next) => {
    const subject_id = parseInt(req.params.subject_id || 0)
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
                category: ""
            }
            if (!returnData.data_types.includes(csv.data_type)) {
                returnData.data_types.push(csv.data_type)
            }

            data.data_type = csv.data_type
            data.category = csv.category
            data.columns = JSON.parse(csv.columns)
            data.rows = JSON.parse(csv.rows)

            //START - Find Min, Max of time range
            const timeColumnIndex = data.columns.findIndex((e) => e === "timestamp")
            const rowNumber = data.rows.length
            if (timeColumnIndex > -1 && rowNumber > 0) {
                if (data.rows[0][timeColumnIndex] < returnData.time_range.min) {
                    returnData.time_range.min = data.rows[0][timeColumnIndex]
                }
                if (data.rows[rowNumber - 1][timeColumnIndex] > returnData.time_range.max) {
                    returnData.time_range.max = data.rows[rowNumber - 1][timeColumnIndex]
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
    const subject_id = req.params.subject_id
    const data_type = req.params.data_type

    if (!subject_id || !SUBJECT_IDS.includes(subject_id)) {
        const error = new HttpError(
            'Could not find subject with this id ' + req.params.subject_id,
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
        returnData.between_distribution = JSON.parse(csv.between_distribution.data)

        res.status(200).json({
            data: returnData
        })
    } catch (err) {
        const error = new HttpError(
            "Get statistic fail",
            500
        );
        return next(error);
    }
}

const getOneDataType = (req, res, next) => {

}

const importData = async (req, res, next) => {
    const subject_id = req.params.subject_id
    const dataset_path = path.join(__dirname, '..', '..', 'dataset', 'e4_data');
    const subject_path = path.join(dataset_path, subject_id)
    try {
        const data = await convertCsvToJSON(subject_path, subject_id)

        const csvList = data.map(datatype => {
            return new Csv({
                category: datatype.category,
                subject_id: datatype.subject_id,
                columns: JSON.stringify(datatype.columns),
                rows: JSON.stringify(datatype.rows),
                data_type: datatype.data_type
            })
        })
        await Csv.create(csvList);
        res.status(200).json({
            data: "success"
        });
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'import fail',
            500
        );
        return next(error);
    }
}

const convertCsvToJSON = (_dir, subject_id) =>
    new Promise((resolve, reject) => {
        const returnData = []
        fs.readdir(_dir, function (err, files) {
            if (err) {
                reject("path is not right")
            }

            files?.forEach(function (file) {
                const filePath = path.join(_dir, file)
                const csv = fs.readFileSync(filePath)
                const array = csv.toString().trim().split(/\r?\n|\r/);
                const header = array[0].trim().split(",");
                const rows = []

                const TypeError = []
                for (let i = 1; i < array.length; i++) {
                    const currentLine = array[i].split(",");

                    if (currentLine.length === header.length) {
                        const row = {};
                        for (let j = 0; j < header.length; j++) {
                            let value = currentLine[j].trim()
                            if (isNaN(value)) {
                                row[header[j].trim()] = value;
                            } else {
                                row[header[j].trim()] = parseFloat(value);
                            }
                        }
                        rows.push(row);
                    }
                }

                returnData.push({
                    category: "sensor",
                    subject_id,
                    columns: header,
                    rows,
                    data_type: file.replace('.csv', '').replace('E4_', '')
                })
            });
            resolve(returnData)
        });
    })

module.exports = {
    getSubjectMultiModalData,
    getSubjectList,
    getVideo,
    getOneDataType,
    getStatistic,
    importData
}