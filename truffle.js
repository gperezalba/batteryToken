
module.exports = {

  networks: {
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },

     unir: {
       host: "138.4.143.82",
       port: 8545, //o 21000 
       gas: 8500000,
       network_id: "*",
       gas: 0xfffff,
       gasPrice: 0x0,
       //from:
     },

     general1: {
        host: "127.0.0.1",     // Localhost (default: none)
        port: 22001,            // Standard Ethereum port (default: none)
        network_id: "*",       // Any network (default: none)
        gas: 0xfffff,
        gasPrice: 0x0,
        from: "0x74d4c56d8dcbc10a567341bfac6da0a8f04dc41d"
     },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
}
