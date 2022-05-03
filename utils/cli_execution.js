const
    showCliOutput = process.env.WRITE_CLI_OUTPUT,
    writeCliErrors = process.env.WRITE_CLI_ERRORS,
    {performance} = require('perf_hooks'),
    debug = require('debug')(process.env.DEBUG_NAMESPACE),
    { exec } = require("child_process");

const defaultErrorMessageForCommand = "Something went wrong, while executing cli command"

function writeErrorLog(errorIn, stackTrace){
    if(writeCliErrors){
        debug('----------------------- Error Begin -----------------------'.red)
        debug(`Error in: ${errorIn}`.red)
        debug(stackTrace)
        debug('----------------------- Error End -----------------------'.red)
    }
}

async function executeCLI(command, name, errorMessage){
    let startTime = performance.now();
    try {
        return await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    writeErrorLog(name,error.message)
                    reject(new Error(errorMessage || defaultErrorMessageForCommand))
                }
                else if (stderr) {
                    writeErrorLog(`${name}:stderr`,stderr)
                    reject(new Error(errorMessage || defaultErrorMessageForCommand))
                }
                else {
                    if(showCliOutput){
                        debug(`-------- OUTPUT FOR ${name} BEGIN --------`)
                        debug(`stdout: ${stdout}`);
                        debug(`-------- OUTPUT FOR ${name} END --------`)
                    }
                    resolve(true);
                }
            });
        })
    }
    catch (e){
        return e.hasOwnProperty('message') ? new Error(e.message) : new Error(defaultErrorMessageForCommand)
    }
    finally {
        let endTime = performance.now();
        debug(`Command take ${endTime - startTime} ms time to complete`)
        //Log this time and command
    }
}

module.exports = {
    executeCLI
}
