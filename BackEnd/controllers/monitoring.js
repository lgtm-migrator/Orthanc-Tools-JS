var CdBurnerFactory = require('../model/monitoring/cdburner/CdBurnerFactory')
var AutoroutingFactory = require('../model/monitoring/autorouting/AutoroutingFactory')

var startBurner = async function(req, res) {
    let cdBurnerInstance = await CdBurnerFactory.getInstance()
    await cdBurnerInstance.setSettings()
    await cdBurnerInstance.startCDMonitoring()
    res.status(200)
}

var getBurner = async function(req, res) {
    let cdBurnerInstance = await CdBurnerFactory.getInstance()
    res.json(cdBurnerInstance)
}

var stopBurner = async function (req, res){
    let cdBurnerInstance = await CdBurnerFactory.getInstance()
    await cdBurnerInstance.stopCDMonitoring()
    res.status(200)
}

var cancelJobBurner = async function(req, res){
    let cdBurnerInstance = await CdBurnerFactory.getInstance()
    cdBurnerInstance.cancelCdJob(req.params.jobBurnerId)
    res.status(200)
}

var startAutorouter = async function (req,res){
    let autorouterInstance = await AutoroutingFactory.getInstance()
    await autorouterInstance.startAutorouting()
    res.status(200)
}

var getAutorouter = async function (req,res){
    let autorouterInstance = await AutoroutingFactory.getInstance()
    res.json(autorouterInstance)
}

var stopAutorouter = async function(req,res){
    let autorouterInstance = await AutoroutingFactory.getInstance()
    await autorouterInstance.stopAutorouting()
    res.status(200)
}

module.exports = { startBurner, getBurner, stopBurner, cancelJobBurner , startAutorouter, getAutorouter, stopAutorouter}