
const HttpError = require('../../models/http-error');
const Csv = require('../../models/csv');
const fs = require('fs');
const path = require('path');
const Metadata = require('../../models/metadata');
const BetweenDistribution = require('../../models/between-distribution')
const WithinDistribution = require('../../models/within-distribution')
const Missingness = require('../../models/missingness');
const { EMOPHONE } = require('../../constant')

const convertCsvToJSON = async (filePath) => {
    const csv = fs.readFileSync(filePath)
    const array = csv.toString().trim().split(/\r?\n|\r/);
    const header = array[0].trim().split(",");
    const rows = []

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

    return ({
        category: "sensor",
        columns: header,
        rows,
    })
}

const importData = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'k-emophone', 'dataset');
    const data_type = req.body.data_type
    fs.readdir(dataset_path, function (err, folders) {
        folders?.forEach(async function (folder) {
            try {
                const file_path = path.join(dataset_path, folder, data_type + ".csv");
                const data = await convertCsvToJSON(file_path)
                const subject_id_string = folder.replace("P", "")

                const csv = new Csv({
                    dataset_name: EMOPHONE,
                    category: data.category,
                    subject_id: parseInt(subject_id_string),
                    columns: JSON.stringify(data.columns),
                    rows: JSON.stringify(data.rows),
                    data_type: data_type,
                })

                // console.log(csv)
                await Csv.create(csv);
            } catch (err) {
                console.log(subject_id_string, data_type)
                console.log(err)
            }
        })
    })

    res.status(200).json({
        data: "success"
    });
}

const importWithinDistribution = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'k-emophone', 'statistic', 'within_distribution');
    try {
        fs.readdir(dataset_path, function (err, data_types) {
            data_types?.forEach(async function (data_type) {
                const filePath = path.join(dataset_path, data_type)
                fs.readdir(filePath, function (err, csvs) {
                    csvs?.forEach(async function (csv) {
                        try {
                            const csvPath = path.join(filePath, csv)
                            const stringJson = fs.readFileSync(csvPath)
                            const subject_id = parseInt(csv.split("_")[1])

                            const data = new WithinDistribution({
                                data_type: data_type,
                                data: stringJson.toString(),
                                dataset_name: EMOPHONE,
                                subject_id,
                            })
                            await WithinDistribution.create(data);
                        } catch {
                            (err) => {
                                console.log(err)
                            }
                        }

                    })
                })
            });

        });
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

const importBetweenDistribution = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'k-emophone', 'statistic', 'between_distribution');
    try {
        fs.readdir(dataset_path, function (err, data_types) {
            data_types?.forEach(async function (data_type) {
                const filePath = path.join(dataset_path, data_type)
                const stringJson = fs.readFileSync(filePath)
                const data = new BetweenDistribution({
                    data_type: data_type.replace(".json", ""),
                    data: stringJson.toString(),
                    dataset_name: EMOPHONE,
                })
                await BetweenDistribution.create(data);
            });

        });
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

const importMissingness = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'k-emophone', 'statistic', 'missingness');
    try {
        fs.readdir(dataset_path, function (err, data_types) {
            data_types?.forEach(async function (data_type) {
                const filePath = path.join(dataset_path, data_type)
                fs.readdir(filePath, function (err, csvs) {
                    csvs?.forEach(async function (csv) {
                        try {
                            const csvPath = path.join(filePath, csv)
                            const stringJson = fs.readFileSync(csvPath)
                            const subject_id = parseInt(csv.split("_P")[1])

                            const data = new Missingness({
                                data_type,
                                data: stringJson.toString(),
                                dataset_name: EMOPHONE,
                                subject_id,
                            })
                            // console.log(data)
                            await Missingness.create(data);
                        } catch {
                            (err) => {
                                console.log(err)
                            }
                        }

                    })
                })
            });

        });
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

const deleteCsv = async (req, res, next) => {
    const deleted = await Csv.deleteOne({
        dataset_name: EMOPHONE,
        subject_id: 1,
        data_type: "BatteryEvent"
    })

    console.log(deleted)
    res.status(200).json({
        data: "success"
    });
}

module.exports = {
    importWithinDistribution,
    importBetweenDistribution,
    importMissingness,
    importData,
    deleteCsv
}