
const HttpError = require('../../models/http-error');
const File = require('../../models/file');
const FileChunk = require('../../models/file-chunk');
const fs = require('fs');
const path = require('path');
const BetweenDistribution = require('../../models/between-distribution')
const WithinDistribution = require('../../models/within-distribution')
const Missingness = require('../../models/missingness');
const { EMOPHONE, EMOCON } = require('../../constant')

const convertCsvToJSON = async (filePath, subject_id_string, data_type) => {
    const csv = fs.readFileSync(filePath)
    const array = csv.toString().trim().split(/\r?\n|\r/);
    const header = array[0].trim().split(",");
    const sample_size = array.length - 1
    const chunk_size = 10000
    const chunk_qty = Math.ceil(sample_size/chunk_size)

    const file = new File({
        dataset_name: EMOPHONE,
        category: "sensor",
        subject_id: parseInt(subject_id_string),
        columns: JSON.stringify(header),
        data_type: data_type,
        chunk_qty,
        sample_size
    })
    // console.log(file)
    await File.create(file);

    try {
    for (let chunk_id = 0; chunk_id < chunk_qty; chunk_id++) {
            let chunk_rows = []
            for (let i = (chunk_id)*chunk_size+1; i <= Math.min((chunk_id+1)*chunk_size, sample_size); i++) {
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
                    chunk_rows.push(row);
                }
            }

            const end_timestamp = chunk_rows[chunk_rows.length-1]?.timestamp || 0
            const start_timestamp = chunk_rows[0].timestamp || 0

            const fileChunk = new FileChunk({
                file_id: file.toObject()._id,
                chunk_id: chunk_id,
                rows: JSON.stringify(chunk_rows),
                end_timestamp,
                start_timestamp
            })

            await FileChunk.create(fileChunk); 
        }
    } catch(err) {
        console.log(err)
        await File.deleteOne({ _id: file.toObject()._id })
    }
}

const importData = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'k-emophone', 'dataset');
    const data_type = "WiFi"
    // const folder = 'P80'
    try {
        fs.readdir(dataset_path, function (err, folders) {
            folders?.forEach(async function (folder) {
                const file_path = path.join(dataset_path, folder, data_type + ".csv");
                const subject_id_string = folder.replace("P", "")
                await convertCsvToJSON(file_path, subject_id_string, data_type)
            })
        })
    } catch(err) {
        const error = new HttpError(err, 500);
        return next(error);
    }

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
    try {
        const deleted = await Missingness.countDocuments({
            dataset_name: EMOCON,
        })
    
        const id = deleted
        // .map(e => (e.subject_id)).sort((a,b) => a-b)
        console.log(id)
        res.status(200).json({
            data: "success"
        });
    }
    catch{(err) => {
        console.log(err)
    }}
}

module.exports = {
    importWithinDistribution,
    importBetweenDistribution,
    importMissingness,
    importData,
    deleteCsv
}