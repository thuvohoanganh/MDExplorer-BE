const HttpError = require('../../models/http-error');
const Csv = require('../../models/csv');
const fs = require('fs');
const path = require('path');
const Metadata = [];
const BetweenDistribution = []
const missingness = []
const within_distrubution = []
// const Metadata = require('../../models/metadata');
// const BetweenDistribution = require('../../models/between-distribution')
// const missingness = require('../../dataset/statistic/missingness/gather.json')
// const within_distrubution = require('../../dataset/statistic/within_distrubution/gather.json')
const folders = ['Attention', 'BrainWave', 'E4_ACC', 'E4_BVP', 'E4_EDA', 'E4_HR', 'E4_IBI', 'E4_TEMP', 'Meditation', 'Polar_HR']

const importData = async (req, res, next) => {
    const subject_id = req.params.subject_id
    const dataset_path = path.join(__dirname, '..', '..', 'dataset', 'e4_data');
    const subject_path = path.join(dataset_path, subject_id)
    try {
        const data = await convertCsvToJSON(subject_path, subject_id)

        const csvList = data.map(datatype => {
            const missingnessJson = {
                data: missingness?.[datatype.data_type]?.[subject_id] || []
            }

            return new Csv({
                category: datatype.category,
                subject_id: datatype.subject_id,
                columns: JSON.stringify(datatype.columns),
                rows: JSON.stringify(datatype.rows),
                data_type: datatype.data_type,
                missingness: JSON.stringify(missingnessJson),
                within_distribution: JSON.stringify(within_distrubution?.[datatype.data_type]?.[subject_id])
            })
        })
        // console.log(csvList)
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
                    data_type: file.replace('.csv', '')
                })
            });
            resolve(returnData)
        });
    })

const gatherMissing = (req, res, next) => {
    const data_type = 'Polar_HR'
    const data = {
        [data_type]: {}
    }
    const statistic = path.join(__dirname, '..', '..', 'dataset', 'statistic', 'missingness');
    const dataset_path = path.join(statistic, data_type);
    fs.readdir(dataset_path, function (err, files) {
        if (err) {
            console.log(err)
            return
        }

        files?.forEach(function (file) {
            const filePath = path.join(dataset_path, file)
            const stringJson = fs.readFileSync(filePath)
            const missing = JSON.parse(stringJson)
            const subject_id = file.replace(data_type + "_", '').replace(".json", '')
            data[data_type][subject_id] = missing.data
        });
        console.log(data)

        fs.writeFile(path.join(statistic, "missingness.json"), JSON.stringify(data, null, 2), (error) => {
            if (error) {
                console.log('An error has occurred ', error);
                return;
            }
            console.log('Data written successfully to disk');
        });
    });
    res.status(200).json({
        data: "success"
    });
}

const gatherWithin = async (req, res, next) => {
    const statistic = path.join(__dirname, '..', '..', 'dataset', 'statistic', 'within_distrubution');

    const final_data = {}
    folders.forEach(async (data_type, i) => {
        const dataset_path = path.join(statistic, data_type);

        const one_data_type = await new Promise((resolve, reject) => {
            const data = {}
            fs.readdir(dataset_path, function (err, files) {
                files?.forEach(async function (file) {
                    const filePath = path.join(dataset_path, file)
                    const stringJson = fs.readFileSync(filePath)
                    const missing = JSON.parse(stringJson)
                    const subject_id = file.replace(data_type + "_", '').replace(".json", '')
                    data[subject_id] = missing
                });

                resolve(data)
            });
        })

        // console.log("final_data", final_data)
        final_data[data_type] = one_data_type

        if (i === folders.length - 1) {
            fs.writeFile(path.join(statistic, "temp_ouput.json"), JSON.stringify(final_data, null, 2), (error) => {
                if (error) {
                    console.log('An error has occurred ', error);
                    return;
                }
                console.log('Data written successfully to disk');
            });
            res.status(200).json({
                data: "success"
            });
        }
    })
}

const importMetadata = async (req, res, next) => {
    const metadata = req.body
    try {
        const metadataList = metadata.map(e => {
            return new Metadata({
                source: e.source,
                data_type: e.data_type,
                description: e.description,
                device: e.device,
                sampling_rate: e.sampling_rate,
            })
        })
        await Metadata.create(metadataList);

        res.status(201).json({
            data: "import success"
        })
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
    const statistic = path.join(__dirname, '..', '..', 'dataset', 'statistic', 'between_distribution');

    folders.forEach(async (data_type) => {
        const filePath = path.join(statistic, data_type+".json")
        const stringJson = fs.readFileSync(filePath)
        const data = new BetweenDistribution({
            data_type: data_type,
            data: stringJson.toString(),
        }) 
        await BetweenDistribution.create(data);
    })

    res.status(201).json({
        data: "import success"
    })
}

module.exports = {
    importData,
    gatherMissing,
    gatherWithin,
    importMetadata,
    importBetweenDistribution
}