const EMOCON = "k-emocon"
const EMOPHONE = "k-emophone"

const DATA_TYPES = {
    [EMOCON]: ['E4_ACC', 'E4_BVP', 'E4_EDA', 'E4_HR', 'E4_IBI', 'E4_TEMP', 'Polar_HR']
}

const SUBJECT_IDS = {
    [EMOCON]: [1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
}


module.exports = {
    EMOCON,
    EMOPHONE,
    DATA_TYPES,
    SUBJECT_IDS
};