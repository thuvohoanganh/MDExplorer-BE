const HttpError = require('../../models/http-error');
const Csv = require('../../models/csv');
const fs = require('fs');
const path = require('path');

const Metadata = require('../../models/metadata');
const BetweenDistribution = require('../../models/between-distribution')
const WithinDistribution = require('../../models/within-distribution')
const Video = require('../../models/video');
const Missingness = require('../../models/missingness');
const { SUBJECT_IDS } = require('../../constant')

const missingness = []
const within_distrubution = []
// const missingness = require('../../dataset/statistic/missingness/missingness.json')
// const within_distrubution = require('../../dataset/statistic/within_distrubution/within_distribution.json')

const folders = ['Attention', 'BrainWave', 'E4_ACC', 'E4_BVP', 'E4_EDA', 'E4_HR', 'E4_IBI', 'E4_TEMP', 'Meditation', 'Polar_HR']
const { EMOCON } = require('../../constant')

const importData = async (req, res, next) => {
    const subject_id = req.params.subject_id
    const dataset_path = path.join(__dirname, '..', '..', 'dataset', 'e4_data');
    const subject_path = path.join(dataset_path, subject_id)
    try {
        const data = await convertCsvToJSON(subject_path, subject_id)

        const csvList = data.map(datatype => {
            return new Csv({
                dataset_name: EMOCON,
                category: datatype.category,
                subject_id: datatype.subject_id,
                columns: JSON.stringify(datatype.columns),
                rows: JSON.stringify(datatype.rows),
                data_type: datatype.data_type,
                missingness: JSON.stringify(missingness?.[datatype.data_type]?.[subject_id]),
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
                signal_range: e.signal_range,
                dataset_name: EMOCON
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

    [folders,
        'external_annotations', 'partner_annotations', 'self_annotations'].forEach(async (data_type) => {
            const filePath = path.join(statistic, data_type + ".json")
            const stringJson = fs.readFileSync(filePath)
            const data = new BetweenDistribution({
                data_type: data_type,
                data: stringJson.toString(),
                dataset_name: EMOCON,
            })
            await BetweenDistribution.create(data);
        })

    res.status(201).json({
        data: "import success"
    })
}

const importWithinDistribution = async (req, res, next) => {
    const statistic = path.join(__dirname, '..', '..', 'dataset', 'statistic', 'within_distrubution');

    folders.forEach(async (folder) => {
        const folderPath = path.join(statistic, folder)
        try {
            fs.readdir(folderPath, function (err, files) {
                files?.forEach(async function (file) {
                    const filePath = path.join(folderPath, file)
                    const stringJson = fs.readFileSync(filePath)
                    const subject_id = parseInt(file.replace(`${folder}_`, "").replace(".json", ""))
                    const data = new WithinDistribution({
                        data_type: folder,
                        data: stringJson.toString(),
                        dataset_name: EMOCON,
                        subject_id,
                    })
                    await WithinDistribution.create(data);
                    // console.log(data)
                });
            });
        } catch {
            (err) => {
                console.log(err)
            }
        }

    })

    const partnerPath = path.join(statistic, 'partner_annotations')
    fs.readdir(partnerPath, function (err, files) {
        files?.forEach(async function (file) {
            const filePath = path.join(partnerPath, file)
            const stringJson = fs.readFileSync(filePath)
            const subject_id = parseInt(file.split("_")[1])

            const data = new WithinDistribution({
                data_type: "partner_annotations",
                data: stringJson.toString(),
                dataset_name: EMOCON,
                subject_id,
            })
            await WithinDistribution.create(data);
            // console.log(subject_id)
        });

    });

    const selfPath = path.join(statistic, 'self_annotations')
    fs.readdir(selfPath, function (err, files) {
        files?.forEach(async function (file) {
            const filePath = path.join(selfPath, file)
            const stringJson = fs.readFileSync(filePath)
            const subject_id = parseInt(file.split("_")[1])

            const data = new WithinDistribution({
                data_type: "self_annotations",
                data: stringJson.toString(),
                dataset_name: EMOCON,
                subject_id,
            })
            await WithinDistribution.create(data);
            // console.log(data)
        });

    });

    const externalPath = path.join(statistic, 'external_annotations')
    fs.readdir(externalPath, function (err, files) {
        files?.forEach(async function (file) {
            const filePath = path.join(externalPath, file)
            const stringJson = fs.readFileSync(filePath)
            const subject_id = parseInt(file.split("_")[1])
            const external_id = parseInt(file.split(".R")[1].split("_")[0])

            const data = new WithinDistribution({
                data_type: `external_annotations_${external_id}`,
                data: stringJson.toString(),
                dataset_name: EMOCON,
                subject_id,
            })
            await WithinDistribution.create(data);
            // console.log(data)
        });

    });

    res.status(201).json({
        data: "import success"
    })
}

const importMissingness = async (req, res, next) => {
    const statistic = path.join(__dirname, '..', '..', 'dataset', 'statistic', 'missingness');

    folders.forEach(async (folder) => {
        const folderPath = path.join(statistic, folder)
        try {
            fs.readdir(folderPath, function (err, files) {
                files?.forEach(async function (file) {
                    const filePath = path.join(folderPath, file)
                    const stringJson = fs.readFileSync(filePath)
                    const subject_id = parseInt(file.replace(`${folder}_`, "").replace(".json", ""))
                    const data = new Missingness({
                        data_type: folder,
                        data: stringJson.toString(),
                        dataset_name: EMOCON,
                        subject_id,
                    })
                    await Missingness.create(data);
                    // console.log(data)
                });
            });
        } catch {
            (err) => {
                console.log(err)
            }
        }

    })

    const partnerPath = path.join(statistic, 'partner_annotations')
    fs.readdir(partnerPath, function (err, files) {
        files?.forEach(async function (file) {
            const filePath = path.join(partnerPath, file)
            const stringJson = fs.readFileSync(filePath)
            const subject_id = parseInt(file.split("P")[1].split(".")[0])

            const data = new Missingness({
                data_type: "partner_annotations",
                data: stringJson.toString(),
                dataset_name: EMOCON,
                subject_id,
            })
            await Missingness.create(data);
            // console.log(data)
        });

    });

    const selfPath = path.join(statistic, 'self_annotations')
    fs.readdir(selfPath, function (err, files) {
        files?.forEach(async function (file) {
            const filePath = path.join(selfPath, file)
            const stringJson = fs.readFileSync(filePath)
            const subject_id = parseInt(file.split("P")[1].split(".")[0])

            const data = new Missingness({
                data_type: "self_annotations",
                data: stringJson.toString(),
                dataset_name: EMOCON,
                subject_id,
            })
            await Missingness.create(data);
            // console.log(data)
        });

    });

    const externalPath = path.join(statistic, 'external_annotations')
    fs.readdir(externalPath, function (err, files) {
        files?.forEach(async function (file) {
            const filePath = path.join(externalPath, file)
            const stringJson = fs.readFileSync(filePath)
            const subject_id = parseInt(file.replace("P", "").split(".")[0])
            const external_id = parseInt(file.split(".R")[1])

            const data = new Missingness({
                data_type: `external_annotations_${external_id}`,
                data: stringJson.toString(),
                dataset_name: EMOCON,
                subject_id,
            })
            await Missingness.create(data);
            // console.log(data)
        });

    });

    res.status(201).json({
        data: "import success"
    })
}

const addField = async (req, res, next) => {
    const dataset_name = EMOCON
    try {
        const update = await WithinDistribution.updateMany(
            {},
            {
                dataset_name
            }
        );

        console.log(update)
    } catch {
        (err) => {
            console.log(err)
        }
    }


    res.status(201).json({
        data: "addField success"
    })
}

const importVideo = async (req, res, next) => {
    const videos = req.body
    try {
        const videosList = videos.map(e => {
            return new Video({
                "source": e.source,
                "name": e.name,
                "subject_id": e.subject_id,
                "dataset_name": e.dataset_name
            })
        })
        await Video.create(videosList);

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

const removeColumn = async (req, res, next) => {
    const statistic = path.join(__dirname, '..', '..', 'dataset', 'e4_data');

    try {

        // SUBJECT_IDS[EMOCON]
        SUBJECT_IDS[EMOCON].map(e => e.toString()).forEach(async (subject_id, i) => {
            const dataset_path = path.join(statistic, subject_id);

            fs.readdir(dataset_path, function (err, files) {
                files?.forEach(async function (file) {
                    const filePath = path.join(dataset_path, file)
                    const stringJson = fs.readFileSync(filePath)
                    // const newString = stringJson.toString().replaceAll(",pid,", ",").replaceAll(",device_serial,device_number,", ",").replaceAll(`,${subject_id},`, ",").replaceAll(",A01A3A,5,", ",")
                    const newString = stringJson.toString().replaceAll(",A01525,", ",").replaceAll(",A013E1,", ",")

                    fs.writeFile(filePath, newString, (error) => {
                        if (error) {
                            console.log('An error has occurred ', error);
                            return;
                        }
                        console.log('Data written successfully to disk');
                    });
                });
            });
        })

    } catch {
        (err) => {
            console.log(err)
        }
    }
    res.status(200).json({
        data: "success"
    });
}

const importSelfAnnotation = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'dataset', 'self_annotations');
    const returnData = []
    try {
        fs.readdir(dataset_path, function (err, files) {
            files?.forEach(function (file, i) {
                const filePath = path.join(dataset_path, file)
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

                const subject_id = parseInt(file.replace("P", "").replace(".self.csv", ""))

                returnData.push({
                    category: "label",
                    subject_id,
                    columns: header,
                    rows,
                    data_type: "self_annotations",
                    dataset_name: EMOCON
                })

                if (i === files.length - 1) {
                    console.log(returnData)

                    const csvList = returnData.map(e => {
                        return new Csv({
                            dataset_name: EMOCON,
                            category: e.category,
                            subject_id: e.subject_id,
                            columns: JSON.stringify(e.columns),
                            rows: JSON.stringify(e.rows),
                            data_type: e.data_type,
                        })
                    })
                    Csv.create(csvList);

                    res.status(200).json({
                        data: Csv
                    });
                }
            });
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

const importPartnerAnnotation = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'dataset', 'partner_annotations');
    const returnData = []
    try {
        fs.readdir(dataset_path, function (err, files) {
            files?.forEach(function (file, i) {
                const filePath = path.join(dataset_path, file)
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

                const subject_id = parseInt(file.replace("P", "").replace(".partner.csv", ""))

                returnData.push({
                    category: "label",
                    subject_id,
                    columns: header,
                    rows,
                    data_type: "partner_annotations",
                    dataset_name: EMOCON
                })

                if (i === files.length - 1) {
                    const csvList = returnData.map(e => {
                        return new Csv({
                            dataset_name: e.dataset_name,
                            category: e.category,
                            subject_id: e.subject_id,
                            columns: JSON.stringify(e.columns),
                            rows: JSON.stringify(e.rows),
                            data_type: e.data_type,
                        })
                    })
                    Csv.create(csvList);

                    res.status(200).json({
                        data: Csv
                    });
                }
            });
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

const importExternalAnnotation = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'dataset', 'external_annotations');
    const returnData = []
    try {
        fs.readdir(dataset_path, function (err, files) {
            files?.forEach(function (file, i) {
                const filePath = path.join(dataset_path, file)
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

                const subject_id = parseInt(file.split(".R")[0].replace("P", ""))
                const external = file.split(".R")[1].replace(".csv", "")
                // console.log(`subject_id ${subject_id}`)
                // console.log(`external_annotations_${external}`)
                // console.log(`--------------------------------`)
                returnData.push({
                    category: "label",
                    subject_id,
                    columns: header,
                    rows,
                    data_type: `external_annotations_${external}`,
                    dataset_name: EMOCON
                })

                if (i === files.length - 1) {
                    const csvList = returnData.map(e => {
                        return new Csv({
                            dataset_name: e.dataset_name,
                            category: e.category,
                            subject_id: e.subject_id,
                            columns: JSON.stringify(e.columns),
                            rows: JSON.stringify(e.rows),
                            data_type: e.data_type,
                        })
                    })
                    Csv.create(csvList);

                    res.status(200).json({
                        data: csvList
                    });
                }
            });
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

const importNeuroSkyData = async (req, res, next) => {
    const dataset_path = path.join(__dirname, '..', '..', 'dataset', 'neurosky_polar_data');
    const returnData = []
    Array.from({ length: 32 }, (_, index) => index + 1).forEach(subject_id => {
        try {
            const folderPath = path.join(dataset_path, subject_id.toString())
            fs.readdir(folderPath, function (err, files) {
                files?.forEach(function (file, i) {
                    const filePath = path.join(folderPath, file)
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

                    // console.log(`subject_id ${subject_id}`)
                    returnData.push({
                        category: "sensor",
                        subject_id,
                        columns: header,
                        rows,
                        data_type: file.replace(".csv", ""),
                        dataset_name: EMOCON
                    })

                    if (i === files.length - 1) {
                        const csvList = returnData.map(e => {
                            return new Csv({
                                dataset_name: e.dataset_name,
                                category: e.category,
                                subject_id: e.subject_id,
                                columns: JSON.stringify(e.columns),
                                rows: JSON.stringify(e.rows),
                                data_type: e.data_type,
                            })
                        })
                        // console.log(csvList)
                        // console.log(`--------------------------------`)
                        Csv.create(csvList);
                    }
                });
            });
        } catch (err) {
            console.log(err)
            const error = new HttpError(
                'import fail',
                500
            );
            return next(error);
        }
    })
    res.status(200).json({
        data: ""
    });
}

const removeField = async (req, res, next) => {
    try {
        const update = await Csv.updateMany(
            {},
            {
                within_distribution: "",
                missingness: ""
            }
        );

        console.log(update)
    } catch {
        (err) => {
            console.log(err)
        }
    }


    res.status(201).json({
        data: "addField success"
    })
}

module.exports = {
    importData,
    importMetadata,
    importBetweenDistribution,
    addField,
    importVideo,
    removeColumn,
    importSelfAnnotation,
    importPartnerAnnotation,
    importExternalAnnotation,
    importWithinDistribution,
    importMissingness,
    importNeuroSkyData,
    removeField
}