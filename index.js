// Export the contents of lib/ or lib-cov/ depending on the COVERAGE
// environment variable.
module.exports = process.env.COVERAGE ? require('./lib-cov') :
                                        require('./lib');
