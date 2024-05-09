const importKEmoCon = require('./kemocon')
const importKEmoPhone = require('./kemophone')

module.exports = {
    kemocon: {...importKEmoCon},
    kemophone: { ...importKEmoPhone }
}