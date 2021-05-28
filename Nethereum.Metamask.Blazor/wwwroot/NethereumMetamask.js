
window.onload = function () {
    window.BRZERC20ContractAddress = "0xcB70C582E25d0873F75426Df4ecD520765A63944";
    window.BRZBEP20ContractAddress = "0x0Aa7dc355FaFAe3f51e92B792e7CFc7C23C9a033";

    const Web3Modal = window.Web3Modal.default;
    const WalletConnectProvider = window.WalletConnectProvider.default;

    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available
    if (location.protocol !== 'https:') {
        return;
    }

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                rpc: {
                    1: "https://mainnet.infura.io/v3/c93bdd5785c84ab2bc9ce69855bb23b8",
                    3: "https://ropsten.infura.io/v3/c93bdd5785c84ab2bc9ce69855bb23b8",
                    4: "https://rinkeby.infura.io/v3/c93bdd5785c84ab2bc9ce69855bb23b8",
                    56: "https://bsc-dataseed1.binance.org:443",
                    97: "https://data-seed-prebsc-1-s1.binance.org:8545"
                },
            }
        }
    };

    window.web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

}

window.NethereumMetamaskInterop = {
    FetchAccountData: async () => {
        // Get connected chain id from Ethereum node
        const chainId = await window.web3.eth.getChainId();
        let chainIdHex = "";
        if (Number.isInteger(chainId)) {
            chainIdHex = "0x" + chainId.toString(16);
        }
        else {
            chainIdHex = chainId;
        }
        console.log(chainIdHex);

        let contractAddress = "";
        if (chainIdHex == "0x4") {
            contractAddress = window.BRZERC20ContractAddress;
        } else if (chainIdHex == "0x61") {
            contractAddress = window.BRZBEP20ContractAddress;
        } else {
            console.error("Unsupported network");
            return;
        }

        var BRZContract = new window.web3.eth.Contract(BRZAbi, contractAddress);

        let selectedAddress = "";
        if (window.provider.selectedAddress) {
            selectedAddress = window.provider.selectedAddress;
        } else {
            selectedAddress = window.provider.accounts[0];
        }
        console.log(selectedAddress);
        window.selectedAddress = selectedAddress;
        DotNet.invokeMethodAsync('Nethereum.Metamask.Blazor', 'SelectedAccountChanged', selectedAddress);

        BRZContract.methods.balanceOf(window.selectedAddress).call()
            .then((balance) => {
                BRZContract.methods.decimals().call((error, decimals) => {
                    const friendlyBalance = parseFloat(balance) / (10 ** parseInt(decimals));
                    console.log(friendlyBalance);
                });
            })
            .catch((error) => {
                console.error(error.reason);
            });

        DotNet.invokeMethodAsync('Nethereum.Metamask.Blazor', 'ProviderSelectedChanged', true);
    },
    OnConnect: async () => {
        try {
            window.provider = await window.web3Modal.connect();
            window.web3 = new Web3(window.provider);
            await this.NethereumMetamaskInterop.FetchAccountData();
        } catch (e) {
            console.log("Could not get a wallet connection", e);
            return;
        }

        // Subscribe to accounts change
        window.provider.on("accountsChanged", async (accounts) => {
            await this.NethereumMetamaskInterop.FetchAccountData();
        });

        // Subscribe to chainId change
        window.provider.on("chainChanged", async (chainId) => {
            await this.NethereumMetamaskInterop.FetchAccountData();
        });

        // Subscribe to session disconnection
        //window.provider.on('disconnect', () => {
        //    OnDisconnect();
        //})

        return window.selectedAddress;

    },
    OnDisconnect: async () => {
        console.log("Killing the wallet connection", provider);

        if (window.provider.disconnect) {
            await window.provider.disconnect();
            await web3Modal.clearCachedProvider();
        }

        window.provider = null;
        DotNet.invokeMethodAsync('Nethereum.Metamask.Blazor', 'ProviderSelectedChanged', false);
        window.selectedAddress = null;
        DotNet.invokeMethodAsync('Nethereum.Metamask.Blazor', 'SelectedAccountChanged', null);
    },
    IsProviderSelected: () => {
        if (window.provider) return true;
        return false;
    },
    GetSelectedAddress: () => {
        return window.selectedAddress;
    },
    Request: async (message) => {
        try {

            let parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
            const response = await ethereum.request(parsedMessage);
            let rpcResonse = {
                jsonrpc: "2.0",
                result: response,
                id: parsedMessage.id,
                error: null
            }
            console.log(rpcResonse);

            return JSON.stringify(rpcResonse);
        } catch (e) {
            let rpcResonseError = {
                jsonrpc: "2.0",
                id: parsedMessage.id,
                error: {
                    message: e,
                }
            }
            return JSON.stringify(rpcResonseError);
        }
    },

    Send: async (message) => {
        return new Promise(function (resolve, reject) {
            console.log(JSON.parse(message));
            ethereum.send(JSON.parse(message), function (error, result) {
                console.log(result);
                console.log(error);
                resolve(JSON.stringify(result));
            });
        });
    },

    Sign: async (utf8HexMsg) => {
        return new Promise(function (resolve, reject) {
            const from = ethereum.selectedAddress;
            const params = [utf8HexMsg, from];
            const method = 'personal_sign';
            ethereum.send({
                method,
                params,
                from,
            }, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    console.log(result.result);
                    resolve(JSON.stringify(result.result));
                }

            });
        });
    }

}